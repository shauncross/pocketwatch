# PocketWatch — Live GNews Vercel build

## Deploy
1. Upload this project to the GitHub repository connected to Vercel, or import the ZIP into a new repo.
2. In Vercel → Project → Settings → Environment Variables add:
   - Name: `GNEWS_API_KEY`
   - Value: your GNews developer key
   - Environments: Production, Preview, Development
3. Redeploy after saving the variable.
4. Open `/api/health` and confirm `gnewsConfigured:true`.
5. Open the home page and click **Sync News**.

The key is only read by Vercel serverless functions. It is never included in browser JavaScript.

## Important
The GNews Free plan is intended for development/testing and has a daily request limit and delayed articles. A published commercial PocketWatch deployment requires an eligible paid GNews plan.
