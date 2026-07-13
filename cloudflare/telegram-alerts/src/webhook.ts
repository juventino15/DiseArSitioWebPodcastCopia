import type { Anomaly, CloudflareNotificationPayload, Env } from "./types";

/** Comparación en tiempo constante para no filtrar el secreto por timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function isValidWebhookSecret(env: Env, providedSecret: string): boolean {
  if (!env.WEBHOOK_SHARED_SECRET) return false;
  return timingSafeEqual(providedSecret, env.WEBHOOK_SHARED_SECRET);
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Cloudflare Notifications no tiene un único esquema de payload: varía según
 * el tipo de alerta (Health Check, SSL, Security Events, Billing, etc.).
 * Extraemos los campos más comunes de forma defensiva y, si no reconocemos
 * la forma, mandamos el JSON completo (truncado) para no perder información.
 */
export async function buildAnomalyFromWebhookPayload(payload: CloudflareNotificationPayload): Promise<Anomaly> {
  const alertType = payload.alert_type ?? payload.name ?? "Notificación de Cloudflare";
  const text = payload.text ?? "";

  const details: Record<string, string | number> = {};
  if (payload.ts) details["fecha"] = payload.ts;

  if (text) {
    details["mensaje"] = text;
  } else if (payload.data && typeof payload.data === "object") {
    const raw = JSON.stringify(payload.data);
    details["data"] = raw.length > 500 ? raw.slice(0, 500) + "…" : raw;
  } else {
    const raw = JSON.stringify(payload);
    details["payload"] = raw.length > 500 ? raw.slice(0, 500) + "…" : raw;
  }

  const resource =
    (typeof payload.data?.["zone_name"] === "string" && (payload.data["zone_name"] as string)) ||
    (typeof payload.data?.["resource"] === "string" && (payload.data["resource"] as string)) ||
    "cuenta de Cloudflare";

  const dedupSource = `${alertType}:${resource}:${text}`;
  const dedupHash = await sha256Hex(dedupSource || JSON.stringify(payload));

  return {
    source: "webhook",
    type: `webhook:${dedupHash.slice(0, 12)}`,
    resource,
    title: String(alertType),
    details,
  };
}
