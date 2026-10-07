export async function GET(){return Response.json({ok:true,app:'PocketWatch',version:'0.6.0',runtime:process.version,source:'Google News RSS',time:new Date().toISOString()});}
export default function handler(req,res){res.status(200).json({ok:true,app:'PocketWatch',version:'0.6.0',runtime:process.version,source:'Google News RSS',time:new Date().toISOString()});}
