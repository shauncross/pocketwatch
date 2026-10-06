export default function handler(req,res){
  res.status(200).json({ok:true,app:'PocketWatch',version:'0.4.0',source:'Google News RSS',runtime:process.version});
}
