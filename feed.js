const https = require("node:https");

// PocketWatch keeps the provider key on the server. Never put GNEWS_API_KEY in index.html.
const PEOPLE = [
  "Ben Affleck","SteveWillDoIt","Kylie Jenner","MrBeast","Drake","Travis Scott","LeBron James",
  "Kim Kardashian","Cristiano Ronaldo","Jake Paul","Taylor Swift","Kai Cenat","Logan Paul","Elon Musk",
  "Tom Brady","Conor McGregor","Kevin Hart","Floyd Mayweather","Lionel Messi","Justin Bieber","Beyoncé",
  "Jay-Z","Rihanna","Selena Gomez","Post Malone","Bad Bunny","Neymar","Patrick Mahomes","Stephen Curry",
  "Travis Kelce","Tom Holland","Zendaya","Dwayne Johnson","Ryan Reynolds","Gordon Ramsay","Snoop Dogg",
  "50 Cent","Cardi B","Offset","Kendall Jenner","Kanye West","Ye","Bianca Censori","Kim Kardashian West",
  "Khloé Kardashian","Kourtney Kardashian","Kris Jenner","Paris Hilton","Bella Hadid","Gigi Hadid","Hailey Bieber",
  "Justin Timberlake","Jennifer Lopez","Ben Stiller","George Clooney","Matt Damon","Mark Wahlberg","Will Smith",
  "Jaden Smith","Chris Rock","Eddie Murphy","Kevin Durant","Shaquille O'Neal","Michael Jordan","Tiger Woods",
  "Serena Williams","Naomi Osaka","Coco Gauff","Canelo Alvarez","Ryan Garcia","Jorge Masvidal","Francis Ngannou",
  "Neymar Jr","Kylian Mbappé","Kylian Mbappe","Erling Haaland","David Beckham","Victoria Beckham","Lewis Hamilton",
  "Lando Norris","Max Verstappen","Aaron Rodgers","Joe Burrow","Josh Allen","Lamar Jackson","Odell Beckham Jr.",
  "Odell Beckham","Deion Sanders","Simone Biles","Sha'Carri Richardson","Usain Bolt","MrBeast","Mark Cuban",
  "Gary Vaynerchuk","Gary Vee","Alex Cooper","Emma Chamberlain","Addison Rae","Charli D'Amelio","Dixie D'Amelio",
  "Alix Earle","Adin Ross","IShowSpeed","Speed","Ninja","Pokimane","Hasan Piker","xQc","FaZe Banks",
  "FaZe Clan","Bryce Hall","Tana Mongeau","David Dobrik","Ludwig","Amouranth","NICKMERCS","Rhett & Link",
  "KSI","Sidemen","Central Cee","Ice Spice","Megan Thee Stallion","Nicki Minaj","Doja Cat","Ariana Grande",
  "Billie Eilish","The Weeknd","Beyonce","Jay Z","Usher","Adele","Ed Sheeran","Katy Perry","Lady Gaga",
  "Miley Cyrus","Dua Lipa","Olivia Rodrigo","Sabrina Carpenter","Harry Styles","Bad Bunny","Peso Pluma",
  "Tyler, the Creator","A$AP Rocky","A$AP Ferg","Lil Wayne","Lil Baby","21 Savage","Future","Kendrick Lamar",
  "J. Cole","Megan Fox","Machine Gun Kelly","Zac Efron","Leonardo DiCaprio","Brad Pitt","Jennifer Aniston",
  "Reese Witherspoon","Oprah Winfrey","Ellen DeGeneres","Ryan Seacrest","MrBeast","Kai Cenat"
];

const DEMO = [
  {name:"Ben Affleck",cat:"Real Estate",amount:"$20M",title:"Ben Affleck reportedly makes a major real-estate purchase",desc:"A high-value property move reported by entertainment media.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
  {name:"SteveWillDoIt",cat:"Betting",amount:"$1M",title:"SteveWillDoIt discusses a huge wager",desc:"Creator betting activity highlighted in public reporting.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
  {name:"Kylie Jenner",cat:"Luxury",amount:"$72M",title:"Kylie Jenner linked to a new private jet",desc:"A major luxury purchase reported in public media.",status:"Estimated",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
  {name:"MrBeast",cat:"Business",amount:"$10M+",title:"MrBeast puts millions into a new business project",desc:"Creator-business spending and investment story.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
  {name:"Drake",cat:"Luxury",amount:"$2.5M",title:"Drake adds another luxury purchase to his collection",desc:"Publicly reported high-end purchase.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"},
  {name:"Cristiano Ronaldo",cat:"Luxury",amount:"Undisclosed",title:"Cristiano Ronaldo makes another luxury purchase",desc:"The source reports the purchase but does not disclose a price.",status:"Reported",source:"PocketWatch Demo",sourceUrl:"https://news.google.com/"}
];

// One search request per feed load keeps the free GNews plan well within its request-rate rules.
const QUERY = '(celebrity OR influencer OR athlete OR creator) AND (bought OR purchased OR spent OR invested OR wager OR bet OR mansion OR jet OR yacht OR watch OR jewelry OR property)';

function getJson(url, timeout=9000){
  return new Promise((resolve,reject)=>{
    const req=https.get(url,{headers:{"User-Agent":"PocketWatch/1.0","Accept":"application/json","X-Api-Key":process.env.GNEWS_API_KEY||""}},res=>{
      let data="";
      res.setEncoding("utf8");
      res.on("data",c=>data+=c);
      res.on("end",()=>{
        let body=null; try{body=JSON.parse(data);}catch{}
        resolve({status:res.statusCode||0,body,raw:data.slice(0,1000)});
      });
    });
    req.setTimeout(timeout,()=>req.destroy(new Error("GNews request timed out")));
    req.on("error",reject);
  });
}

function text(v){return String(v||"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();}
function person(value){
  const low=value.toLowerCase();
  return PEOPLE.find(p=>low.includes(p.toLowerCase()))||null;
}
function amount(value){
  const t=text(value).replace(/,/g,"");
  let m=t.match(/(?:US\$|\$|USD\s*)\s*(\d+(?:\.\d+)?)\s*(billion|bn|million|m|thousand|k)\b/i);
  if(!m){m=t.match(/\b(\d+(?:\.\d+)?)\s*(billion|bn|million|m|thousand|k)\s*(?:dollars|USD)?\b/i);}
  if(!m){m=t.match(/\$\s*(\d+(?:\.\d+)?)/);if(m)return "$"+m[1];return "Undisclosed";}
  const n=m[1],u=m[2].toLowerCase();
  if(u==="billion"||u==="bn")return "$"+n+"B";
  if(u==="million"||u==="m")return "$"+n+"M";
  if(u==="thousand"||u==="k")return "$"+n+"K";
  return "Undisclosed";
}
function category(value){
  const t=value.toLowerCase();
  if(/bet|wager|gambl|sportsbook|casino/.test(t))return"Betting";
  if(/mansion|house|home|estate|property|villa|real estate|penthouse/.test(t))return"Real Estate";
  if(/jet|yacht|ferrari|lamborghini|rolls[- ]royce|bentley|porsche|watch|jewelry|jewellery|diamond|car|vehicle/.test(t))return"Luxury";
  if(/invest|funding|stake|shares|stock|portfolio/.test(t))return"Investment";
  if(/company|business|deal|brand|production|startup/.test(t))return"Business";
  return"Money Move";
}
function status(value){
  const t=value.toLowerCase();
  if(/rumor|rumour|unconfirmed|speculation/.test(t))return"Rumored";
  if(/estimated|reportedly|reporting|according to|sources say|appears to/.test(t))return"Reported";
  return"Reported";
}
function sourceName(article){
  return text(article?.source?.name)||"News source";
}
function normalize(article,index){
  const title=text(article?.title);
  const desc=text(article?.description);
  const content=text(article?.content);
  const combined=title+" "+desc+" "+content;
  const p=person(combined);
  if(!p)return null;
  return {
    id:"gnews-"+index+"-"+Date.now(),
    name:p,
    cat:category(combined),
    amount:amount(combined),
    title:title||"Celebrity money story",
    desc:desc||content||"Public reporting about a celebrity or creator money move.",
    status:status(combined),
    source:sourceName(article),
    sourceUrl:article?.url||"https://gnews.io/",
    image:article?.image||"",
    publishedAt:article?.publishedAt||new Date().toISOString()
  };
}

async function fetchLive(){
  const key=process.env.GNEWS_API_KEY;
  if(!key)return {moves:DEMO,live:false,diagnostics:{provider:"GNews",configured:false,message:"GNEWS_API_KEY is not configured in Vercel."}};
  const params=new URLSearchParams({q:QUERY,lang:"en",country:"us",max:"10",sortby:"publishedAt"});
  const url="https://gnews.io/api/v4/search?"+params.toString();
  const r=await getJson(url);
  if(r.status<200||r.status>=300){
    const apiMessage=r.body?.errors?.join?.(" ")||r.body?.message||"GNews returned an error";
    return {moves:DEMO,live:false,diagnostics:{provider:"GNews",configured:true,http:r.status,error:apiMessage}};
  }
  const articles=Array.isArray(r.body?.articles)?r.body.articles:[];
  const moves=articles.map(normalize).filter(Boolean);
  const dedup=new Map();
  for(const m of moves){
    const k=(m.name+"|"+m.title).toLowerCase();
    if(!dedup.has(k))dedup.set(k,m);
  }
  return {moves:Array.from(dedup.values()).slice(0,60),live:true,diagnostics:{provider:"GNews",configured:true,http:r.status,articlesReceived:articles.length,qualifyingMoves:moves.length,query:QUERY}};
}

module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=300");
  res.setHeader("Content-Type","application/json");
  try{
    const result=await fetchLive();
    const moves=result.moves?.length?result.moves:DEMO;
    res.statusCode=200;
    res.end(JSON.stringify({ok:true,live:result.live&&moves!==DEMO,count:moves.length,moves,diagnostics:result.diagnostics,timestamp:new Date().toISOString()}));
  }catch(e){
    res.statusCode=200;
    res.end(JSON.stringify({ok:false,live:false,count:DEMO.length,moves:DEMO,diagnostics:{provider:"GNews",error:e.message},timestamp:new Date().toISOString()}));
  }
};
