# Shopify WhatsApp AI — Monorepo (Root)

Yeh repository 4 services par based hai:
- `backend`  — API gateway, DB, sockets
- `ai`       — AI microservice (provider rotation)
- `whatsapp` — WhatsApp (Baileys) microservice
- `frontend` — Next.js admin panel

## Quick start (local, recommended)
1. Copy .env.example to service .env files:
   - `cp backend/.env.example backend/.env` (edit values)
   - `cp ai/.env.example ai/.env` (edit values)
   - `cp whatsapp/.env.example whatsapp/.env` (edit)
   - `cp frontend/.env.example frontend/.env` (edit)

2. Start services with Docker Compose:
   ```bash
   docker-compose up --build
