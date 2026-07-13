import type { Anomaly, Env } from "./types";

export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

export async function sendTelegramMessage(env: Env, text: string): Promise<void> {
  const truncated =
    text.length > TELEGRAM_MAX_MESSAGE_LENGTH
      ? text.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - 20) + "\n… (truncado)"
      : text;

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: truncated,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API respondió ${res.status}: ${body}`);
  }
}

const SOURCE_LABEL: Record<Anomaly["source"], string> = {
  poll: "🔎 Monitoreo propio (polling)",
  webhook: "☁️ Cloudflare Notifications",
};

export function formatAnomalyMessage(anomaly: Anomaly): string {
  const lines = [
    `⚠️ <b>${escapeHtml(anomaly.title)}</b>`,
    `Recurso: <code>${escapeHtml(anomaly.resource)}</code>`,
    `Origen: ${SOURCE_LABEL[anomaly.source]}`,
  ];

  for (const [key, value] of Object.entries(anomaly.details)) {
    lines.push(`${escapeHtml(key)}: <code>${escapeHtml(value)}</code>`);
  }

  return lines.join("\n");
}
