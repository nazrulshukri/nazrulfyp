// Free travel headlines from public RSS feeds (no API key needed).
// Only the headline, a short summary, the photo, the source and a link back
// to the publisher are shown; readers open the full story on the source site.
const FEEDS = {
  all: [
    ["BBC Travel", "https://www.bbc.com/travel/feed.rss"],
    ["Simple Flying", "https://simpleflying.com/feed/"],
    ["Skift", "https://skift.com/feed/"],
    ["AeroTime", "https://aerotime.aero/feed"],
    ["Railway Technology", "https://www.railway-technology.com/feed/"],
    ["Travel and Tour World", "https://www.travelandtourworld.com/feed/"],
  ],
  flights: [
    ["Simple Flying", "https://simpleflying.com/feed/"],
    ["AeroTime", "https://aerotime.aero/feed"],
  ],
  hotels: [
    ["Skift", "https://skift.com/feed/"],
    ["Hotel Designs", "https://hoteldesigns.net/feed/"],
    ["Travel Daily News", "https://www.traveldailynews.com/feed/"],
  ],
  trains: [
    ["Railway Technology", "https://www.railway-technology.com/feed/"],
    ["RailTech", "https://www.railtech.com/feed/"],
  ],
  travel: [
    ["BBC Travel", "https://www.bbc.com/travel/feed.rss"],
    ["Skift", "https://skift.com/feed/"],
    ["Travel and Tour World", "https://www.travelandtourworld.com/feed/"],
  ],
};

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_, e) => ENTITIES[e]);
const cdata = (s) => (s || "").replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
const tag = (xml, name) => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml);
  return m ? cdata(m[1]).trim() : "";
};
const text = (html) =>
  decode(decode(html).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const shorten = (s, n = 220) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);
const https = (u) => (u && /^https:\/\//i.test(u) ? u : null);

function imageOf(item) {
  const attr = (re) => {
    const m = re.exec(item);
    return m ? decode(m[1]) : null;
  };
  return (
    https(attr(/<media:content[^>]+url="([^"]+)"[^>]*(?:medium="image"|type="image)/i)) ||
    https(attr(/<media:content[^>]+url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i)) ||
    https(attr(/<media:thumbnail[^>]+url="([^"]+)"/i)) ||
    https(attr(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i)) ||
    https(attr(/<enclosure[^>]+type="image[^"]*"[^>]+url="([^"]+)"/i)) ||
    https(attr(/(?:<|&lt;)img[^>]+?src=(?:"|&quot;)([^"&]+)/i))
  );
}

/** Parses an RSS document into articles. */
function parseRss(xml, source) {
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [])
    .map((item) => {
      const title = text(tag(item, "title"));
      let description = text(tag(item, "description"))
        .replace(/\s*The post .*? appeared first on .*$/i, "")
        .replace(/\s*(?:Read more|Continue reading)\b.*$/i, "")
        .trim();
      // Some feeds repeat the headline at the start of the summary.
      if (title && description.toLowerCase().startsWith(title.toLowerCase())) description = description.slice(title.length).trim();
      const url = https(decode(tag(item, "link")));
      const when = new Date(tag(item, "pubDate") || tag(item, "dc:date"));
      return {
        title,
        description: shorten(description),
        url,
        image: imageOf(item),
        source,
        publishedAt: Number.isNaN(when.getTime()) ? null : when.toISOString(),
      };
    })
    .filter((a) => a.title && a.url);
}

async function fetchFeed([source, url]) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "BookingFlexNews/1.0 (+https://nazrulfyp.vercel.app/news)", Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!r.ok) throw new Error(`${source} returned ${r.status}`);
    return parseRss(await r.text(), source).slice(0, 12);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Newest articles for a topic. Sources take turns (newest first within each)
 * so one busy publisher can't fill the whole page.
 */
async function feedArticles(topic, limit = 30) {
  const results = await Promise.allSettled((FEEDS[topic] || FEEDS.travel).map(fetchFeed));
  results.filter((r) => r.status === "rejected").forEach((r) => console.error("News feed error:", r.reason && r.reason.message));
  const seen = new Set();
  const byDate = (a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "");
  const queues = results
    .map((r) => (r.status === "fulfilled" ? r.value : []).filter((a) => !seen.has(a.title.toLowerCase()) && seen.add(a.title.toLowerCase())).sort(byDate))
    .filter((q) => q.length)
    .sort((a, b) => byDate(a[0], b[0]));
  const out = [];
  while (out.length < limit && queues.some((q) => q.length)) queues.forEach((q) => q.length && out.length < limit && out.push(q.shift()));
  return out;
}

module.exports = { FEEDS, parseRss, feedArticles };
