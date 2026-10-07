# PocketWatch Vercel v0.7

This build intentionally uses the simplest Vercel structure:

- `index.html` — browser app with a built-in demo feed.
- `api/feed.js` — single CommonJS Vercel Function; fetches Google News RSS in parallel.
- `api/sync.js` — same feed function, used by the Sync button.
- `api/health.js` — deployment diagnostic.

## Important

There is intentionally **no `vercel.json`** and no Express server. Vercel automatically detects files in `api/` as Functions.

Deploy the CONTENTS of this folder at the repository root. Do not nest the project inside another folder.

After deployment check:
- `/api/health`
- `/api/feed`

Even if Google News is unavailable, the browser has a built-in demo feed and `/api/feed` returns demo data with diagnostics, so the site should never be blank.

## Deploy

1. Put `index.html`, `package.json`, and the `api` folder at the root of GitHub.
2. Import the repository into Vercel.
3. Use Node 24.x (the `engines` field requests it).
4. Deploy.
