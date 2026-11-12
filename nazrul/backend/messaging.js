// Chat and voice/video call signalling between friends. Signed-in only.
//   GET  /messages/chats                    conversations with last message + unread
//   GET  /messages/chats/:email?after=ISO    messages with a friend (marks them read)
//   POST /messages/chats/:email  {text}      send a message
//   GET  /messages/unread                    total unread messages
//   POST /messages/calls  {to, kind, offer}  start a call (kind: audio | video)
//   GET  /messages/calls/incoming            calls ringing for me
//   GET  /messages/calls/:id                 call state (status, answer)
//   POST /messages/calls/:id/answer {answer} accept
//   POST /messages/calls/:id/end {status}    decline / hang up
// Calls are browser-to-browser (WebRTC); the server only passes the
// connection descriptions between the two people.
const express = require("express");
const mongoose = require("mongoose");
const { requireUser } = require("./authz");

const router = express.Router();
for (const method of ["get", "post"]) {
  const original = router[method].bind(router);
  router[method] = (path, ...handlers) =>
    original(path, ...handlers.map((h) => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true },
    to: { type: String, required: true, lowercase: true },
    text: { type: String, required: true, maxlength: 2000 },
    readAt: Date,
  },
  { timestamps: true },
);
MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
MessageSchema.index({ to: 1, readAt: 1 });

const CallSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true },
    to: { type: String, required: true, lowercase: true },
    kind: { type: String, enum: ["audio", "video"], default: "video" },
    status: { type: String, enum: ["ringing", "accepted", "declined", "ended", "missed"], default: "ringing" },
    offer: { type: Object },
    answer: { type: Object },
    endedBy: String,
  },
  { timestamps: true },
);
CallSchema.index({ to: 1, status: 1, createdAt: -1 });
CallSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 24 * 3600 }); // old call records clean themselves up

const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);
const Message = model("Message", MessageSchema);
const Call = model("Call", CallSchema);
const Friend = () => mongoose.models.Friend;
const Profile = () => mongoose.models.Profile;

const RING_MS = 45 * 1000;
const dbReady = () => mongoose.connection.readyState === 1;

router.use(requireUser);
router.use((req, res, next) => (dbReady() ? next() : res.status(503).json({ message: "The database isn't connected. Please try again." })));

async function friendsOf(email) {
  const F = Friend();
  if (!F) return [];
  const rows = await F.find({ status: "accepted", $or: [{ from: email }, { to: email }] }).lean();
  return rows.map((r) => (r.from === email ? r.to : r.from));
}
async function isFriend(a, b) {
  const F = Friend();
  return Boolean(F && (await F.exists({ status: "accepted", $or: [{ from: a, to: b }, { from: b, to: a }] })));
}
async function people(emails) {
  const P = Profile();
  const list = P ? await P.find({ email: { $in: emails } }).lean() : [];
  const by = Object.fromEntries(list.map((p) => [p.email, p]));
  return Object.fromEntries(
    emails.map((e) => [
      e,
      {
        email: e,
        name: (by[e] && by[e].name) || e.split("@")[0],
        avatar: (by[e] && by[e].avatar) || { kind: "character", character: "traveller" },
        mood: by[e] && by[e].mood,
      },
    ]),
  );
}
const friendParam = (req) => String(req.params.email || "").trim().toLowerCase();
const msgOut = (m, me) => ({ id: String(m._id), mine: m.from === me, text: m.text, at: m.createdAt, read: Boolean(m.readAt) });

/* ---------- Chat ---------- */

router.get("/chats", async (req, res) => {
  const me = req.user.email;
  const friends = await friendsOf(me);
  const [lasts, unread] = await Promise.all([
    Message.aggregate([
      { $match: { $or: [{ from: me, to: { $in: friends } }, { to: me, from: { $in: friends } }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: { $cond: [{ $eq: ["$from", me] }, "$to", "$from"] }, last: { $first: "$$ROOT" } } },
    ]),
    Message.aggregate([{ $match: { to: me, readAt: null, from: { $in: friends } } }, { $group: { _id: "$from", n: { $sum: 1 } } }]),
  ]);
  const lastBy = Object.fromEntries(lasts.map((l) => [l._id, l.last]));
  const unreadBy = Object.fromEntries(unread.map((u) => [u._id, u.n]));
  const who = await people(friends);
  const chats = friends
    .map((f) => ({
      friend: who[f],
      last: lastBy[f] ? msgOut(lastBy[f], me) : null,
      unread: unreadBy[f] || 0,
    }))
    .sort((a, b) => new Date((b.last && b.last.at) || 0) - new Date((a.last && a.last.at) || 0));
  res.json({ chats });
});

router.get("/unread", async (req, res) => {
  const me = req.user.email;
  const friends = await friendsOf(me);
  const n = await Message.countDocuments({ to: me, readAt: null, from: { $in: friends } });
  res.json({ unread: n });
});

router.get("/chats/:email", async (req, res) => {
  const me = req.user.email;
  const other = friendParam(req);
  if (!(await isFriend(me, other))) return res.status(403).json({ message: "You can only chat with friends." });
  const filter = { $or: [{ from: me, to: other }, { from: other, to: me }] };
  const after = req.query.after ? new Date(req.query.after) : null;
  if (after && !Number.isNaN(after.getTime())) filter.createdAt = { $gt: after };
  const list = await Message.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  await Message.updateMany({ from: other, to: me, readAt: null }, { $set: { readAt: new Date() } });
  const who = await people([other]);
  res.json({ friend: who[other], messages: list.reverse().map((m) => msgOut(m, me)) });
});

router.post("/chats/:email", async (req, res) => {
  const me = req.user.email;
  const other = friendParam(req);
  const text = String((req.body || {}).text || "").trim().slice(0, 2000);
  if (!text) return res.status(400).json({ message: "Write a message first." });
  if (!(await isFriend(me, other))) return res.status(403).json({ message: "You can only chat with friends." });
  const m = await Message.create({ from: me, to: other, text });
  res.status(201).json({ message: msgOut(m.toObject(), me) });
});

/* ---------- Calls (signalling only) ---------- */

const callOut = (c, me) => ({
  id: String(c._id),
  kind: c.kind,
  status: c.status,
  outgoing: c.from === me,
  with: c.from === me ? c.to : c.from,
  offer: c.to === me ? c.offer : undefined,
  answer: c.from === me ? c.answer : undefined,
  createdAt: c.createdAt,
});
const validSdp = (d) => d && typeof d === "object" && typeof d.sdp === "string" && ["offer", "answer"].includes(d.type) && d.sdp.length < 60000;

// Ringing calls that nobody answered become "missed".
async function expireRinging() {
  await Call.updateMany({ status: "ringing", createdAt: { $lt: new Date(Date.now() - RING_MS) } }, { $set: { status: "missed" } });
}

router.post("/calls", async (req, res) => {
  const me = req.user.email;
  const b = req.body || {};
  const to = String(b.to || "").trim().toLowerCase();
  const kind = b.kind === "audio" ? "audio" : "video";
  if (!validSdp(b.offer) || b.offer.type !== "offer") return res.status(400).json({ message: "Missing call details." });
  if (!(await isFriend(me, to))) return res.status(403).json({ message: "You can only call friends." });
  // One outgoing call at a time.
  await Call.updateMany({ from: me, status: { $in: ["ringing", "accepted"] } }, { $set: { status: "ended", endedBy: me } });
  const busy = await Call.exists({ $or: [{ from: to }, { to }], status: "accepted", updatedAt: { $gt: new Date(Date.now() - 6 * 3600 * 1000) } });
  const c = await Call.create({ from: me, to, kind, offer: { type: "offer", sdp: b.offer.sdp } });
  res.status(201).json({ call: callOut(c.toObject(), me), busy: Boolean(busy) });
});

router.get("/calls/incoming", async (req, res) => {
  const me = req.user.email;
  await expireRinging();
  const list = await Call.find({ to: me, status: "ringing" }).sort({ createdAt: -1 }).limit(3).lean();
  const who = await people([...new Set(list.map((c) => c.from))]);
  res.json({ calls: list.map((c) => ({ ...callOut(c, me), caller: who[c.from] })) });
});

async function myCall(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Call not found." });
    return null;
  }
  const c = await Call.findById(req.params.id);
  const me = req.user.email;
  if (!c || (c.from !== me && c.to !== me)) {
    res.status(404).json({ message: "Call not found." });
    return null;
  }
  return c;
}

router.get("/calls/:id", async (req, res) => {
  await expireRinging();
  const c = await myCall(req, res);
  if (c) res.json({ call: callOut(c.toObject(), req.user.email) });
});

router.post("/calls/:id/answer", async (req, res) => {
  const c = await myCall(req, res);
  if (!c) return;
  if (c.to !== req.user.email) return res.status(403).json({ message: "Only the person being called can answer." });
  if (c.status !== "ringing") return res.status(409).json({ message: "This call has already ended." });
  const answer = (req.body || {}).answer;
  if (!validSdp(answer) || answer.type !== "answer") return res.status(400).json({ message: "Missing call details." });
  c.answer = { type: "answer", sdp: answer.sdp };
  c.status = "accepted";
  await c.save();
  res.json({ call: callOut(c.toObject(), req.user.email) });
});

router.post("/calls/:id/end", async (req, res) => {
  const c = await myCall(req, res);
  if (!c) return;
  if (["ended", "declined", "missed"].includes(c.status)) return res.json({ call: callOut(c.toObject(), req.user.email) });
  const want = (req.body || {}).status === "declined" && c.status === "ringing" && c.to === req.user.email ? "declined" : "ended";
  c.status = want;
  c.endedBy = req.user.email;
  await c.save();
  res.json({ call: callOut(c.toObject(), req.user.email) });
});

// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  console.error("Messaging route error:", error);
  if (!res.headersSent) res.status(500).json({ message: "Something went wrong. Please try again." });
});

module.exports = { messagingRouter: router, Message, Call };
