import { buildFeed } from '../lib/pocketwatch.js';
export const maxDuration=60;
export async function GET(){try{return Response.json({ok:true,...await buildFeed()},{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({ok:false,error:e?.message||'Sync failed',moves:[]},{status:502});}}
export async function POST(){return GET();}
export default async function handler(req,res){try{const feed=await buildFeed();res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,...feed});}catch(e){res.status(502).json({ok:false,error:e?.message||'Sync failed',moves:[]});}}
