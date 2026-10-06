import { fetchGoogleNews } from '../lib/pocketwatch.js';
export const maxDuration = 60;
export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
  try{
    const moves=await fetchGoogleNews();
    res.status(200).json({ok:true,source:'Google News RSS',updatedAt:new Date().toISOString(),count:moves.length,moves});
  }catch(e){res.status(500).json({ok:false,error:'Feed refresh failed'});}
}
