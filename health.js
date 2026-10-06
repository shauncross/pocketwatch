export default async function handler(req,res){res.status(200).json({ok:true,app:'PocketWatch',version:'0.5.0',runtime:process.version,source:'Google News RSS',time:new Date().toISOString()});}
