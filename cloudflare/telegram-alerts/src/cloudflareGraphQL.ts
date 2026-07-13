import type { Env, GraphQLResponse, HttpRequestsGroup, WorkersInvocationsGroup } from "./types";

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

async function runGraphQLQuery<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Cloudflare GraphQL API respondió ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Cloudflare GraphQL API devolvió errores: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Cloudflare GraphQL API no devolvió `data`.");
  }
  return json.data;
}

interface WorkersStatsResponse {
  viewer: {
    accounts: Array<{
      workersInvocationsAdaptiveGroups: WorkersInvocationsGroup[];
    }>;
  };
}

const WORKERS_STATS_QUERY = `
  query WorkerStats($accountTag: String!, $since: Time!, $until: Time!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        workersInvocationsAdaptiveGroups(
          limit: 1000
          filter: { datetime_geq: $since, datetime_leq: $until }
        ) {
          dimensions { scriptName }
          sum { requests errors }
        }
      }
    }
  }
`;

/** Suma requests/errors por scriptName en la ventana [since, until). */
export async function fetchWorkerStats(
  env: Env,
  since: Date,
  until: Date,
): Promise<Map<string, { requests: number; errors: number }>> {
  const data = await runGraphQLQuery<WorkersStatsResponse>(env, WORKERS_STATS_QUERY, {
    accountTag: env.CF_ACCOUNT_ID,
    since: since.toISOString(),
    until: until.toISOString(),
  });

  const groups = data.viewer.accounts[0]?.workersInvocationsAdaptiveGroups ?? [];
  const byScript = new Map<string, { requests: number; errors: number }>();
  for (const group of groups) {
    const name = group.dimensions.scriptName;
    const prev = byScript.get(name) ?? { requests: 0, errors: 0 };
    byScript.set(name, {
      requests: prev.requests + (group.sum.requests ?? 0),
      errors: prev.errors + (group.sum.errors ?? 0),
    });
  }
  return byScript;
}

interface ZoneStatsResponse {
  viewer: {
    zones: Array<{
      zoneTag: string;
      httpRequestsAdaptiveGroups: HttpRequestsGroup[];
    }>;
  };
}

const ZONE_STATS_QUERY = `
  query ZoneStats($zoneTag: String!, $since: Time!, $until: Time!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        zoneTag
        httpRequestsAdaptiveGroups(
          limit: 1000
          filter: { datetime_geq: $since, datetime_leq: $until, edgeResponseStatus_geq: 500 }
        ) {
          dimensions { zoneTag }
          sum { requests }
        }
      }
    }
  }
`;

const ZONE_TOTAL_QUERY = `
  query ZoneTotal($zoneTag: String!, $since: Time!, $until: Time!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        zoneTag
        httpRequestsAdaptiveGroups(
          limit: 1000
          filter: { datetime_geq: $since, datetime_leq: $until }
        ) {
          dimensions { zoneTag }
          sum { requests }
        }
      }
    }
  }
`;

/** Devuelve { totalRequests, serverErrorRequests (5xx) } para una zona en la ventana dada. */
export async function fetchZoneStats(
  env: Env,
  zoneId: string,
  since: Date,
  until: Date,
): Promise<{ totalRequests: number; serverErrorRequests: number }> {
  const variables = { zoneTag: zoneId, since: since.toISOString(), until: until.toISOString() };

  const [totalData, errorData] = await Promise.all([
    runGraphQLQuery<ZoneStatsResponse>(env, ZONE_TOTAL_QUERY, variables),
    runGraphQLQuery<ZoneStatsResponse>(env, ZONE_STATS_QUERY, variables),
  ]);

  const sumRequests = (resp: ZoneStatsResponse) =>
    (resp.viewer.zones[0]?.httpRequestsAdaptiveGroups ?? []).reduce(
      (acc, g) => acc + (g.sum.requests ?? 0),
      0,
    );

  return {
    totalRequests: sumRequests(totalData),
    serverErrorRequests: sumRequests(errorData),
  };
}
