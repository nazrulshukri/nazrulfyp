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
