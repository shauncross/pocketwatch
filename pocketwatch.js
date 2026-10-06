const PEOPLE = [
  ['Ben Affleck',['ben affleck']],['SteveWillDoIt',['stevewilldoit','steve will do it']],['Kylie Jenner',['kylie jenner']],
  ['Drake',['drake','champagne papi']],['MrBeast',['mrbeast','mr beast','jimmy donaldson']],['Travis Scott',['travis scott']],
  ['LeBron James',['lebron james','lebron']],['Kim Kardashian',['kim kardashian']],['Cristiano Ronaldo',['cristiano ronaldo','ronaldo']],
  ['Jake Paul',['jake paul']],['Taylor Swift',['taylor swift']],['Kai Cenat',['kai cenat']],['Logan Paul',['logan paul']],
  ['Elon Musk',['elon musk']],['Tom Brady',['tom brady']],['Conor McGregor',['conor mcgregor']],['Kevin Hart',['kevin hart']],
  ['Floyd Mayweather',['floyd mayweather']],['Lionel Messi',['lionel messi']],['Justin Bieber',['justin bieber']],
  ['Beyoncé',['beyonce','beyoncé']],['Jay-Z',['jay-z','jay z']],['Rihanna',['rihanna']],['Selena Gomez',['selena gomez']],
  ['Post Malone',['post malone']],['Bad Bunny',['bad bunny']],['Neymar',['neymar']],['Patrick Mahomes',['patrick mahomes']],
  ['Stephen Curry',['stephen curry']],['Travis Kelce',['travis kelce']],['Tom Holland',['tom holland']],['Zendaya',['zendaya']],
  ['Dwayne Johnson',['dwayne johnson','the rock']],['Ryan Reynolds',['ryan reynolds']],['Gordon Ramsay',['gordon ramsay']]
];
const QUERIES = [
  'celebrity (bought OR purchased OR acquired) (mansion OR house OR home OR car OR jet OR plane OR yacht OR watch) (million OR thousand OR dollars OR $)',
  'celebrity (bet OR wager OR gambling) (million OR thousand OR dollars OR $)',
  'influencer (bought OR purchased OR spent OR invested OR bet) (million OR thousand OR dollars OR $)',
  'athlete (bought OR purchased OR invested OR bet OR wager) (million OR thousand OR dollars OR $)',
  'rapper OR musician (bought OR purchased OR spent OR bet OR wager) (million OR thousand OR dollars OR $)',
  'YouTuber OR streamer (bought OR purchased OR spent OR bet OR wager) (million OR thousand OR dollars OR $)',
  'Ben Affleck house OR mansion OR property money', 'SteveWillDoIt bet OR wager money',
  'Kylie Jenner jet OR plane OR house money', 'MrBeast spent OR bought OR investment money'
];
const DEMO = [
 ['Drake','D','Betting',500000,'A reported $500K sports wager is making the rounds','A high-dollar wager attributed to Drake is being discussed across sports and entertainment coverage.','Reported','Sports / entertainment coverage'],
 ['MrBeast','MB','Business',1800000,'MrBeast reveals a massive production budget','A behind-the-scenes discussion gives viewers a look at the scale of spending behind a major video.','Verified','YouTube interview'],
 ['Travis Scott','TS','Luxury',3200000,'A new luxury purchase reportedly cost $3.2M','The purchase has sparked fresh conversation about celebrity car collections and luxury spending.','Reported','Automotive publication'],
 ['LeBron James','LJ','Investment',2500000,'LeBron-linked investment draws attention','A reported investment puts another spotlight on athlete ownership and venture deals.','Reported','Business publication'],
 ['Kim Kardashian','KK','Luxury',275000,'A luxury jewelry purchase gets the internet talking','A high-end piece worn in a recent appearance is being valued in the six figures.','Estimated','Luxury media'],
 ['Cristiano Ronaldo','CR','Cars',1200000,'Ronaldo adds another serious car to the collection','The football star is known for a collection that includes some of the world’s most expensive vehicles.','Reported','Automotive coverage'],
 ['Jake Paul','JP','Betting',100000,'Jake Paul discusses a five-figure wager','A betting-related comment has fans debating whether the number is real, estimated or promotional.','Verified','Podcast / interview'],
 ['Taylor Swift','TS','Real Estate',8500000,'Luxury property activity puts Swift back in the headlines','A reported property transaction is drawing attention from real-estate watchers.','Reported','Real estate coverage'],
 ['Kai Cenat','KC','Creator',400000,'Kai Cenat talks about creator-level spending','A recent conversation gives viewers a glimpse into the cost of running large creator projects.','Verified','Stream / interview'],
 ['Logan Paul','LP','Business',1100000,'A seven-figure business deal surfaces','A new business move puts Logan Paul back on the money-moves leaderboard.','Reported','Business coverage']
];
function strip(s=''){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'").replace(/\s+/g,' ').trim();}
function tag(xml,name){const m=xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'));return m?strip(m[1]):'';}
function blocks(xml){return xml.match(/<item[\s\S]*?<\/item>/gi)||xml.match(/<entry[\s\S]*?<\/entry>/gi)||[];}
function linkOf(b){let m=b.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);if(m)return m[1];m=b.match(/<link[^>]*>([\s\S]*?)<\/link>/i);return m?strip(m[1]):'';}
function sourceOf(b,link){const m=b.match(/<source[^>]*>([\s\S]*?)<\/source>/i);if(m)return strip(m[1]);try{return new URL(link).hostname.replace(/^www\./,'')}catch{return 'Google News'}}
function personFor(text){const t=text.toLowerCase();for(const [name,aliases] of PEOPLE){if(aliases.some(a=>t.includes(a)))return name;}return null;}
function amountFor(text){const t=text.replace(/,/g,'');const patterns=[/\$\s*([0-9]+(?:\.[0-9]+)?)\s*(billion|million|m|thousand|k)?/i,/([0-9]+(?:\.[0-9]+)?)\s*(billion|million|m|thousand|k)\s*(?:dollars|usd)?/i,/([0-9]+(?:\.[0-9]+)?)\s*(?:million|billion)\s*dollars?/i];for(const p of patterns){const m=t.match(p);if(m){let n=+m[1],u=(m[2]||'').toLowerCase();if(u==='billion')n*=1e9;else if(['million','m'].includes(u))n*=1e6;else if(['thousand','k'].includes(u))n*=1e3;return n;}}return null;}
function moneyLabel(n){if(n>=1e9)return '$'+(n/1e9).toFixed(n%1e9?1:0)+'B';if(n>=1e6)return '$'+(n/1e6).toFixed(n%1e6?1:0)+'M';if(n>=1e3)return '$'+Math.round(n/1e3)+'K';return '$'+Math.round(n);}
function category(text){const t=text.toLowerCase();if(/bet|wager|gambl/.test(t))return 'Betting';if(/mansion|house|home|real estate|property/.test(t))return 'Real Estate';if(/car|ferrari|lamborghini|porsche|rolls-royce|bugatti/.test(t))return 'Cars';if(/jet|plane|yacht|watch|jewelry|diamond/.test(t))return 'Luxury';if(/invest|stake|funding|startup/.test(t))return 'Investment';if(/contract|deal|company|business/.test(t))return 'Business';if(/creator|stream|youtube|tiktok/.test(t))return 'Creator';return 'Spending';}
function status(){return 'Reported';}
function id(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
async function fetchGoogleNews(){const seen=new Map();const errors=[];for(const q of QUERIES){const url='https://news.google.com/rss/search?q='+encodeURIComponent(q+' when:2d')+'&hl=en-US&gl=US&ceid=US:en';try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 PocketWatch/0.4'}});if(!r.ok){errors.push('HTTP '+r.status);continue;}const xml=await r.text();for(const b of blocks(xml)){const title=tag(b,'title'),desc=tag(b,'description'),published=tag(b,'pubDate')||tag(b,'published'),link=linkOf(b),text=strip(title+' '+desc),person=personFor(text),amount=amountFor(text);if(!person||!amount)continue;const key=person+'|'+amount+'|'+title.toLowerCase().replace(/[^a-z0-9 ]/g,'').slice(0,100);if(seen.has(key))continue;seen.set(key,{id:id(link||title),name:person,initials:person.split(/\s+/).map(x=>x[0]).join('').slice(0,2),cat:category(text),amount:moneyLabel(amount),amountValue:amount,title,desc:desc||title,status:status(text),source:sourceOf(b,link),sourceUrl:link,publishedAt:published||new Date().toISOString(),sourceType:'Google News RSS'});}}catch(e){errors.push(e.message||'fetch error');}}
return {moves:[...seen.values()].sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,100),errors};}
export async function buildFeed(){const live=await fetchGoogleNews();const demo=DEMO.map((x,i)=>({id:'demo-'+i,name:x[0],initials:x[1],cat:x[2],amount:moneyLabel(x[3]),amountValue:x[3],title:x[4],desc:x[5],status:x[6],source:x[7],sourceUrl:'https://news.google.com/',publishedAt:new Date(Date.now()-i*3600000).toISOString(),sourceType:'Demo fallback'}));const moves=live.moves.length?live.moves:demo;return {source:live.moves.length?'Google News RSS':'Demo fallback (Google News returned no qualifying money moves)',updatedAt:new Date().toISOString(),count:moves.length,moves,liveCount:live.moves.length,errors:live.errors.slice(0,3)};}
