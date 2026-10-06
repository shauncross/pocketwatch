import { buildFeed } from '../lib/pocketwatch.js';
export const maxDuration = 60;
export default async function handler(req,res){
  if(req.method!=='GET' && req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  if(process.env.SYNC_SECRET && req.headers['x-sync-secret']!==process.env.SYNC_SECRET) return res.status(401).json({ok:false,error:'Unauthorized'});
  try { const feed=await buildFeed(); res.status(200).json({ok:true,...feed}); }
  catch(e){ console.error('sync error',e); res.status(502).json({ok:false,error:'Google News sync failed'}); }
}
