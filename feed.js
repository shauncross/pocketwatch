const https = require("node:https");
const { URL } = require("node:url");

const PEOPLE = [
"Ben Affleck","SteveWillDoIt","Kylie Jenner","MrBeast","Drake","Travis Scott","LeBron James",
"Kim Kardashian","Cristiano Ronaldo","Jake Paul","Taylor Swift","Kai Cenat","Logan Paul",
"Elon Musk","Tom Brady","Conor McGregor","Kevin Hart","Floyd Mayweather","Lionel Messi",
"Justin Bieber","Beyoncé","Jay-Z","Rihanna","Selena Gomez","Post Malone","Bad Bunny",
"Neymar","Patrick Mahomes","Stephen Curry","Travis Kelce","Tom Holland","Zendaya","Dwayne Johnson",
"Ryan Reynolds","Gordon Ramsay","Snoop Dogg","50 Cent","Cardi B","Offset","Kendall Jenner"
];

const QUERIES = [
  '"Ben Affleck" house OR mansion OR property OR car OR jet OR watch',
  '"Kylie Jenner" jet OR house OR car OR purchase OR spending',
  '"MrBeast" investment OR business OR purchase OR spending',
  '"SteveWillDoIt" bet OR wager OR gambling',
  '"celebrity" bought OR purchased OR spent OR invested money',
  '"influencer" bought OR purchased OR spent OR bet money',
  '"athlete" bought OR purchased OR invested OR bet money'
];

const DEMO = [
{name:"Ben Affleck",cat:"Real Estate",amount:"$20M",title:"Ben Affleck reportedly makes a major real-estate purchase",desc:"Public reporting about a high-value property move.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
{name:"Kylie Jenner",cat:"Luxury",amount:"$72M",title:"Kylie Jenner linked to a new private jet",desc:"Public reporting about a major luxury purchase.",status:"Estimated",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
{name:"SteveWillDoIt",cat:"Betting",amount:"$1M",title:"SteveWillDoIt discusses a huge wager",desc:"Public reporting about creator betting activity.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"}
];

function get(url, timeout=6000){
 return new Promise((resolve,reject)=>{
  const req=https.get(url,{headers:{"User-Agent":"PocketWatch/0.6 (+https://pocketwatch-brown.vercel.app/)","Accept":"application/rss+xml, application/xml, text/xml, */*"}},res=>{
   let data="";res.setEncoding("utf8");res.on("data",c=>data+=c);res.on("end",()=>resolve({status:res.statusCode||0,body:data}));
  });
  req.setTimeout(timeout,()=>req.destroy(new Error("timeout")));
  req.on("error",reject);
 });
}
function decode(s){return String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim()}
function tag(block,name){const m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`,"i"));return m?decode(m[1]):""}
function person(text){const low=text.toLowerCase();return PEOPLE.find(p=>low.includes(p.toLowerCase()))||null}
function amount(text){
 const t=text.replace(/,/g,"");
 let m=t.match(/\$?\s*(\d+(?:\.\d+)?)\s*(billion|bn|million|m|thousand|k)\b/i);
 if(!m){m=t.match(/\$\s*(\d+(?:\.\d+)?)/); if(m)return "$"+m[1]; return "Undisclosed";}
 const n=Number(m[1]), u=m[2].toLowerCase();
 if(u==="billion"||u==="bn") return "$"+n+"B";
 if(u==="million"||u==="m") return "$"+n+"M";
 if(u==="thousand"||u==="k") return "$"+n+"K";
 return "Undisclosed";
}
function category(text){
 const t=text.toLowerCase();
 if(/bet|wager|gambl|sportsbook/.test(t))return"Betting";
 if(/mansion|house|home|estate|property|villa|real estate/.test(t))return"Real Estate";
 if(/jet|yacht|ferrari|lamborghini|rolls|bentley|porsche|watch|jewelry|jewellery|diamond/.test(t))return"Luxury";
 if(/invest|funding|stake|shares|stock/.test(t))return"Investment";
 if(/company|business|deal|brand|production/.test(t))return"Business";
 return"Money Move";
}
function status(text){const t=text.toLowerCase();return /rumor|rumour|alleged|unconfirmed/.test(t)?"Rumored":/estimated|reportedly|reporting|according to/.test(t)?"Reported":"Reported"}
function parse(xml){
 const blocks=xml.match(/<item[\s\S]*?<\/item>/gi)||[];
 return blocks.map((b,i)=>{
   const title=tag(b,"title"), desc=tag(b,"description"), link=tag(b,"link"), pub=tag(b,"pubDate");
   const text=title+" "+desc, p=person(text);
   if(!p)return null;
   return {id:"g"+i+Date.now(),name:p,cat:category(text),amount:amount(text),title:title||"Celebrity money story",desc:desc||"Publicly reported money activity.",status:status(text),source:sourceName(link),sourceUrl:link||"https://news.google.com/",publishedAt:pub||new Date().toISOString()};
 }).filter(Boolean);
}
function sourceName(link){try{return new URL(link).hostname.replace(/^www\./,"")}catch{return"Google News"}}
async function fetchLive(){
 const urls=QUERIES.map(q=>"https://news.google.com/rss/search?q="+encodeURIComponent(q+" when:7d")+"&hl=en-US&gl=US&ceid=US:en");
 const results=await Promise.allSettled(urls.map(u=>get(u)));
 let moves=[], diagnostics=[];
 results.forEach((r,i)=>{
   if(r.status==="fulfilled" && r.value.status>=200 && r.value.status<300){const parsed=parse(r.value.body);moves.push(...parsed);diagnostics.push({query:i+1,http:r.value.status,items:parsed.length});}
   else diagnostics.push({query:i+1,error:r.reason?.message||"HTTP error"});
 });
 const seen=new Set();moves=moves.filter(x=>{const k=(x.name+"|"+x.title).toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,60);
 return {moves,diagnostics};
}
async function handler(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");
 try{
   const live=await fetchLive();
   const moves=live.moves.length?live.moves:DEMO;
   res.statusCode=200;res.setHeader("Content-Type","application/json");
   res.end(JSON.stringify({ok:true,live:live.moves.length>0,count:moves.length,moves,diagnostics:live.diagnostics,timestamp:new Date().toISOString()}));
 }catch(e){
   res.statusCode=200;res.setHeader("Content-Type","application/json");
   res.end(JSON.stringify({ok:false,live:false,count:DEMO.length,moves:DEMO,diagnostics:{stage:"google-news",error:e.message},timestamp:new Date().toISOString()}));
 }
}
module.exports=handler;
