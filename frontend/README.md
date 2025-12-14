# Frontend — Shopify WhatsApp AI (Next.js 14 Admin Panel)

## Quick start (local)
1. `cd frontend`
2. Copy `.env.example` to `.env.local` and adjust `NEXT_PUBLIC_API_BASE` (backend url)
3. `npm ci`
4. `npm run dev`
5. Admin panel: `http://localhost:3000`

## Production
- Build: `npm run build`
- Start: `npm run start`
- Container: use provided Dockerfile

## Notes
- Ensure backend is running and accessible (NEXT_PUBLIC_API_BASE)
- Socket URL in env should point to backend (or use dedicated socket server)
- Auth via JWT cookie (token stored in cookie)
- Payment accounts & templates come from backend APIs
