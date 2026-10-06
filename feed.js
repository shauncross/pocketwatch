import { buildFeed } from '../lib/pocketwatch.js';
export const maxDuration = 60;
export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=300');
  try {
    const feed = await buildFeed();
    res.status(200).json({ok:true,...feed});
  } catch (e) {
    console.error('feed error',e);
    res.status(200).json({ok:true,source:'PocketWatch demo fallback',updatedAt:new Date().toISOString(),count:0,moves:[]});
  }
}
