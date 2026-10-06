# PocketWatch Vercel Beta

A deployable beta of PocketWatch that aggregates public Google News RSS search results into a celebrity/influencer money-moves feed.

## What works now
- Vercel-native serverless API
- No paid API key required
- Google News RSS search ingestion
- Multiple money-related search queries
- Person/entity recognition from a starter registry
- Dollar amount extraction
- Category detection: Betting, Real Estate, Luxury, Investment, Business, Spending
- Source/publisher link-out
- Search + category filters
- Detail modal with source and confidence wording
- Manual Sync News button
- Optional Vercel Cron refresh endpoint

## Deploy
1. Upload this folder to GitHub.
2. Import the repository into Vercel.
3. Deploy with no environment variables required.
4. Open the production URL.
5. Click **Sync News**.

The app calls `/api/feed`, which fetches Google News RSS on the server. This avoids browser CORS problems and keeps the feed source implementation server-side.

## Optional protection
Set `SYNC_SECRET` in Vercel. The manual `/api/sync` route then expects `x-sync-secret`. For a public beta, leaving it unset is simplest. The scheduled cron calls `/api/feed` and does not need the secret.

## Important beta limitation
Google News RSS is useful for prototyping, but it is not a durable production data contract. The app stores no permanent database records yet; it re-queries Google News when the feed function runs. Once the product proves demand, replace `lib/pocketwatch.js` with a paid/official news provider and add Postgres/Supabase for persistent events, source history, deduplication, verification, and user personalization.

## Vercel cron
`vercel.json` schedules one daily refresh at 12:00 UTC. Vercel Hobby cron jobs are limited to daily execution; higher-frequency schedules require a plan that supports them.

## Next build step
Add an AI extraction/enrichment worker and event clustering so 8 articles about the same Ben Affleck house purchase become ONE PocketWatch event with `8 sources reporting`, rather than 8 cards.
