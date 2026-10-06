import { fetchGoogleNews } from '../lib/pocketwatch.js';
export const maxDuration = 60;
export default async function handler(req,res){
  if(req.method!=='POST'&&req.method!=='GET') return res.status(405).json({ok:false,error:'Method not allowed'});
  if(process.env.SYNC_SECRET && req.headers['x-sync-secret']!==process.env.SYNC_SECRET) return res.status(401).json({ok:false,error:'Unauthorized'});
  try{const moves=await fetchGoogleNews(); res.status(200).json({ok:true,updatedAt:new Date().toISOString(),count:moves.length,moves});}
  catch(e){res.status(500).json({ok:false,error:'Sync failed'});}
}
