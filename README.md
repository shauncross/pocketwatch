# PocketWatch Vercel Beta 0.6

This version is deliberately simple and diagnostic-friendly.

## Deploy
1. Put the contents of this folder at the root of a GitHub repository.
2. Import the repository into Vercel.
3. Do not add environment variables for the beta.
4. In Vercel Project Settings, use Node.js 24.x (also pinned in package.json/vercel.json).
5. Redeploy after changing the repository.

## Test after deployment
- `/api/health` should return JSON with `ok: true`.
- `/api/feed` should return JSON with `ok: true`, `moves`, `source`, and `diagnostics`.
- `/api/sync` should do a fresh Google News fetch.

## Important
Google News RSS is used only as the initial prototype source. The app falls back to demo money moves when Google News returns no qualifying stories or is temporarily unreachable, so the UI is never blank. Live results are only displayed when a person and money-related signal are detected in the RSS title/description. Dollar amounts are optional; undisclosed amounts are shown as `Undisclosed`.

The next production step should replace RSS with a licensed news API and add a database/event-clustering layer.
