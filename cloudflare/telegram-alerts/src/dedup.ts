import type { Env } from "./types";

/**
 * Devuelve true la primera vez que se llama con una `key` dada, y false en
 * llamadas subsecuentes mientras la entrada siga viva en KV. Usa el TTL
 * nativo de KV (expirationTtl) para el cooldown, así que no hace falta
 * limpiar nada manualmente.
 */
export async function shouldSend(env: Env, key: string, cooldownSeconds: number): Promise<boolean> {
  const existing = await env.ALERTS_KV.get(key);
  if (existing) return false;

  await env.ALERTS_KV.put(key, String(Date.now()), {
    expirationTtl: Math.max(cooldownSeconds, 60),
  });
  return true;
}
