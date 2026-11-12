// Orders: one record per completed flight, hotel or train booking, saved when
// the payment page finishes. Powers the admin dashboard and "My trips".
//   POST /orders           record (or update) a booking
//   GET  /orders/mine      the signed-in traveller's orders
//   GET  /admin/summary    totals and charts for admins (ADMIN_EMAILS)
const express = require("express");
const mongoose = require("mongoose");
const {
  Admin,
  readUser,
  requireUser,
  requireAdmin,
  requireSuperAdmin,
  superAdminEmails,
  configuredAdminEmails,
} = require("./authz");

const OrderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    kind: { type: String, enum: ["flight", "hotel", "train"], required: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    origin: { type: String, trim: true },
    destination: { type: String, trim: true },
    startAt: Date,
    endAt: Date,
    travellers: { type: Number, min: 1, max: 20, default: 1 },
    amountMyr: { type: Number, min: 0, max: 1_000_000, required: true },
    paymentMethod: { type: String, trim: true },
    status: { type: String, enum: ["confirmed", "changed", "cancelled"], default: "confirmed" },
    refundMyr: { type: Number, default: 0 },
    cancelledAt: Date,
  },
  { timestamps: true },
);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

const ordersRouter = express.Router();
const adminRouter = express.Router();
const dbReady = () => mongoose.connection.readyState === 1;
const clip = (v, n = 160) => (v == null ? undefined : String(v).slice(0, n));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

ordersRouter.post("/", async (req, res) => {
  const b = req.body || {};
  const amount = Number(b.amountMyr);
  if (!b.reference || !["flight", "hotel", "train"].includes(b.kind) || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ message: "Send reference, kind and amountMyr." });
  }
  if (!dbReady()) return res.status(202).json({ saved: false });
  // A signed-in traveller owns the order; guests are identified by the email
  // they entered at checkout.
  const user = readUser(req);
  const email = user ? user.email : EMAIL_RE.test(b.email || "") ? String(b.email).toLowerCase() : undefined;
  const date = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : undefined);
  const doc = {
    kind: b.kind,
    email,
    title: clip(b.title),
    subtitle: clip(b.subtitle),
    origin: clip(b.origin, 80),
    destination: clip(b.destination, 80),
    startAt: date(b.startAt),
    endAt: date(b.endAt),
    travellers: Math.min(20, Math.max(1, Number(b.travellers) || 1)),
    amountMyr: Math.round(amount * 100) / 100,
    paymentMethod: clip(b.paymentMethod, 40),
  };
  try {
    // Re-sending the same booking updates it instead of counting it twice.
    const order = await Order.findOneAndUpdate(
      { reference: clip(b.reference, 60) },
      { $set: doc, $setOnInsert: { status: "confirmed" } },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json({ saved: true, reference: order.reference });
  } catch (error) {
    console.error("Save order error:", error.message);
    res.status(500).json({ message: "Could not save the order." });
  }
});

ordersRouter.get("/mine", requireUser, async (req, res) => {
  if (!dbReady()) return res.json({ orders: [] });
  const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ orders });
});

const dayKey = (d) => d.toISOString().slice(0, 10);

// Payments saved by the older booking flow, before orders existed. They
// have no date field, so their creation time comes from the record id.
// The old flow still writes these alongside orders, so only records from
// before the first order are counted (30 minutes earlier, because the old
// flight record is written at the traveller-details step, before payment).
async function legacyOrders(since) {
  const db = mongoose.connection.db;
  const sinceId = mongoose.Types.ObjectId.createFromTime(Math.floor(since / 1000));
  const first = await Order.findOne().sort({ createdAt: 1 }).select("createdAt").lean();
  const range = { $gte: sinceId };
  if (first) range.$lt = mongoose.Types.ObjectId.createFromTime(Math.floor(first.createdAt / 1000) - 30 * 60);
  const read = async (name) => {
    try {
      return await db.collection(name).find({ _id: range }).toArray();
    } catch {
      return [];
    }
  };
  const [flights, trains] = await Promise.all([read("payments"), read("paymenttrains")]);
  const at = (d) => d._id.getTimestamp();
  return [
    ...flights.map((p) => ({
      reference: `OLD-${String(p._id).slice(-6).toUpperCase()}`,
      kind: "flight",
      title: "Flight booking",
      amountMyr: Number(p.amount) || 0,
      paymentMethod: p.paymentMethod,
      status: "confirmed",
      createdAt: at(p),
      legacy: true,
    })),
    ...trains.map((p) => ({
      reference: `OLD-${String(p._id).slice(-6).toUpperCase()}`,
      kind: "train",
      title: p.origin && p.destination ? `${p.origin} → ${p.destination}` : "Train booking",
      amountMyr: Number(p.totalPrice) || 0,
      paymentMethod: p.paymentMethod,
      status: "confirmed",
      createdAt: at(p),
      legacy: true,
    })),
  ];
}

adminRouter.get("/summary", requireAdmin, async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 30));
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  try {
    const User = mongoose.models.User;
    const [newOrders, legacy, totalUsers, newUsers, recentNew] = await Promise.all([
      Order.find({ createdAt: { $gte: since } }).lean(),
      legacyOrders(since),
      User ? User.estimatedDocumentCount() : 0,
      // Users have no createdAt; their ObjectId carries the creation time.
      User ? User.countDocuments({ _id: { $gte: mongoose.Types.ObjectId.createFromTime(Math.floor(since / 1000)) } }) : 0,
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    const orders = [...newOrders, ...legacy];
    const recent = [...recentNew, ...legacy]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const live = orders.filter((o) => o.status !== "cancelled");
    const revenue = live.reduce((s, o) => s + o.amountMyr, 0);
    const byDay = new Map();
    for (let i = 0; i < days; i += 1) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      byDay.set(dayKey(d), { date: dayKey(d), revenue: 0, orders: 0 });
    }
    for (const o of live) {
      const row = byDay.get(dayKey(new Date(o.createdAt)));
      if (row) {
        row.revenue += o.amountMyr;
        row.orders += 1;
      }
    }
    const tally = (key) => {
      const m = new Map();
      for (const o of live) {
        const k = o[key] || "Other";
        const row = m.get(k) || { name: k, orders: 0, revenue: 0 };
        row.orders += 1;
        row.revenue += o.amountMyr;
        m.set(k, row);
      }
      return [...m.values()].sort((a, b) => b.revenue - a.revenue);
    };

    res.json({
      range: { days, since },
      totals: {
        revenue: Math.round(revenue * 100) / 100,
        orders: live.length,
        averageOrder: live.length ? Math.round((revenue / live.length) * 100) / 100 : 0,
        cancelled: orders.length - live.length,
        refunds: orders.reduce((s, o) => s + (o.refundMyr || 0), 0),
        users: totalUsers,
        newUsers,
      },
      daily: [...byDay.values()].map((d) => ({ ...d, revenue: Math.round(d.revenue * 100) / 100 })),
      byKind: ["flight", "hotel", "train"].map((k) => {
        const rows = live.filter((o) => o.kind === k);
        return { kind: k, orders: rows.length, revenue: rows.reduce((s, o) => s + o.amountMyr, 0) };
      }),
      topRoutes: tally("title").slice(0, 6),
      paymentMethods: tally("paymentMethod").slice(0, 6),
      recent: recent.map((o) => ({
        reference: o.reference,
        kind: o.kind,
        title: o.title,
        email: o.email,
        amountMyr: o.amountMyr,
        status: o.status,
        createdAt: o.createdAt,
        legacy: Boolean(o.legacy),
      })),
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    res.status(500).json({ message: "Could not load the dashboard." });
  }
});

adminRouter.get("/me", requireAdmin, (req, res) => res.json({ admin: true, role: req.user.role, email: req.user.email }));

// Team access: super admins add and remove admins. People listed in the
// server settings are shown but can only be changed there.
adminRouter.get("/admins", requireSuperAdmin, async (req, res) => {
  const stored = dbReady() ? await Admin.find().sort({ createdAt: 1 }).lean() : [];
  const rows = [
    ...superAdminEmails().map((email) => ({ email, role: "super", source: "settings" })),
    ...configuredAdminEmails()
      .filter((e) => !superAdminEmails().includes(e))
      .map((email) => ({ email, role: "admin", source: "settings" })),
    ...stored
      .filter((a) => !superAdminEmails().includes(a.email) && !configuredAdminEmails().includes(a.email))
      .map((a) => ({ email: a.email, role: "admin", source: "dashboard", addedBy: a.addedBy, addedAt: a.createdAt })),
  ];
  res.json({ admins: rows });
});

adminRouter.post("/admins", requireSuperAdmin, async (req, res) => {
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  if (superAdminEmails().includes(email) || configuredAdminEmails().includes(email)) {
    return res.status(409).json({ message: "That email already has access." });
  }
  await Admin.updateOne({ email }, { $setOnInsert: { email, addedBy: req.user.email } }, { upsert: true });
  res.status(201).json({ added: email });
});

adminRouter.delete("/admins/:email", requireSuperAdmin, async (req, res) => {
  const email = String(req.params.email || "").trim().toLowerCase();
  if (superAdminEmails().includes(email) || configuredAdminEmails().includes(email)) {
    return res.status(409).json({ message: "This admin is set in the server settings; change it there." });
  }
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const { deletedCount } = await Admin.deleteOne({ email });
  if (!deletedCount) return res.status(404).json({ message: "No admin with that email." });
  res.json({ removed: email });
});

module.exports = { ordersRouter, adminRouter, Order };
