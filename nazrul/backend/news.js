// News & deals: BookingFlex's own posts and vouchers (written by admins and
// stored in MongoDB), plus live travel headlines from GNews when
// GNEWS_API_KEY is set (free key at gnews.io; results cached for 30 minutes).
//   GET    /news                 published posts and active vouchers (public)
//   GET    /news/live?topic=...  travel headlines: flights | hotels | trains | travel (public)
//   GET    /news/admin           every post, drafts included (admins)
//   POST   /news/admin           create (admins)
//   PUT    /news/admin/:id       update (admins)
//   DELETE /news/admin/:id       delete (admins)
const express = require("express");
const mongoose = require("mongoose");
const { requireAdmin } = require("./authz");

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
const out = (p) => ({
  id: String(p._id),
  kind: p.kind,
  title: p.title,
  body: p.body,
  image: p.image,
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
  if ("image" in b) d.image = safeUrl(b.image);
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
};
const cache = new Map();
const CACHE_MS = 30 * 60 * 1000;

router.get("/live", async (req, res) => {
  const topic = TOPICS[req.query.topic] ? req.query.topic : "travel";
  const key = process.env.GNEWS_API_KEY && process.env.GNEWS_API_KEY.trim();
  if (!key) return res.json({ enabled: false, articles: [] });
  const hit = cache.get(topic);
  if (hit && Date.now() - hit.at < CACHE_MS) return res.json({ enabled: true, articles: hit.articles, cached: true });
  try {
    const url = `https://gnews.io/api/v4/search?${new URLSearchParams({ q: TOPICS[topic], lang: "en", max: "10", sortby: "publishedAt", apikey: key })}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const r = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
    if (!r.ok) throw new Error(`GNews returned ${r.status}`);
    const data = await r.json();
    const articles = (data.articles || []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.image,
      source: a.source && a.source.name,
      publishedAt: a.publishedAt,
    }));
    cache.set(topic, { at: Date.now(), articles });
    res.json({ enabled: true, articles });
  } catch (error) {
    console.error("Live news error:", error.message);
    // Serve the last good headlines rather than nothing.
    if (hit) return res.json({ enabled: true, articles: hit.articles, stale: true });
    res.json({ enabled: true, articles: [], error: "Live news is unavailable right now." });
  }
});

/* ---------- Admins ---------- */

router.get("/admin", requireAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected. Please try again." });
  const posts = await NewsPost.find({}).sort({ pinned: -1, createdAt: -1 }).limit(200).lean();
  res.json({ posts: posts.map(out) });
});

router.post("/admin", requireAdmin, async (req, res) => {
  const d = input(req.body || {});
  if (!d.kind || !d.title) return res.status(400).json({ message: "Add a type and a title." });
  if (d.kind === "voucher" && !d.code) return res.status(400).json({ message: "Vouchers need a code, e.g. FLEX15." });
  const p = await NewsPost.create({ ...d, author: req.user.email });
  res.status(201).json({ post: out(p.toObject()) });
});

router.put("/admin/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const p = await NewsPost.findByIdAndUpdate(req.params.id, { $set: input(req.body || {}) }, { new: true, runValidators: true }).lean();
  if (!p) return res.status(404).json({ message: "Post not found." });
  res.json({ post: out(p) });
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const { deletedCount } = await NewsPost.deleteOne({ _id: req.params.id });
  res.json({ removed: deletedCount > 0 });
});

// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  if (error.status === 400) return res.status(400).json({ message: error.message });
  console.error("News route error:", error);
  if (!res.headersSent) res.status(500).json({ message: "Something went wrong. Please try again." });
});

module.exports = { newsRouter: router, NewsPost };
