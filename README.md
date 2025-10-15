# AI Documentation Generator

Generate clean, consistent documentation from source code using AI. Built with Next.js (App Router), TypeScript, streaming API responses, and a minimal UI.

## Quick start

1. Create env file:

```
cp .env.example .env.local
```

2. Set `OPENAI_API_KEY` in `.env.local`.

3. Install and run:

```
npm install
npm run dev
```

Open http://localhost:3000

## Production

Build and run locally:

```
docker build -t ai-docgen .
docker run -e OPENAI_API_KEY=... -p 3000:3000 ai-docgen
```

Or with compose:

```
docker compose up --build
```

## Configuration

- `AI_PROVIDER` (default: `openai`)
- `AI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_API_KEY` or `AZURE_OPENAI_API_KEY`

## Notes

- API streams Markdown over HTTP for responsive UX.
- Simple in-memory rate limiter is included; replace with Redis for multi-instance.

