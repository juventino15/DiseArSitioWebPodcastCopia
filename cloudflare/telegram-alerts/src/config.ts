import type { Env, MonitoredZone } from "./types";

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function getMonitoredWorkers(env: Env): string[] {
  return splitCsv(env.MONITORED_WORKERS);
}

export function getSilenceCheckWorkers(env: Env): string[] {
  return splitCsv(env.SILENCE_CHECK_WORKERS);
}

export function getSilenceCheckZones(env: Env): string[] {
  return splitCsv(env.SILENCE_CHECK_ZONES);
}

export function getMonitoredZones(env: Env): MonitoredZone[] {
  return splitCsv(env.MONITORED_ZONES)
    .map((entry) => {
      const [domain, zoneId] = entry.split(":").map((s) => s.trim());
      return { domain, zoneId };
    })
    .filter((z): z is MonitoredZone => Boolean(z.domain && z.zoneId));
}

export function getErrorRateThresholdPct(env: Env): number {
  return Number(env.ERROR_RATE_THRESHOLD_PCT) || 5;
}

export function getMinRequestsForRateCheck(env: Env): number {
  return Number(env.MIN_REQUESTS_FOR_RATE_CHECK) || 10;
}

export function getAlertCooldownSeconds(env: Env): number {
  const minutes = Number(env.ALERT_COOLDOWN_MINUTES) || 30;
  return minutes * 60;
}

export function getSilenceThresholdMinutes(env: Env): number {
  return Number(env.SILENCE_THRESHOLD_MINUTES) || 60;
}
