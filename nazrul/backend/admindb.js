// Read-only database browser for super admins: GET /admin/db lists the
// collections with record counts, GET /admin/db/:name returns a page of
// records. Passwords, tokens and payment details are never sent.
const express = require("express");
const mongoose = require("mongoose");
const { requireSuperAdmin } = require("./authz");

const router = express.Router();

// Only these collections can be browsed, each with a plain-English label.
const COLLECTIONS = {
  users: "Accounts",
  orders: "Bookings (orders)",
  payments: "Flight payments (older)",
  paymenttrains: "Train payments (older)",
  hotelpayments: "Hotel payments (older)",
  hotels: "Hotels picked",
  bookings: "Searches",
  flightresults: "Flights picked",
  flightreturns: "Return flights picked",
  inquiries: "Contact messages",
  admins: "Admins",
};

const SECRET = /pass(word)?|token|secret|card|cvv|cvc|iban|account(number)?|paymentdetail|passport/i;

function redact(value, depth = 0) {
  if (value == null || depth > 4) return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "__v") continue;
      out[k] = SECRET.test(k) ? "•••" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

const dbReady = () => mongoose.connection.readyState === 1;

router.get("/", requireSuperAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const existing = new Set((await mongoose.connection.db.listCollections().toArray()).map((c) => c.name));
  const rows = await Promise.all(
    Object.entries(COLLECTIONS).map(async ([name, label]) => ({
      name,
      label,
      count: existing.has(name) ? await mongoose.connection.db.collection(name).estimatedDocumentCount() : 0,
    })),
  );
  res.json({ collections: rows });
});

// How the collections refer to each other. "verify" checks a sample of
// records to show how many references actually resolve.
const RELATIONS = [
  { from: "payments", field: "userId", to: "users", toField: "_id", kind: "many-to-one", note: "Who paid" },
  { from: "payments", field: "bookingId", to: "bookings", toField: "_id", kind: "many-to-one", note: "Which search/booking was paid" },
  { from: "orders", field: "email", to: "users", toField: "email", kind: "many-to-one", note: "Traveller (guests may have no account)" },
  { from: "admins", field: "email", to: "users", toField: "email", kind: "one-to-one", note: "Account given admin access" },
  { from: "admins", field: "addedBy", to: "users", toField: "email", kind: "many-to-one", note: "Super admin who added them" },
  { from: "inquiries", field: "email", to: "users", toField: "email", kind: "many-to-one", note: "Sender, if they have an account" },
  { from: "hotelpayments", field: "userData.email", to: "users", toField: "email", kind: "many-to-one", note: "Guest who paid" },
];

const typeOf = (v) => {
  if (v === null) return "null";
  if (v instanceof mongoose.Types.ObjectId) return "ObjectId";
  if (v instanceof Date) return "Date";
  if (Array.isArray(v)) return "Array";
  return typeof v === "object" ? "Object" : typeof v === "number" ? "Number" : typeof v === "boolean" ? "Boolean" : "String";
};
const getPath = (doc, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), doc);

router.get("/schema", requireSuperAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const db = mongoose.connection.db;
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  try {
    const collections = await Promise.all(
      Object.entries(COLLECTIONS).map(async ([name, label]) => {
        if (!existing.has(name)) return { name, label, count: 0, fields: [], indexes: [] };
        const col = db.collection(name);
        const [count, sample, indexes] = await Promise.all([
          col.estimatedDocumentCount(),
          col.find({}).sort({ _id: -1 }).limit(100).toArray(),
          col.indexes(),
        ]);
        const fields = new Map();
        for (const doc of sample) {
          for (const [k, v] of Object.entries(doc)) {
            if (k === "__v") continue;
            const f = fields.get(k) || { name: k, types: new Set(), seen: 0 };
            f.types.add(typeOf(v));
            f.seen += 1;
            fields.set(k, f);
          }
        }
        const indexed = new Map();
        for (const ix of indexes) {
          const keys = Object.keys(ix.key);
          keys.forEach((k) => indexed.set(k, ix.unique || k === "_id" ? "unique" : "index"));
        }
        return {
          name,
          label,
          count,
          fields: [...fields.values()].map((f) => ({
            name: f.name,
            type: [...f.types].join(" | "),
            presentPct: sample.length ? Math.round((f.seen / sample.length) * 100) : 0,
            hidden: SECRET.test(f.name),
            key: f.name === "_id" ? "primary" : indexed.get(f.name) || null,
            ref: RELATIONS.find((r) => r.from === name && r.field.split(".")[0] === f.name) || null,
          })),
          indexes: indexes.map((ix) => ({
            name: ix.name,
            keys: Object.keys(ix.key),
            unique: Boolean(ix.unique) || ix.name === "_id_",
          })),
        };
      }),
    );

    const relations = await Promise.all(
      RELATIONS.map(async (r) => {
        if (!existing.has(r.from) || !existing.has(r.to)) return { ...r, checked: 0, matched: 0 };
        const docs = await db.collection(r.from).find({}).limit(200).toArray();
        const values = docs.map((d) => getPath(d, r.field)).filter((v) => v != null && v !== "");
        let matched = 0;
        if (values.length) {
          const found = await db
            .collection(r.to)
            .find({ [r.toField]: { $in: values } })
            .project({ [r.toField]: 1 })
            .toArray();
          const keys = new Set(found.map((f) => String(f[r.toField]).toLowerCase()));
          matched = values.filter((v) => keys.has(String(v).toLowerCase())).length;
        }
        return { ...r, checked: values.length, matched };
      }),
    );
    res.json({ collections, relations });
  } catch (error) {
    console.error("Schema error:", error.message);
    res.status(500).json({ message: "Could not read the database structure." });
  }
});

// Prices people actually paid, grouped by route/stay, from every source.
router.get("/prices", requireSuperAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const db = mongoose.connection.db;
  const read = (name, filter = {}) => db.collection(name).find(filter).toArray().catch(() => []);
  const [orders, flightPays, trainPays, hotels, flightPicks, returnPicks] = await Promise.all([
    read("orders", { status: { $ne: "cancelled" } }),
    read("payments"),
    read("paymenttrains"),
    read("hotels"),
    read("flightresults"),
    read("flightreturns"),
  ]);
  const rows = [
    ...orders.map((o) => ({ kind: o.kind, item: o.title || o.kind, price: o.amountMyr, at: o.createdAt, source: "Bookings" })),
    ...flightPays.map((p) => ({ kind: "flight", item: "Flight booking (older)", price: Number(p.amount), at: p._id.getTimestamp(), source: "Flight payments" })),
    ...trainPays.map((p) => ({
      kind: "train",
      item: p.origin && p.destination ? `${p.origin} → ${p.destination}` : "Train",
      price: Number(p.totalPrice),
      at: p._id.getTimestamp(),
      source: "Train payments",
    })),
    ...hotels.map((h) => ({ kind: "hotel", item: h.hotelName || h.location || "Hotel", price: Number(h.price), at: h._id.getTimestamp(), source: "Hotels picked" })),
    ...[...flightPicks, ...returnPicks].map((f) => ({
      kind: "flight",
      item: `${f.airline || "Flight"} ${f.flightNumber || ""}`.trim(),
      price: Number(f.price),
      at: f._id.getTimestamp(),
      source: "Flights picked",
    })),
  ].filter((r) => Number.isFinite(r.price) && r.price > 0);

  const groups = new Map();
  for (const r of rows) {
    const key = `${r.kind}|${r.item}`;
    const g = groups.get(key) || { kind: r.kind, item: r.item, count: 0, min: Infinity, max: 0, sum: 0, last: null, lastPrice: 0, sources: new Set() };
    g.count += 1;
    g.min = Math.min(g.min, r.price);
    g.max = Math.max(g.max, r.price);
    g.sum += r.price;
    g.sources.add(r.source);
    if (!g.last || r.at > g.last) {
      g.last = r.at;
      g.lastPrice = r.price;
    }
    groups.set(key, g);
  }
  res.json({
    items: [...groups.values()]
      .map((g) => ({ ...g, avg: Math.round((g.sum / g.count) * 100) / 100, sources: [...g.sources], sum: undefined }))
      .sort((a, b) => b.count - a.count || b.avg - a.avg),
    history: rows
      .sort((a, b) => a.at - b.at)
      .map((r) => ({ kind: r.kind, item: r.item, price: r.price, at: r.at, source: r.source })),
  });
});

router.get("/:name", requireSuperAdmin, async (req, res) => {
  const { name } = req.params;
  if (!COLLECTIONS[name]) return res.status(404).json({ message: "Unknown collection." });
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 20));
  const page = Math.max(1, Number(req.query.page) || 1);
  const q = String(req.query.q || "").trim().slice(0, 80);
  const col = mongoose.connection.db.collection(name);

  let filter = {};
  if (q) {
    // Search the text fields of a sample record (never the hidden ones).
    const sample = await col.findOne({});
    const fields = sample
      ? Object.entries(sample)
          .filter(([k, v]) => typeof v === "string" && !SECRET.test(k))
          .map(([k]) => k)
      : [];
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter = fields.length ? { $or: fields.map((f) => ({ [f]: rx })) } : { _id: null };
  }
  try {
    const [total, docs] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    ]);
    res.json({
      name,
      label: COLLECTIONS[name],
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      rows: docs.map((d) => ({
        ...redact(d),
        // Every record's id carries the time it was created.
        _created: d._id && d._id.getTimestamp ? d._id.getTimestamp().toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("Admin db error:", error.message);
    res.status(500).json({ message: "Could not read that collection." });
  }
});

module.exports = router;
