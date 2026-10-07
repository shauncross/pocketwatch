module.exports = function(req,res){
 res.statusCode=200;
 res.setHeader("Content-Type","application/json");
 res.setHeader("Cache-Control","no-store");
 res.end(JSON.stringify({ok:true,app:"PocketWatch",version:"0.7.0",runtime:process.version,source:"Google News RSS",timestamp:new Date().toISOString()}));
};