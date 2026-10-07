module.exports=function(req,res){
  res.statusCode=200;
  res.setHeader("Content-Type","application/json");
  res.setHeader("Cache-Control","no-store");
  res.end(JSON.stringify({
    ok:true,
    app:"PocketWatch",
    version:"1.0.0-gnews",
    runtime:process.version,
    provider:"GNews",
    gnewsConfigured:Boolean(process.env.GNEWS_API_KEY),
    timestamp:new Date().toISOString()
  }));
};
