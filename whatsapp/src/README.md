# WhatsApp microservice (Baileys) — Shopify WhatsApp AI

## Quick start (local)
1. `cd whatsapp`
2. Copy `.env.example` to `.env` and fill `BACKEND_WEBHOOK` and Cloudinary creds.
3. `npm ci`
4. `npm run dev`
5. Service: `http://localhost:3001`

## Endpoints
- `GET /api/health` — health check
- `POST /api/session/create` — create new WA session (body { name })
- `GET /api/session/list` — list sessions
- `GET /api/session/:id` — get session info
- `POST /api/session/:id/close` — close session
- `POST /api/send-text` — send text { sessionId, phone, text }
- `POST /api/send-media` — multipart form field "file", body { sessionId, phone }

## Notes
- Session files persist in `sessions/<sessionId>/` — do NOT delete if you want reconnect.
- Frontend: use socket.io to listen for `wa:qr` and `wa:session:open` events.
- Use Redis for production rate-limiting (set REDIS_URL in .env).
- Cloudinary for media hosting; you can swap S3 easily.
