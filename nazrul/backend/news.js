// News & deals: BookingFlex's own posts and vouchers (written by admins and
// stored in MongoDB), plus live travel headlines from public RSS feeds
// (newsFeeds.js) and GNews when GNEWS_API_KEY is set. Cached for 30 minutes.
//   GET    /news                 published posts and active vouchers (public)
//   GET    /news/live?topic=...  travel headlines: all | flights | hotels | trains | travel (public)
//   GET    /news/admin           every post, drafts included (admins)
//   POST   /news/admin           create (admins)
//   PUT    /news/admin/:id       update (admins)
//   DELETE /news/admin/:id       delete (admins)
//   POST   /news/admin/media     upload a photo, video or song, raw body up to 4 MB (admins)
//   GET    /news/media/:id       a post's photo, video or song (public)
const express = require("express");
const mongoose = require("mongoose");
const { requireAdmin } = require("./authz");
const { feedArticles } = require("./newsFeeds");
const { MAX_UPLOAD, saveBuffer, findFile, removeFile, sendFile } = require("./mediaStore");

const MEDIA_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"],
};
const ALL_TYPES = Object.values(MEDIA_TYPES).flat();
const kindOf = (mime) => Object.keys(MEDIA_TYPES).find((k) => MEDIA_TYPES[k].includes(mime));
const MAX_MEDIA = 8;

const router = express.Router();
for (const method of ["get", "post", "put", "delete"]) {
  const original = router[method].bind(router);
  router[method] = (path, ...handlers) =>
    original(path, ...handlers.map((h) => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}

const KINDS = ["voucher", "news", "flight", "hotel", "train"];
const NewsSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: KINDS, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, trim: true, maxlength: 1500 },
    image: { type: String, trim: true, maxlength: 600 }, // https:// image URL
    // Uploaded photos, videos and songs, in the order they're shown.
    media: [
      {
        _id: false,
        kind: { type: String, enum: ["image", "video", "audio"] },
        id: String, // file in the "media" GridFS bucket
        name: { type: String, maxlength: 120 },
        poster: String, // video cover image, also an uploaded file
      },
    ],
    link: { type: String, trim: true, maxlength: 600 }, // optional "Learn more"
    code: { type: String, trim: true, uppercase: true, maxlength: 24 }, // vouchers
    discount: { type: String, trim: true, maxlength: 40 }, // e.g. "15% off" or "RM 50 off"
    validUntil: Date,
    pinned: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    author: { type: String, lowercase: true },
  },
  { timestamps: true },
);
NewsSchema.index({ published: 1, pinned: -1, createdAt: -1 });
const NewsPost = mongoose.models.NewsPost || mongoose.model("NewsPost", NewsSchema);

const dbReady = () => mongoose.connection.readyState === 1;
const clip = (v, n) => (v == null ? undefined : String(v).trim().slice(0, n));
const safeUrl = (v) => {
  const s = clip(v, 600);
  return s && /^https:\/\//i.test(s) ? s : undefined;
};
// Relative to the API; the website prefixes its API address.
const mediaPath = (m) => (m && m.id ? `/news/media/${m.id}` : undefined);

/** Keeps only media that was uploaded here for news, with its real type. */
async function cleanMedia(list) {
  if (!Array.isArray(list)) return [];
  const outList = [];
  for (const m of list.slice(0, MAX_MEDIA)) {
    const file = m && (await findFile(m.id));
    if (!file || !file.metadata || file.metadata.scope !== "news") continue;
    const kind = kindOf(file.metadata.contentType);
    const poster = kind === "video" && m.poster ? await findFile(m.poster) : null;
    outList.push({
      kind,
      id: String(file._id),
      name: clip(m.name, 120) || undefined,
      poster: poster && poster.metadata && poster.metadata.scope === "news" ? String(poster._id) : undefined,
    });
  }
  return outList;
}
const fileIds = (media) => (media || []).flatMap((m) => [m.id, m.poster]).filter(Boolean);

const out = (p) => ({
  id: String(p._id),
  kind: p.kind,
  title: p.title,
  body: p.body,
  // Cover: an image link, else the first uploaded photo, else a video cover.
  image:
    p.image ||
    mediaPath((p.media || []).find((m) => m.kind === "image")) ||
    mediaPath({ id: ((p.media || []).find((m) => m.kind === "video" && m.poster) || {}).poster }),
  imageLink: p.image,
  media: (p.media || []).map((m) => ({ kind: m.kind, id: m.id, name: m.name, url: mediaPath(m), poster: m.poster ? mediaPath({ id: m.poster }) : undefined, posterId: m.poster })),
  link: p.link,
  code: p.code,
  discount: p.discount,
  validUntil: p.validUntil,
  pinned: p.pinned,
  published: p.published,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

function input(b) {
  const d = {};
  if ("kind" in b) {
    if (!KINDS.includes(b.kind)) throw Object.assign(new Error("Choose a type: voucher, news, flight, hotel or train."), { status: 400 });
    d.kind = b.kind;
  }
  if ("title" in b) d.title = clip(b.title, 120);
  if ("body" in b) d.body = clip(b.body, 1500);
  if ("image" in b) d.image = safeUrl(b.image) || "";
  if ("link" in b) d.link = safeUrl(b.link);
  if ("code" in b) d.code = clip(b.code, 24) ? clip(b.code, 24).toUpperCase().replace(/[^A-Z0-9-]/g, "") : undefined;
  if ("discount" in b) d.discount = clip(b.discount, 40);
  if ("validUntil" in b) d.validUntil = b.validUntil && !Number.isNaN(new Date(b.validUntil).getTime()) ? new Date(b.validUntil) : undefined;
  if ("pinned" in b) d.pinned = Boolean(b.pinned);
  if ("published" in b) d.published = Boolean(b.published);
  return d;
}

/* ---------- Public ---------- */

router.get("/", async (req, res) => {
  if (!dbReady()) return res.json({ posts: [] });
  const now = new Date();
  const posts = await NewsPost.find({
    published: true,
    // Expired vouchers disappear by themselves.
    $or: [{ kind: { $ne: "voucher" } }, { validUntil: null }, { validUntil: { $gte: now } }],
  })
    .sort({ pinned: -1, createdAt: -1 })
    .limit(60)
    .lean();
  res.set("Cache-Control", "public, max-age=60");
  res.json({ posts: posts.map(out) });
});

const TOPICS = {
  flights: '(airline OR flights OR airport) AND (Malaysia OR "Kuala Lumpur" OR AirAsia OR "Malaysia Airlines")',
  hotels: "(hotel OR resort OR hospitality) AND (Malaysia OR travel)",
  trains: '(KTM OR "ETS train" OR "KLIA Ekspres" OR railway) AND Malaysia',
  travel: '(travel OR tourism OR "visit Malaysia") AND (Malaysia OR Asia)',
  all: '(travel OR tourism OR airline OR hotel) AND (Malaysia OR Asia)',
};
const cache = new Map();
const CACHE_MS = 30 * 60 * 1000;

async function gnewsArticles(topic) {
  const key = process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY.trim();
  if (!key) return [];
  const url = `https://gnews.io/api/v4/search?${new URLSearchParams({ q: TOPICS[topic], lang: "en", max: "10", sortby: "publishedAt", apikey: key })}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`GNews returned ${r.status}`);
    const data = await r.json();
    return (data.articles || []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      source: a.source && a.source.name,
      publishedAt: a.publishedAt,
    }));
  } catch (error) {
    console.error("GNews error:", error.message);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

router.get("/live", async (req, res) => {
  const topic = TOPICS[req.query.topic] ? req.query.topic : "travel";
  const hit = cache.get(topic);
  if (hit && Date.now() - hit.at < CACHE_MS) return res.json({ enabled: true, articles: hit.articles, cached: true });
  try {
    const [feeds, gnews] = await Promise.all([feedArticles(topic), gnewsArticles(topic)]);
    const seen = new Set();
    const articles = [...gnews, ...feeds]
      .filter((a) => a.url && !seen.has(a.url) && seen.add(a.url))
      .slice(0, 30);
    if (!articles.length) throw new Error("No headlines from any source");
    cache.set(topic, { at: Date.now(), articles });
    res.set("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");
    res.json({ enabled: true, articles });
  } catch (error) {
    console.error("Live news error:", error.message);
    // Serve the last good headlines rather than nothing.
    if (hit) return res.json({ enabled: true, articles: hit.articles, stale: true });
    res.json({ enabled: true, articles: [], error: "Live news is unavailable right now." });
  }
});

// Photos, videos and songs used in news posts. Anyone can open them, like the
// News page itself; files uploaded elsewhere (e.g. private posts) are not served.
router.get("/media/:id", async (req, res, next) => {
  if (!dbReady()) return res.status(503).end();
  const file = await findFile(req.params.id);
  if (!file || !file.metadata || file.metadata.scope !== "news") return res.status(404).end();
  return sendFile(file, req, res, next, "public, max-age=604800, immutable");
});

/* ---------- Admins ---------- */

router.get("/admin", requireAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected. Please try again." });
  const posts = await NewsPost.find({}).sort({ pinned: -1, createdAt: -1 }).limit(200).lean();
  res.json({ posts: posts.map(out) });
});

router.post(
  "/admin/media",
  requireAdmin,
  express.raw({ type: ALL_TYPES, limit: MAX_UPLOAD }),
  async (req, res) => {
    const mime = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (!kindOf(mime) || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ message: "Upload a photo (JPG, PNG, WebP, GIF), a video (MP4, MOV, WebM) or a song (MP3, M4A, WAV, OGG)." });
    }
    const name = clip(decodeURIComponent(String(req.headers["x-file-name"] || "")), 120);
    const id = await saveBuffer(req.body, { scope: "news", owner: req.user.email, contentType: mime, name });
    res.status(201).json({ id, kind: kindOf(mime), url: mediaPath({ id }) });
  },
);

router.post("/admin", requireAdmin, async (req, res) => {
  const d = input(req.body || {});
  if ("media" in (req.body || {})) d.media = await cleanMedia(req.body.media);
  if (!d.kind || !d.title) return res.status(400).json({ message: "Add a type and a title." });
  if (d.kind === "voucher" && !d.code) return res.status(400).json({ message: "Vouchers need a code, e.g. FLEX15." });
  const p = await NewsPost.create({ ...d, author: req.user.email });
  res.status(201).json({ post: out(p.toObject()) });
});

router.put("/admin/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const d = input(req.body || {});
  if ("media" in (req.body || {})) d.media = await cleanMedia(req.body.media);
  const before = await NewsPost.findByIdAndUpdate(req.params.id, { $set: d }, { runValidators: true }).lean();
  if (!before) return res.status(404).json({ message: "Post not found." });
  // Files taken off the post are deleted.
  if (d.media) {
    const keep = new Set(fileIds(d.media));
    await Promise.all(fileIds(before.media).filter((id) => !keep.has(id)).map(removeFile));
  }
  const p = await NewsPost.findById(req.params.id).lean();
  res.json({ post: out(p) });
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const p = await NewsPost.findByIdAndDelete(req.params.id).lean();
  if (p) await Promise.all(fileIds(p.media).map(removeFile));
  res.json({ removed: Boolean(p) });
});

// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  if (error.status === 400) return res.status(400).json({ message: error.message });
  if (error.type === "entity.too.large") return res.status(413).json({ message: "That file is too large. Each file can be up to 4 MB." });
  console.error("News route error:", error);
  if (!res.headersSent) res.status(500).json({ message: "Something went wrong. Please try again." });
});

module.exports = { newsRouter: router, NewsPost };
