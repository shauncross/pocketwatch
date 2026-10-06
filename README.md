# PocketWatch — Vercel Beta 0.4

PocketWatch is a mobile-first celebrity/influencer money-moves feed.

## What this build fixes

- Vercel Functions now use a valid ESM configuration.
- Node.js is pinned to 24.x because Vercel deprecated Node.js 20 for new deployments after October 1, 2026.
- The frontend and backend use the same `/api/feed` and `/api/sync` endpoints.
- The previous `/api/ingest/news` mismatch is removed.
- The original Money Feed / People / Watchlist / search / category filters / detail modal are retained.
- Google News RSS is the initial live source; no paid API key is required.
- If Google News has no qualifying results, the app deliberately falls back to demo data instead of showing a broken/empty application.
- RSS results are parsed into person, amount, category, source, timestamp and reported-status fields.
- Multiple queries are de-duplicated before reaching the feed.

## Deploy to Vercel

1. Extract this folder.
2. Put its contents in a GitHub repository.
3. Import the repository into Vercel.
4. Deploy with no environment variables required.
5. Open the deployed site.
6. Test `/api/health` directly. It should return JSON with `ok: true`.
7. Test `/api/feed`. It should return JSON and either live Google News moves or the demo fallback.
8. Click **Sync news** from the app.

## Important

This beta fetches Google News RSS at request time. It does not yet persist a historical feed in a database. That is intentional for the first Vercel prototype. The next production step is a database-backed ingestion worker that stores events, clusters duplicate coverage, and keeps source history.

The included Vercel Cron calls `/api/sync` once per day. The manual Sync button remains available for testing.

## Planned production ingestion

Google News RSS → source adapters → AI money-event extraction → celebrity/entity matching → duplicate/event clustering → database → PocketWatch feed.

Paid/licensed news APIs and YouTube ingestion can be added later without changing the frontend contract.
