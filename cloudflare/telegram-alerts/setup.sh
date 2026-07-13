#!/usr/bin/env bash
#
# setup.sh — Configura y despliega el Worker telegram-alerts en TU Mac.
#
# Corre esto UNA vez, dentro de la carpeta cloudflare/telegram-alerts/, en una
# Mac donde ya iniciaste sesión con `wrangler login`. El script:
#   1. Instala dependencias (npm install).
#   2. Descubre automáticamente tu Account ID y los Zone IDs de tus dominios
#      usando tu Cloudflare API Token (aquí sí hay acceso a la API).
#   3. Crea el KV namespace para los cooldowns.
#   4. Rellena wrangler.toml con esos IDs.
#   5. Guarda los 4 secrets con `wrangler secret put`.
#   6. Despliega el Worker.
#
# Nada sensible queda escrito en el repo: los secrets van cifrados vía wrangler,
# y los IDs (cuenta/zona/KV) no son secretos.

set -euo pipefail

DOMAIN_1="oficioslocalesmx.com"
DOMAIN_2="contandohistoriaspodcast.com"
CF_API="https://api.cloudflare.com/client/v4"

cd "$(dirname "$0")"

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!  %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31mERROR: %s\033[0m\n' "$1" >&2; exit 1; }

# Extrae el primer id de 32 hex de un texto (sirve para account/zone/KV IDs).
first_hex32() { grep -oE '[0-9a-f]{32}' | head -1 || true; }

command -v node >/dev/null     || die "Necesitas Node.js instalado."
command -v npx  >/dev/null     || die "Necesitas npx (viene con Node)."
command -v curl >/dev/null     || die "Necesitas curl."

WRANGLER="npx --yes wrangler@3"

say "1/6 Instalando dependencias (npm install)…"
npm install

# --- Pedir el API token de Cloudflare -------------------------------------
say "2/6 Descubriendo tu Account ID y Zone IDs…"
if [ -z "${CF_API_TOKEN:-}" ]; then
  printf 'Pega tu Cloudflare API Token (solo lectura): '
  read -rs CF_API_TOKEN
  printf '\n'
fi
[ -n "$CF_API_TOKEN" ] || die "No diste el API token."

auth=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")

# Verificar token
verify="$(curl -sS "${auth[@]}" "${CF_API}/user/tokens/verify" || true)"
echo "$verify" | grep -q '"status":"active"' \
  || die "El API token no es válido o está inactivo. Revisa que lo copiaste completo."
echo "   Token válido ✔"

# Account ID
ACCOUNT_ID="$(curl -sS "${auth[@]}" "${CF_API}/accounts" | first_hex32)"
[ -n "$ACCOUNT_ID" ] || die "No pude obtener el Account ID. ¿El token tiene permiso de Account?"
echo "   Account ID: ${ACCOUNT_ID}"

# Zone IDs
ZONE_1="$(curl -sS "${auth[@]}" "${CF_API}/zones?name=${DOMAIN_1}" | first_hex32)"
ZONE_2="$(curl -sS "${auth[@]}" "${CF_API}/zones?name=${DOMAIN_2}" | first_hex32)"
[ -n "$ZONE_1" ] || warn "No encontré la zona ${DOMAIN_1} (¿el token cubre esa zona?). Podrás editarlo luego en wrangler.toml."
[ -n "$ZONE_2" ] || warn "No encontré la zona ${DOMAIN_2} (¿el token cubre esa zona?). Podrás editarlo luego en wrangler.toml."
echo "   ${DOMAIN_1}: ${ZONE_1:-<pendiente>}"
echo "   ${DOMAIN_2}: ${ZONE_2:-<pendiente>}"

# --- Crear KV namespace ----------------------------------------------------
say "3/6 Creando (o reutilizando) el KV namespace…"
KV_ID="$(grep -E '^id\s*=' wrangler.toml | first_hex32 || true)"
if [ -n "$KV_ID" ]; then
  echo "   Ya había un KV id en wrangler.toml (${KV_ID}); lo reutilizo."
else
  kv_out="$(${WRANGLER} kv namespace create telegram-alerts-kv 2>&1 || true)"
  echo "$kv_out"
  KV_ID="$(echo "$kv_out" | grep -iE 'id\s*=' | first_hex32 || true)"
  [ -n "$KV_ID" ] || die "No pude leer el id del KV namespace de la salida de wrangler. Créalo a mano y pega el id en wrangler.toml."
  echo "   KV namespace ID: ${KV_ID}"
fi

# --- Rellenar wrangler.toml -----------------------------------------------
say "4/6 Escribiendo los IDs en wrangler.toml…"
patch() { # patch <buscar> <reemplazar>
  local tmp; tmp="$(mktemp)"
  sed "s|$1|$2|g" wrangler.toml > "$tmp" && mv "$tmp" wrangler.toml
}
patch "REEMPLAZA_CON_TU_KV_NAMESPACE_ID" "$KV_ID"
patch "REEMPLAZA_CON_TU_ACCOUNT_ID" "$ACCOUNT_ID"
[ -n "$ZONE_1" ] && patch "${DOMAIN_1}:REEMPLAZA_ZONE_ID" "${DOMAIN_1}:${ZONE_1}"
[ -n "$ZONE_2" ] && patch "${DOMAIN_2}:REEMPLAZA_ZONE_ID" "${DOMAIN_2}:${ZONE_2}"
echo "   wrangler.toml actualizado ✔"

# --- Secrets ---------------------------------------------------------------
say "5/6 Guardando los secrets (cifrados en Cloudflare)…"

put_secret() { # put_secret <NOMBRE> <valor>
  printf '%s' "$2" | ${WRANGLER} secret put "$1"
}

# Telegram bot token
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  printf 'TELEGRAM_BOT_TOKEN (de @BotFather): '
  read -rs TELEGRAM_BOT_TOKEN; printf '\n'
fi
put_secret TELEGRAM_BOT_TOKEN "$TELEGRAM_BOT_TOKEN"

# Telegram chat id
if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  printf 'TELEGRAM_CHAT_ID: '
  read -r TELEGRAM_CHAT_ID
fi
put_secret TELEGRAM_CHAT_ID "$TELEGRAM_CHAT_ID"

# CF API token (el mismo que ya usamos arriba)
put_secret CF_API_TOKEN "$CF_API_TOKEN"

# Webhook shared secret — se autogenera si no lo das
if [ -z "${WEBHOOK_SHARED_SECRET:-}" ]; then
  if command -v openssl >/dev/null; then
    WEBHOOK_SHARED_SECRET="$(openssl rand -hex 24)"
    echo "   Generé un WEBHOOK_SHARED_SECRET aleatorio."
  else
    printf 'WEBHOOK_SHARED_SECRET (elige uno largo): '
    read -rs WEBHOOK_SHARED_SECRET; printf '\n'
  fi
fi
put_secret WEBHOOK_SHARED_SECRET "$WEBHOOK_SHARED_SECRET"

# --- Deploy ----------------------------------------------------------------
say "6/6 Desplegando el Worker…"
${WRANGLER} deploy

cat <<EOF

============================================================
✅ Listo. El Worker telegram-alerts está desplegado.

Tu URL de webhook para las Notifications de Cloudflare es:

   https://telegram-alerts.<TU-SUBDOMINIO>.workers.dev/webhook/${WEBHOOK_SHARED_SECRET}

(el <TU-SUBDOMINIO> aparece en la salida de 'wrangler deploy' de arriba)

Guárdala: la vas a pegar en el dashboard de Cloudflare, en
Notifications -> Add -> destino "Webhook", para cada alerta que
quieras (Health Checks, SSL, errores 5xx, seguridad, facturación).
Ver el checklist completo en README.md.

Prueba rápida de que Telegram funciona:
   curl -X POST "https://telegram-alerts.<TU-SUBDOMINIO>.workers.dev/test-telegram" \\
     -H "X-Webhook-Secret: ${WEBHOOK_SHARED_SECRET}"
============================================================
EOF
