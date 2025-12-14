# Backend — Shopify WhatsApp AI (Production-ready scaffold)

Roman Urdu baby steps:

## Requirements
- Node 18+
- PostgreSQL (Neon recommended)
- Redis (recommended)
- Cloudinary (optional for media)
- AI microservice + Whatsapp microservice (gehri integration ke liye)

## Local dev
1. Copy `.env.example` to `.env` and fill.
2. Start Postgres + Redis (docker-compose recommended).
3. `npm ci`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`
7. Server on `http://localhost:4000`

## Production
- Build: `npm run build`
- Deploy container using Dockerfile.
- Use render/railway/neon for DB + redis.

## Notes
- Replace ai/whatsapp microservice urls in .env.
- Payment provider SDK integration required in `services/payment.service.ts`.
- WhatsApp microservice handles sessions & anti-ban; backend only stores messages.
