// Free data sources only: Google News RSS (per person) + optional YouTube channel RSS. No API keys.
const TYPES = [
  ["bet", /\b(bets?|betting|wagers?|parlay|gambl\w*|sportsbook|poker|casino)\b/i],
  ["investment", /\b(invest\w*|stakes?|backs|backed|funding|startup|equity|acquires?|owns)\b/i],
  ["purchase", /\b(buys?|bought|purchase\w*|mansion|estate|yacht|jet|watch|house|home|sells|sold|listing)\b/i],
  ["quote", /\b(net worth|money|millionaire|billionaire|salary|earns|earnings|budget|finances|wealth|fortune|debt)\b/i],
];
const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m ? decode(m[1]) : ""; };
const classify = t => { for (const [k, re] of TYPES) if (re.test(t)) return k; return null; };
const amount = t => { const m = t.match(/\$\s?\d[\d,.]*\s?(?:million|billion|thousand|[MBK])\b/i); return m ? m[0].replace(/^\$\s+/, "$") : ""; };
async function get(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Pocketwatch" }, signal: AbortSignal.timeout(8000) });
  return r.ok ? r.text() : "";
}
function build(who, title, url, date, src, kind) {
  const type = classify(title), d = new Date(date);
  if (!type || !url || isNaN(d)) return null;
  return { who, type, title, url, src, kind, amount: amount(title), date: d.toISOString() };
}
async function news(name) {
  const q = `"${name}" (bought OR buys OR purchase OR bet OR wager OR invests OR "net worth" OR mansion OR yacht) when:30d`;
  const xml = await get(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`);
  return xml.split("<item>").slice(1).map(it => {
    const src = tag(it, "source"); let title = tag(it, "title");
    if (src && title.endsWith(" - " + src)) title = title.slice(0, -(src.length + 3));
    return build(name, title, tag(it, "link"), tag(it, "pubDate"), src || "News", "article");
  });
}
async function videos(name, id) {
  const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
  return xml.split("<entry>").slice(1).map(it => {
    const m = it.match(/<link[^>]*href="([^"]+)"/);
    return build(name, tag(it, "title"), m ? m[1] : "", tag(it, "published"), "YouTube", "video");
  });
}
module.exports = async (req, res) => {
  let f = []; try { f = JSON.parse((req.query && req.query.f) || "[]"); } catch (e) {}
  f = (Array.isArray(f) ? f : []).slice(0, 20)
    .map(x => ({ name: String(x.name || "").slice(0, 60).trim(), yt: /^UC[\w-]{22}$/.test(x.yt || "") ? x.yt : "" }))
    .filter(x => x.name);
  const jobs = f.flatMap(p => [news(p.name), p.yt ? videos(p.name, p.yt) : Promise.resolve([])]);
  const out = (await Promise.allSettled(jobs)).flatMap(r => r.status === "fulfilled" ? r.value : []).filter(Boolean);
  const seen = new Set(), items = out.sort((a, b) => b.date.localeCompare(a.date))
    .filter(i => { const k = i.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 80);
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  res.status(200).json({ items });
};
module.exports._test = { classify, amount };
