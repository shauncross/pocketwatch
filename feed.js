import { buildFeed } from '../lib/pocketwatch.js';
export const maxDuration = 60;
export async function GET(){
  try {
    const feed=await buildFeed();
    return Response.json({ok:true,...feed},{headers:{'Cache-Control':'no-store, max-age=0'}});
  } catch(e) {
    return Response.json({ok:false,error:e?.message||'Feed function failed',stack:process.env.NODE_ENV==='production'?undefined:e?.stack,updatedAt:new Date().toISOString(),moves:[]},{status:500});
  }
}
export default async function handler(req,res){
  try { const feed=await buildFeed(); res.setHeader('Cache-Control','no-store'); return res.status(200).json({ok:true,...feed}); }
  catch(e){ return res.status(500).json({ok:false,error:e?.message||'Feed function failed',moves:[]}); }
}
