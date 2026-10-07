// Sync intentionally uses the same provider path as the main feed so the browser
// never calls GNews directly and never exposes the API key.
const feed=require("./feed.js");
module.exports=feed;
