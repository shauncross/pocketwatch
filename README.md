# Pocketwatch: go live in about 10 minutes

1. Create a free GitHub account, then a new repository. Click "uploading an existing file" and drag in everything from this folder (index.html, package.json, README.md and the api folder). Commit.
2. Go to vercel.com, sign in with GitHub, click Add New > Project, pick the repository, and click Deploy. No settings to change.
3. Your site is live at a vercel.app address. For your own domain: Project > Settings > Domains.

How it works: index.html is the site. api/feed.js fetches Google News RSS for each person a visitor follows, plus an optional YouTube channel feed (paste the channel ID that starts with UC). Results are cached for 15 minutes. No API keys and no database.

Notes
- Follows and saved items are stored in each visitor's browser, so there are no accounts yet. Add accounts later with Supabase (free tier).
- Vercel's free Hobby plan is for non-commercial use. If you add ads or sell anything, use their paid plan or move to Cloudflare Pages.
- Google News RSS is unofficial. If it changes or rate-limits you, swap the news() function in api/feed.js for a news API.
