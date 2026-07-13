import { fetchWorkerStats, fetchZoneStats } from "./cloudflareGraphQL";
import {
  getErrorRateThresholdPct,
  getMinRequestsForRateCheck,
  getMonitoredWorkers,
  getMonitoredZones,
  getSilenceCheckWorkers,
  getSilenceCheckZones,
} from "./config";
import type { Anomaly, Env } from "./types";

const POLL_WINDOW_MINUTES = 10;

function windowRange(): { since: Date; until: Date } {
  const until = new Date();
  const since = new Date(until.getTime() - POLL_WINDOW_MINUTES * 60 * 1000);
  return { since, until };
}

export async function pollWorkers(env: Env): Promise<Anomaly[]> {
  const monitored = getMonitoredWorkers(env);
  if (monitored.length === 0) return [];

  const { since, until } = windowRange();
  const stats = await fetchWorkerStats(env, since, until);
  const threshold = getErrorRateThresholdPct(env);
  const minRequests = getMinRequestsForRateCheck(env);
  const silenceWorkers = new Set(getSilenceCheckWorkers(env));

  const anomalies: Anomaly[] = [];

  for (const name of monitored) {
    const stat = stats.get(name) ?? { requests: 0, errors: 0 };

    if (stat.requests === 0) {
      if (silenceWorkers.has(name)) {
        anomalies.push({
          source: "poll",
          type: "worker-silent",
          resource: name,
          title: `Worker "${name}" sin tráfico`,
          details: {
            ventana_min: POLL_WINDOW_MINUTES,
            requests: 0,
          },
        });
      }
      continue;
    }

    const errorRatePct = (stat.errors / stat.requests) * 100;
    if (stat.requests >= minRequests && errorRatePct >= threshold) {
      anomalies.push({
        source: "poll",
        type: "high-error-rate",
        resource: name,
        title: `Tasa de errores elevada en "${name}"`,
        details: {
          ventana_min: POLL_WINDOW_MINUTES,
          requests: stat.requests,
          errors: stat.errors,
          tasa_error: `${errorRatePct.toFixed(1)}%`,
          umbral: `${threshold}%`,
        },
      });
    }
  }

  return anomalies;
}

export async function pollZones(env: Env): Promise<Anomaly[]> {
  const zones = getMonitoredZones(env);
  if (zones.length === 0) return [];

  const { since, until } = windowRange();
  const threshold = getErrorRateThresholdPct(env);
  const minRequests = getMinRequestsForRateCheck(env);
  const silenceZones = new Set(getSilenceCheckZones(env));

  const anomalies: Anomaly[] = [];

  for (const zone of zones) {
    const stat = await fetchZoneStats(env, zone.zoneId, since, until);

    if (stat.totalRequests === 0) {
      if (silenceZones.has(zone.domain)) {
        anomalies.push({
          source: "poll",
          type: "zone-silent",
          resource: zone.domain,
          title: `Dominio "${zone.domain}" sin tráfico`,
          details: {
            ventana_min: POLL_WINDOW_MINUTES,
            requests: 0,
          },
        });
      }
      continue;
    }

    const errorRatePct = (stat.serverErrorRequests / stat.totalRequests) * 100;
    if (stat.totalRequests >= minRequests && errorRatePct >= threshold) {
      anomalies.push({
        source: "poll",
        type: "high-5xx-rate",
        resource: zone.domain,
        title: `Tasa de errores 5xx elevada en "${zone.domain}"`,
        details: {
          ventana_min: POLL_WINDOW_MINUTES,
          requests: stat.totalRequests,
          errores_5xx: stat.serverErrorRequests,
          tasa_error: `${errorRatePct.toFixed(1)}%`,
          umbral: `${threshold}%`,
        },
      });
    }
  }

  return anomalies;
}
