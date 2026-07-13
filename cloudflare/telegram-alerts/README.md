# telegram-alerts

Worker de Cloudflare que envía a Telegram cualquier anomalía detectada en tu
cuenta de Cloudflare: los dominios `oficioslocalesmx.com` y
`contandohistoriaspodcast.com`, y los Workers `reviews-api`,
`dalton-seminuevos` y `financy-worker`.

## Cómo funciona

Dos fuentes de alerta, un mismo destino (Telegram):

1. **Notifications nativas de Cloudflare → webhook** (`POST /webhook/<secret>`).
   Tú configuras en el dashboard de Cloudflare qué quieres vigilar (caída del
   sitio, certificado SSL, picos de errores, eventos de seguridad,
   facturación...) y Cloudflare avisa a este Worker, que traduce el aviso y
   lo manda a tu Telegram. **Esta es la vía principal** — deja que Cloudflare
   haga la detección.
2. **Polling propio de respaldo** (cron cada 5 minutos). Este Worker consulta
   la API de Analytics (GraphQL) de Cloudflare y revisa tasa de errores y
   tráfico de tus 2 dominios y 3 Workers, por si algo no está cubierto por
   las Notifications nativas (por ejemplo, porque tu plan no incluye cierto
   tipo de alerta).

Todas las alertas pasan por un cooldown (por defecto 30 min) para no
saturarte de mensajes repetidos.

## 1. Crear el bot de Telegram

1. Abre Telegram y busca **@BotFather**.
2. Envíale `/newbot` y sigue las instrucciones (nombre y username del bot).
3. BotFather te dará un **token** con forma `123456789:AA...` — guárdalo,
   es tu `TELEGRAM_BOT_TOKEN`.
4. Envíale un mensaje cualquiera a tu bot nuevo (o añádelo a un grupo/canal
   y escribe algo ahí) para que Telegram registre esa conversación.
5. Obtén el **chat ID**:
   ```bash
   curl "https://api.telegram.org/bot<TU_TOKEN>/getUpdates"
   ```
   Busca en la respuesta `"chat":{"id": ...}` — ese número es tu
   `TELEGRAM_CHAT_ID` (si es un grupo, será negativo, eso es normal).
6. Verifica que funciona antes de tocar el Worker:
   ```bash
   curl "https://api.telegram.org/bot<TU_TOKEN>/sendMessage" \
     -d chat_id=<TU_CHAT_ID> \
     -d text="prueba"
   ```
   Si te llega el mensaje "prueba" en Telegram, el bot está listo.

## 2. Crear un API Token de Cloudflare (solo lectura)

Dashboard de Cloudflare → ícono de perfil → **My Profile → API Tokens →
Create Token → Create Custom Token**. Dale estos permisos (todos en modo
"Read", no "Edit"):

- **Account → Account Analytics → Read**
- **Account → Workers Scripts → Read**
- **Zone → Analytics → Read** (aplícalo a las zonas `oficioslocalesmx.com`
  y `contandohistoriaspodcast.com`, o a "All zones" si prefieres no
  limitarlo)

Guarda el token generado — es tu `CF_API_TOKEN`.

También necesitas tu **Account ID**: aparece en la barra lateral derecha de
cualquier dominio en el dashboard, o en Workers & Pages → Overview.

## 3. Configurar el proyecto

```bash
cd cloudflare/telegram-alerts
npm install

# Namespace de KV para los cooldowns de alertas
npx wrangler kv namespace create telegram-alerts-kv
```

Copia el `id` que te devuelva el comando anterior dentro de
`wrangler.toml`, en `[[kv_namespaces]] id = "..."`.

Edita también en `wrangler.toml`:
- `CF_ACCOUNT_ID` con tu Account ID.
- `MONITORED_ZONES` con el Zone ID real de cada dominio. Para obtenerlo:
  dashboard → **Websites** → clic en `oficioslocalesmx.com` (o el otro
  dominio) → panel derecho, campo **Zone ID**. Formato final:
  ```
  MONITORED_ZONES = "oficioslocalesmx.com:abc123...,contandohistoriaspodcast.com:def456..."
  ```

Configura los secretos (no se guardan en el repo):

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put WEBHOOK_SHARED_SECRET   # invéntate un valor largo y aleatorio, ej: openssl rand -hex 24
```

Para probar en local, copia `.dev.vars.example` a `.dev.vars` y rellena los
mismos valores ahí (ese archivo está en `.gitignore`, nunca se sube).

## 4. Probar en local

```bash
npx wrangler dev
```

En otra terminal, simula un webhook de Cloudflare Notifications:

```bash
curl -X POST "http://localhost:8787/webhook/<WEBHOOK_SHARED_SECRET>" \
  -H "Content-Type: application/json" \
  -d @test/fixtures/sample-notification-payload.json
```

Debería llegarte un mensaje a Telegram. Prueba también con un secret
incorrecto y confirma que responde `403`.

Prueba el envío directo:

```bash
curl -X POST "http://localhost:8787/test-telegram" \
  -H "X-Webhook-Secret: <WEBHOOK_SHARED_SECRET>"
```

Para el cron, revisa `npx wrangler dev --help` por la bandera de disparo
manual de scheduled triggers de tu versión de Wrangler (cambia entre
versiones), o simplemente espera al despliegue y usa `wrangler tail` (paso
siguiente).

Antes de confiar en las alertas de polling, valida con el token real que las
consultas GraphQL devuelven datos (los nombres exactos de campos del
dataset de Cloudflare pueden cambiar con el tiempo):

```bash
npx wrangler dev --remote
```

y dispara el `/health` o revisa los logs mientras esperas un tick de cron.

## 5. Desplegar

```bash
npx wrangler deploy
```

Wrangler te dará la URL pública, algo como
`https://telegram-alerts.<tu-subdominio>.workers.dev`.

Verifica en producción:

```bash
npx wrangler tail
```

y en otra terminal repite el `curl` de prueba del webhook contra la URL
pública.

## 6. Configurar las Notifications nativas de Cloudflare

Esta es la parte que aprovecha las automatizaciones propias de Cloudflare.
Ve a dashboard → **Notifications → Add** y crea, para cada recurso que
aplique, una política con destino **Webhook** apuntando a:

```
https://telegram-alerts.<tu-subdominio>.workers.dev/webhook/<WEBHOOK_SHARED_SECRET>
```

(Cloudflare te pedirá "verificar" el webhook al agregarlo por primera vez —
esto internamente hace un POST de prueba, así que tu Worker debe estar
desplegado antes de este paso.)

Checklist sugerido — **la disponibilidad de cada tipo depende de tu plan de
Cloudflare para cada zona/cuenta**, revisa cuáles te aparecen realmente:

Por cada dominio (`oficioslocalesmx.com` y `contandohistoriaspodcast.com`):
- [ ] **Health Checks** (si tu plan lo incluye): primero crea un Health
      Check en la zona (Traffic → Health Checks) apuntando a tu origen, y
      luego una Notification de tipo "Health Check Status Notification"
      ligada a ese Health Check. Es la alerta más directa de "se cayó el
      sitio".
- [ ] **SSL/TLS**: alerta de expiración o cambio de certificado Universal
      SSL.
- [ ] **Advanced HTTP Alert / Origin Error Rate Alert**: picos de errores
      5xx o de tráfico.
- [ ] **Advanced Security Events Alert**: si tienes reglas de WAF/Security
      activas, para enterarte de bloqueos o ataques.

A nivel cuenta:
- [ ] **Billing/Usage Alerts**: para no llevarte sorpresas de consumo o
      cobro.
- [ ] Revisa también si alguno de los dos dominios resulta estar servido
      por **Cloudflare Pages** (no se pudo confirmar desde este Worker) —
      si es así, agrega la notificación de **Pages Deployment Failed**.

Usa el botón **"Send Test Notification"** de cada política (cuando esté
disponible) para confirmar que el mensaje realmente llega a tu Telegram
antes de dar por buena la configuración.

## Solución de problemas

- **No llegan mensajes de Telegram**: revisa `wrangler tail` para ver el
  error real; los códigos más comunes de la API de Telegram son `401`
  (token inválido) y `400 chat not found` (chat ID incorrecto o el bot no
  tiene esa conversación iniciada).
- **El webhook responde 403**: el `<secret>` en la URL no coincide con
  `WEBHOOK_SHARED_SECRET`. Revísalo con `npx wrangler secret put
  WEBHOOK_SHARED_SECRET` de nuevo si hace falta.
- **Quiero forzar que una alerta se vuelva a mandar antes del cooldown**:
  borra su clave en KV, por ejemplo:
  ```bash
  npx wrangler kv key list --binding=ALERTS_KV
  npx wrangler kv key delete --binding=ALERTS_KV "cooldown:poll:high-error-rate:financy-worker"
  ```
- **Las consultas de polling no traen datos o dan error de campo
  desconocido**: la API GraphQL Analytics de Cloudflare puede cambiar
  nombres de campos/datasets; revisa `src/cloudflareGraphQL.ts` contra la
  documentación vigente de "GraphQL Analytics API" de Cloudflare.

## Seguridad

- Nunca subas `.dev.vars` al repo (ya está en `.gitignore`).
- Usa un `CF_API_TOKEN` de solo lectura, nunca uno con permisos de
  escritura.
- Rota `WEBHOOK_SHARED_SECRET` y los demás secretos periódicamente con
  `wrangler secret put`.
