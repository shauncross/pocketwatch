const PEOPLE = [
  ['Ben Affleck',['ben affleck']],['SteveWillDoIt',['stevewilldoit','steve will do it']],['Kylie Jenner',['kylie jenner']],
  ['Drake',['drake','champagne papi']],['MrBeast',['mrbeast','mr beast','jimmy donaldson']],['Travis Scott',['travis scott']],
  ['LeBron James',['lebron james','lebron']],['Kim Kardashian',['kim kardashian']],['Cristiano Ronaldo',['cristiano ronaldo','ronaldo']],
  ['Jake Paul',['jake paul']],['Taylor Swift',['taylor swift']],['Kai Cenat',['kai cenat']],['Logan Paul',['logan paul']],
  ['Elon Musk',['elon musk']],['Tom Brady',['tom brady']],['Conor McGregor',['conor mcgregor']],['Kevin Hart',['kevin hart']],
  ['Floyd Mayweather',['floyd mayweather']],['Lionel Messi',['lionel messi']],['Justin Bieber',['justin bieber']],
  ['Beyonce',['beyonce','beyoncé']],['Jay-Z',['jay-z','jay z']],['Rihanna',['rihanna']],['Selena Gomez',['selena gomez']],
  ['Post Malone',['post malone']],['Bad Bunny',['bad bunny']],['Neymar',['neymar']],['Patrick Mahomes',['patrick mahomes']],
  ['Stephen Curry',['stephen curry']],['Travis Kelce',['travis kelce']],['Tom Holland',['tom holland']],['Zendaya',['zendaya']],
  ['Dwayne Johnson',['dwayne johnson','the rock']],['Ryan Reynolds',['ryan reynolds']],['Gordon Ramsay',['gordon ramsay']],
  ['MrBeast',['jimmy donaldson']]
];

const QUERIES = [
  'celebrity (bought OR purchased OR acquired) (mansion OR house OR home OR car OR jet OR plane OR yacht OR watch) (million OR thousand OR $)',
  'celebrity (bet OR wager OR gambling) (million OR thousand OR dollars OR $)',
  'influencer (bought OR purchased OR spent OR invested OR bet) (million OR thousand OR dollars OR $)',
  'athlete (bought OR purchased OR invested OR bet OR wager) (million OR thousand OR dollars OR $)',
  'rapper OR musician (bought OR purchased OR spent OR bet) (million OR thousand OR $)',
  'YouTuber OR streamer (bought OR purchased OR spent OR bet OR wager) (million OR thousand OR $)',
  'Ben Affleck house OR mansion OR property',
  'SteveWillDoIt bet OR wager',
  'Kylie Jenner jet OR plane OR house',
  'MrBeast spent OR bought OR investment'
];

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function strip(s=''){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
function tag(xml, name){const m=xml.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)<\\/'+name+'>','i')); return m?strip(m[1]):'';}
function blocks(xml){return xml.match(/<item[\s\S]*?<\/item>/gi)||xml.match(/<entry[\s\S]*?<\/entry>/gi)||[];}
function linkOf(b){let m=b.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i); if(m)return m[1]; m=b.match(/<link[^>]*>([\s\S]*?)<\/link>/i); return m?strip(m[1]):'';}
function personFor(text){const t=text.toLowerCase(); for(const [name, aliases] of PEOPLE){if(aliases.some(a=>t.includes(a))) return name;} return null;}
function amountFor(text){
  const t=text.replace(/,/g,'');
  const patterns=[
    /\$\s*([0-9]+(?:\.[0-9]+)?)\s*(billion|million|m|thousand|k)?/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(billion|million|m|thousand|k)\s*(?:dollars|usd)?/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:million|billion)\s*dollars?/i
  ];
  for(const p of patterns){const m=t.match(p); if(m){let n=parseFloat(m[1]), u=(m[2]||'').toLowerCase(); if(u==='billion')n*=1e9; else if(['million','m'].includes(u))n*=1e6; else if(['thousand','k'].includes(u))n*=1e3; return n;}}
  return null;
}
function moneyLabel(n){if(n==null)return null; if(n>=1e9)return '$'+(n/1e9).toFixed(n%1e9?'1':'0')+'B'; if(n>=1e6)return '$'+(n/1e6).toFixed(n%1e6?'1':'0')+'M'; if(n>=1e3)return '$'+Math.round(n/1e3)+'K'; return '$'+Math.round(n);}
function category(text){const t=text.toLowerCase(); if(/bet|wager|gambl/.test(t))return 'Betting'; if(/mansion|house|home|real estate|property/.test(t))return 'Real Estate'; if(/jet|plane|yacht|ferrari|lamborghini|porsche|rolls-royce|bugatti|car /.test(t))return 'Luxury'; if(/watch|jewelry|diamond/.test(t))return 'Luxury'; if(/invest|stake|funding|startup/.test(t))return 'Investment'; if(/contract|deal|company|business/.test(t))return 'Business'; return 'Spending';}
function status(text){const t=text.toLowerCase(); if(/according to|reported|reports|sources|revealed/.test(t))return 'Reported'; return 'Reported';}
function sourceFromGoogleLink(u){try{const x=new URL(u); const o=x.searchParams.get('url'); return o||u;}catch{return u;}}
function stableId(s){let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0).toString(16);}

export async function fetchGoogleNews(){
  const seen=new Map();
  for(const q of QUERIES){
    const url='https://news.google.com/rss/search?q='+encodeURIComponent(q+' when:2d')+'&hl=en-US&gl=US&ceid=US:en';
    try{
      const r=await fetch(url,{headers:{'user-agent':'PocketWatch/0.3 news-reader'}}); if(!r.ok) continue;
      const xml=await r.text();
      for(const b of blocks(xml)){
        const title=tag(b,'title'); const desc=tag(b,'description'); const published=tag(b,'pubDate')||tag(b,'published'); const gLink=linkOf(b); const link=sourceFromGoogleLink(gLink);
        const text=strip(title+' '+desc); const person=personFor(text); const amount=amountFor(text);
        if(!person||!amount) continue;
        const key=person+'|'+amount+'|'+title.toLowerCase().replace(/[^a-z0-9 ]/g,'').slice(0,90);
        if(seen.has(key)) continue;
        let source='Google News'; try{source=new URL(link).hostname.replace(/^www\./,'');}catch{}
        seen.set(key,{id:stableId(link||title),name:person,cat:category(text),amount:moneyLabel(amount),amountValue:amount,title,desc:desc||title,status:status(text),source,sourceUrl:link||gLink,image:null,publishedAt:published||new Date().toISOString(),sourceType:'Google News RSS'});
      }
    }catch(e){/* one source/query failing should not kill feed */}
  }
  return [...seen.values()].sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,100);
}
