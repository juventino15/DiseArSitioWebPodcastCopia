import { pollWorkers, pollZones } from "./analytics";
import { getAlertCooldownSeconds } from "./config";
import { shouldSend } from "./dedup";
import { formatAnomalyMessage, sendTelegramMessage } from "./telegram";
import type { Anomaly, Env } from "./types";
import { buildAnomalyFromWebhookPayload, isValidWebhookSecret } from "./webhook";

async function dispatchAnomaly(env: Env, anomaly: Anomaly): Promise<void> {
  const cooldownSeconds = getAlertCooldownSeconds(env);
  const key = `cooldown:${anomaly.source}:${anomaly.type}:${anomaly.resource}`;

  const send = await shouldSend(env, key, cooldownSeconds);
  if (!send) return;

  await sendTelegramMessage(env, formatAnomalyMessage(anomaly));
}

async function handleWebhook(request: Request, env: Env, secret: string): Promise<Response> {
  if (!isValidWebhookSecret(env, secret)) {
    return new Response("Forbidden", { status: 403 });
  }
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return new Response("Bad Request: expected JSON body", { status: 400 });
  }

  try {
    const anomaly = await buildAnomalyFromWebhookPayload(payload);
    await dispatchAnomaly(env, anomaly);
  } catch (err) {
    console.error("Error procesando webhook de Cloudflare Notifications:", (err as Error).message);
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

async function handleTestTelegram(request: Request, env: Env): Promise<Response> {
  const secret = request.headers.get("X-Webhook-Secret") ?? "";
  if (!isValidWebhookSecret(env, secret)) {
    return new Response("Forbidden", { status: 403 });
  }

  await sendTelegramMessage(
    env,
    "✅ Prueba manual: el Worker telegram-alerts puede enviar mensajes a este chat.",
  );
  return new Response("ok", { status: 200 });
}

async function runPollingCycle(env: Env): Promise<void> {
  try {
    const [workerAnomalies, zoneAnomalies] = await Promise.all([pollWorkers(env), pollZones(env)]);
    for (const anomaly of [...workerAnomalies, ...zoneAnomalies]) {
      await dispatchAnomaly(env, anomaly);
    }
  } catch (err) {
    console.error("Error en el ciclo de polling:", (err as Error).message);
    const selfFailureCooldownSeconds = 30 * 60;
    const send = await shouldSend(env, "cooldown:self:failure", selfFailureCooldownSeconds);
    if (send) {
      try {
        await sendTelegramMessage(
          env,
          `⚠️ <b>El monitor de anomalías falló</b>\nEl ciclo de polling de telegram-alerts tuvo un error: <code>${(err as Error).message}</code>`,
        );
      } catch (notifyErr) {
        console.error("Además falló el aviso de auto-monitoreo:", (notifyErr as Error).message);
      }
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    if (url.pathname.startsWith("/webhook/")) {
      const secret = url.pathname.slice("/webhook/".length);
      return handleWebhook(request, env, secret);
    }

    if (url.pathname === "/test-telegram" && request.method === "POST") {
      return handleTestTelegram(request, env);
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runPollingCycle(env));
  },
};
