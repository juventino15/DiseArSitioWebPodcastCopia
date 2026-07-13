# Estado del proyecto — Alertas de Telegram para Cloudflare

Documento de referencia de lo que se construyó, cómo funciona, qué quedó
desplegado y qué falta. Última actualización: 2026-07-13.

---

## 1. Qué es esto

Un **Worker de Cloudflare** llamado `telegram-alerts` que te avisa por
**Telegram** cuando pasa algo anómalo en tu cuenta de Cloudflare: en tus
dominios `oficioslocalesmx.com` y `contandohistoriaspodcast.com`, y en tus
Workers `reviews-api`, `dalton-seminuevos` y `financy-worker`.

Nació de la petición: *"quiero recibir alertas por Telegram de cualquier
anomalía de mis proyectos en Cloudflare"*.

---

## 2. Cómo funciona (arquitectura)

Dos fuentes de alerta que terminan en el mismo lugar: tu Telegram.

```
┌─────────────────────────────┐
│  Notifications de Cloudflare │  (Health Checks, SSL, errores 5xx,
│  (las configuras en el       │   seguridad, facturación…)
│   dashboard → Notifications) │
└──────────────┬──────────────┘
               │  POST /webhook/<secret>
               ▼
        ┌──────────────┐        cada 5 min (cron)   ┌──────────────────────┐
        │   Worker     │◄──────────────────────────►│ API GraphQL Analytics│
        │ telegram-    │   consulta tasa de errores │ de Cloudflare        │
        │  alerts      │   de Workers y dominios    └──────────────────────┘
        └──────┬───────┘
               │  sendMessage (Bot API)
               ▼
          📱 Telegram
```

1. **Webhook (vía principal).** Cloudflare detecta el problema con sus propias
   alertas nativas y hace un POST a nuestro Worker, que traduce el aviso y lo
   manda a Telegram. Cubre lo que Cloudflare ya sabe vigilar (caídas, SSL,
   seguridad, facturación).
2. **Cron de respaldo (cada 5 min).** El Worker consulta por su cuenta la API
   de Analytics de Cloudflare y revisa la tasa de errores de los 3 Workers y
   los 2 dominios. Sirve de red de seguridad por si una alerta nativa no está
   en tu plan o no la configuraste.

Ambas vías pasan por un **cooldown** (30 min por defecto, guardado en KV) para
no mandarte el mismo aviso repetido.

---

## 3. Qué archivos hay en el repo (en tu Mac)

Todo vive en `cloudflare/telegram-alerts/` dentro del repo
`DiseArSitioWebPodcastCopia`, en la rama `claude/cloudflare-telegram-alerts-3dudqd`.

| Archivo | Qué hace |
|---|---|
| `src/index.ts` | Punto de entrada: rutas HTTP (`/webhook`, `/test-telegram`, `/health`) y el cron `scheduled()` |
| `src/analytics.ts` | Lógica de polling: revisa error-rate y silencio de Workers y dominios |
| `src/cloudflareGraphQL.ts` | Consultas a la API GraphQL Analytics de Cloudflare |
| `src/webhook.ts` | Valida el secreto y parsea el payload de las Notifications |
| `src/telegram.ts` | Envía mensajes a Telegram (Bot API, formato HTML) |
| `src/dedup.ts` | Cooldown anti-spam usando KV con expiración |
| `src/config.ts` | Lee la configuración (workers, zonas, umbrales) del entorno |
| `src/types.ts` | Tipos de TypeScript |
| `wrangler.toml` | Configuración del Worker (cron, KV, variables, IDs) |
| `setup.sh` | Script de instalación de un comando (lo que ya corriste) |
| `README.md` | Guía completa de configuración y solución de problemas |
| `ESTADO.md` | Este documento |
| `.dev.vars.example` | Plantilla de secretos para pruebas locales |
| `test/fixtures/sample-notification-payload.json` | Payload de ejemplo para probar el webhook |

> Nota: `node_modules/`, `.dev.vars` y `.wrangler/` están en `.gitignore` — no
> se suben al repo. Los secretos reales **nunca** quedan en archivos: viven
> cifrados en Cloudflare vía `wrangler secret put`.

---

## 4. Qué se hizo, paso a paso

1. **Inventario de tu cuenta de Cloudflare** (vía el conector MCP de Cloudflare):
   se identificaron 3 Workers, 1 bucket R2 (`contando-historias-audios`),
   1 base D1 (`contando-historias-db`) y los 2 dominios.
2. **Se creó el bot de Telegram** `@juve_claude_notifier_bot` con @BotFather.
3. **Se escribió el Worker** completo en TypeScript (los archivos de arriba).
4. **Se verificó** que compila (`tsc`) y empaqueta (`wrangler deploy --dry-run`).
5. **Se subió todo al repo** (rama `claude/cloudflare-telegram-alerts-3dudqd`).
6. **Se creó el API Token de Cloudflare** de solo lectura.
7. **En tu Mac corriste `./setup.sh`**, que:
   - instaló dependencias,
   - descubrió tu Account ID y los Zone IDs automáticamente,
   - creó el KV namespace `telegram-alerts-kv`,
   - rellenó `wrangler.toml`,
   - guardó los 4 secretos,
   - **desplegó el Worker** ✅.

---

## 5. Estado actual

| Cosa | Estado |
|---|---|
| Código escrito y subido al repo | ✅ Hecho |
| Bot de Telegram creado | ✅ `@juve_claude_notifier_bot` |
| Worker desplegado en Cloudflare | ✅ Hecho (vía `setup.sh`) |
| Secretos configurados (4) | ✅ Hecho |
| KV namespace para cooldowns | ✅ Creado |
| Cron de respaldo cada 5 min | ✅ Activo automáticamente |
| Probar envío a Telegram (`/test-telegram`) | ⏳ Pendiente |
| Conectar Notifications del dashboard al webhook | ⏳ Pendiente |

---

## 6. Secretos configurados en el Worker

Estos 4 valores están guardados **cifrados en Cloudflare** (no en el repo):

- `TELEGRAM_BOT_TOKEN` — token del bot de Telegram
- `TELEGRAM_CHAT_ID` — tu chat privado con el bot
- `CF_API_TOKEN` — token de Cloudflare de solo lectura (Analytics + Workers)
- `WEBHOOK_SHARED_SECRET` — secreto que protege la URL del webhook

Para ver la lista (sin ver sus valores) o cambiar alguno:
```bash
cd cloudflare/telegram-alerts
npx wrangler secret list
npx wrangler secret put <NOMBRE>   # para actualizar uno
```

---

## 7. Qué falta (2 pasos que haces tú)

### Paso A — Probar que Telegram funciona
Con tu subdominio real (aparece en la salida de `wrangler deploy`):
```bash
curl -X POST "https://telegram-alerts.TU-SUBDOMINIO.workers.dev/test-telegram" \
  -H "X-Webhook-Secret: <TU_WEBHOOK_SHARED_SECRET>"
```
Debe llegarte un mensaje de prueba a Telegram.

### Paso B — Conectar las Notifications de Cloudflare
1. Dashboard → **Notifications → Destinations → Webhooks → Create**.
2. Pega tu URL de webhook:
   `https://telegram-alerts.TU-SUBDOMINIO.workers.dev/webhook/<TU_WEBHOOK_SHARED_SECRET>`
3. Dashboard → **Notifications → Add** y crea las alertas que quieras
   apuntando a ese destino. Recomendadas (según tu plan):
   - Health Check Status (caída de sitio) — para cada dominio
   - SSL/TLS Certificate
   - Origin Error Rate / Advanced HTTP
   - Security Events
   - Billing / Usage (nivel cuenta)

El checklist detallado está en `README.md`, sección 6.

---

## 8. Mantenimiento

- **Ver logs en vivo:** `npx wrangler tail`
- **Re-desplegar tras cambios:** `npx wrangler deploy`
- **Ajustar umbrales** (tasa de error, cooldown, etc.): edita las `[vars]` en
  `wrangler.toml` y vuelve a desplegar.
- **Forzar que una alerta se repita antes del cooldown:** borra su clave en KV
  (ver README, sección "Solución de problemas").
- **Rotar el API Token de Cloudflare:** genéralo de nuevo en el dashboard y
  corre `npx wrangler secret put CF_API_TOKEN` con el nuevo valor.

---

## 9. Notas importantes

- El código corre en **Cloudflare**, no en tu Mac. Tu Mac solo se usa para
  desplegar (porque ahí está tu `wrangler login`). Si borras la carpeta del
  repo, el Worker sigue funcionando en Cloudflare; solo necesitas el repo para
  hacer cambios y re-desplegar.
- No se modificó ninguno de tus 3 Workers existentes ni el sitio del podcast:
  `telegram-alerts` es completamente independiente.
