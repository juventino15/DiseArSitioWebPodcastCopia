export interface Env {
  ALERTS_KV: KVNamespace;

  MONITORED_WORKERS: string;
  MONITORED_ZONES: string;
  ERROR_RATE_THRESHOLD_PCT: string;
  MIN_REQUESTS_FOR_RATE_CHECK: string;
  ALERT_COOLDOWN_MINUTES: string;
  SILENCE_CHECK_WORKERS: string;
  SILENCE_THRESHOLD_MINUTES: string;
  SILENCE_CHECK_ZONES: string;
  CF_ACCOUNT_ID: string;

  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  CF_API_TOKEN: string;
  WEBHOOK_SHARED_SECRET: string;
}

export type AnomalySource = "poll" | "webhook";

export interface Anomaly {
  source: AnomalySource;
  /** Corto identificador estable usado para la clave de dedup, ej. "high-error-rate" */
  type: string;
  /** Nombre del recurso afectado (worker script name o dominio) */
  resource: string;
  /** Texto ya formateado listo para mandar (sin HTML-escapar todavía) */
  title: string;
  details: Record<string, string | number>;
}

export interface MonitoredZone {
  domain: string;
  zoneId: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface WorkersInvocationsGroup {
  dimensions: { scriptName: string };
  sum: { requests: number; errors: number };
}

export interface HttpRequestsGroup {
  dimensions: { zoneTag: string };
  sum: { requests: number };
  avg?: { edgeResponseTimeMs?: number };
}

/**
 * Forma esperada del payload que Cloudflare Notifications envía al
 * destino "Webhook". El esquema exacto varía según el tipo de alerta,
 * así que todos los campos son opcionales y el handler cae a un
 * volcado genérico si no reconoce la forma.
 */
export interface CloudflareNotificationPayload {
  name?: string;
  alert_type?: string;
  text?: string;
  ts?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}
