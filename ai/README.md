# AI Microservice — Chunk 1 (Providers + Base)

## Quick start
1. cd ai
2. copy `.env.example` -> `.env` and set API keys
3. npm ci
4. npm run dev
5. health: GET http://localhost:3002/health

## Provider test endpoints (example)
- POST /providers/openai  body: { prompt: "Hello" }
- POST /providers/cohere  body: { prompt: "Hello" }

## Notes
- This chunk exposes provider adapters. Next chunk will implement:
  - router for auto-rotation
  - conversation context memory
  - rate-limit & token accounting
  - safety filters & fallback chains
