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
//   Group rooms (up to 10 friends, like a Discord server channel):
//   GET  /messages/rooms                     my rooms with last message + unread
//   POST /messages/rooms {name, icon, members}   create (members must be my friends)
//   GET  /messages/rooms/:id                 room, members, messages (?after=ISO)
//   PUT  /messages/rooms/:id {name, icon, add, remove}  owner edits; anyone can remove themself
//   POST /messages/rooms/:id/messages        send to the room
//   POST /messages/rooms/:id/meeting         join the room's video meeting (LiveKit token)
//   POST /messages/rooms/:id/meeting/end     owner or starter ends the meeting
//   Attachments (the + menu):
//   POST /messages/uploads                   raw photo/video/file up to 4 MB, returns {id}
//   GET  /messages/media/:id?sig=            the file (signed link, no sign-in)
//   POST /messages/msg/:id/vote {option}     vote in a poll
// Messages have a kind: text, image, video, file, poll, event, contact,
// ticket (a booking) or savings (a trip plan), with details in payload.
// 1-to-1 calls are browser-to-browser (WebRTC); the server only passes the
// connection descriptions. Group meetings run on LiveKit (LIVEKIT_URL,
// LIVEKIT_API_KEY, LIVEKIT_API_SECRET).
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { requireUser } = require("./authz");
const { MAX_UPLOAD, saveBuffer, findFile, sendFile } = require("./mediaStore");

const router = express.Router();
const publicRouter = express.Router();
for (const method of ["get", "post", "put", "delete"]) {
  const original = router[method].bind(router);
  router[method] = (path, ...handlers) =>
    original(path, ...handlers.map((h) => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true },
    to: { type: String, lowercase: true }, // 1-to-1 chats
    room: { type: String, index: true }, // group rooms
    kind: { type: String, enum: ["text", "image", "video", "file", "poll", "event", "contact", "ticket", "savings"], default: "text" },
    text: { type: String, maxlength: 2000 },
    payload: { type: Object },
    readAt: Date,
  },
  { timestamps: true, minimize: false },
);
MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
MessageSchema.index({ room: 1, createdAt: -1 });

const MAX_MEMBERS = 10;
const readOf = (r, email) => ((r.reads || []).find((x) => x.email === email) || {}).at || new Date(0);
const markRead = (r, email, at = new Date()) => {
  r.reads = [...(r.reads || []).filter((x) => x.email !== email), { email, at }];
};
const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    icon: { type: String, maxlength: 8, default: "✈️" },
    owner: { type: String, required: true, lowercase: true },
    members: [{ type: String, lowercase: true }],
    reads: [{ _id: false, email: String, at: Date }], // last time each member opened the room
    lastAt: { type: Date, default: Date.now },
    meeting: { startedBy: String, startedAt: Date, endedAt: Date },
  },
  { timestamps: true },
);
RoomSchema.index({ members: 1, lastAt: -1 });
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
const Room = model("Room", RoomSchema);
const Friend = () => mongoose.models.Friend;
const Profile = () => mongoose.models.Profile;

const RING_MS = 45 * 1000;
const dbReady = () => mongoose.connection.readyState === 1;

/* ---------- Files sent in chats (signed links, so <img> and <video> work) ---------- */

const CHAT_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/wav", "audio/ogg", "audio/webm",
  "application/pdf", "text/plain", "text/csv", "application/zip",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const secret = () => (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) || "your_jwt_secret";
const sign = (id) => crypto.createHmac("sha256", secret()).update(`chat:${id}`).digest("base64url").slice(0, 32);
const fileUrl = (id) => (id ? `/messages/media/${id}?sig=${sign(id)}` : undefined);
const sameSig = (a, b) => typeof a === "string" && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

publicRouter.get("/media/:id", async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).end();
    if (!sameSig(req.query.sig, sign(req.params.id))) return res.status(404).end();
    const file = await findFile(req.params.id);
    if (!file || !file.metadata || file.metadata.scope !== "chat") return res.status(404).end();
    const type = file.metadata.contentType || "";
    // Documents download instead of opening inside the site.
    if (!/^(image|video|audio)\//.test(type)) {
      const name = String(file.metadata.name || "file").replace(/[^\w.\- ]+/g, "_");
      res.set("Content-Disposition", `attachment; filename="${name}"`);
    }
    return sendFile(file, req, res, next);
  } catch (error) {
    return next(error);
  }
});

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
        country: by[e] && by[e].country,
      },
    ]),
  );
}
const friendParam = (req) => String(req.params.email || "").trim().toLowerCase();
function payloadOut(m, me) {
  const p = m.payload || {};
  if (["image", "video", "file"].includes(m.kind)) return { ...p, url: fileUrl(p.fileId), poster: fileUrl(p.posterId) };
  if (m.kind === "poll") {
    const options = (p.options || []).map((o) => ({ text: o.text, votes: (o.votes || []).length, mine: (o.votes || []).includes(me) }));
    return { question: p.question, multi: Boolean(p.multi), options, voters: new Set((p.options || []).flatMap((o) => o.votes || [])).size };
  }
  return p;
}
const msgOut = (m, me, who) => ({
  id: String(m._id),
  mine: m.from === me,
  from: who ? who[m.from] || { email: m.from, name: m.from.split("@")[0] } : undefined,
  kind: m.kind || "text",
  text: m.text || "",
  payload: m.kind && m.kind !== "text" ? payloadOut(m, me) : undefined,
  at: m.createdAt,
  read: Boolean(m.readAt),
});

const clip = (v, n) => (v == null ? "" : String(v).trim().slice(0, n));
const validDate = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : null);

/** Checks and builds a message from what the browser sent. Throws {status, message}. */
async function buildMessage(b, me) {
  const fail = (message) => Object.assign(new Error(message), { status: 400 });
  const kind = b.kind || "text";
  const text = clip(b.text, 2000);
  const p = b.payload || {};
  if (kind === "text") {
    if (!text) throw fail("Write a message first.");
    return { kind, text };
  }
  if (["image", "video", "file"].includes(kind)) {
    const file = await findFile(p.fileId);
    if (!file || !file.metadata || file.metadata.scope !== "chat" || file.metadata.owner !== me) throw fail("That upload wasn't found. Try again.");
    let posterId;
    if (p.posterId) {
      const poster = await findFile(p.posterId);
      if (poster && poster.metadata && poster.metadata.scope === "chat" && poster.metadata.owner === me) posterId = String(poster._id);
    }
    return { kind, text, payload: { fileId: String(file._id), posterId, name: file.metadata.name, size: file.length, mime: file.metadata.contentType } };
  }
  if (kind === "poll") {
    const question = clip(p.question, 200);
    const options = (Array.isArray(p.options) ? p.options : []).map((o) => clip(o, 80)).filter(Boolean).slice(0, 8);
    if (!question || options.length < 2) throw fail("A poll needs a question and at least 2 options.");
    return { kind, payload: { question, multi: Boolean(p.multi), options: options.map((t) => ({ text: t, votes: [] })) } };
  }
  if (kind === "event") {
    const title = clip(p.title, 120);
    const start = validDate(p.start);
    if (!title || !start) throw fail("An event needs a title and a start time.");
    const end = validDate(p.end);
    return { kind, text, payload: { title, start, end: end && end > start ? end : undefined, location: clip(p.location, 120), note: clip(p.note, 300), allDay: Boolean(p.allDay) } };
  }
  if (kind === "contact") {
    const email = clip(p.email, 200).toLowerCase();
    if (!(await isFriend(me, email))) throw fail("You can only share your friends' contacts.");
    const who = await people([email]);
    return { kind, payload: { email, name: who[email].name, avatar: who[email].avatar, country: who[email].country } };
  }
  if (kind === "ticket") {
    // A booking from My trips. Server orders are checked; bookings kept in the
    // browser (older flow) are shared as the traveller describes them.
    const Order = mongoose.models.Order;
    const ref = clip(p.reference, 60);
    const order = Order && ref ? await Order.findOne({ reference: ref, email: me }).lean() : null;
    const src = order || p;
    return {
      kind,
      text,
      payload: {
        reference: clip(src.reference, 60),
        type: ["flight", "hotel", "train"].includes(src.kind || src.type) ? src.kind || src.type : "flight",
        title: clip(src.title, 120),
        subtitle: clip(src.subtitle, 160),
        origin: clip(src.origin, 80),
        destination: clip(src.destination, 80),
        startAt: validDate(src.startAt) || undefined,
        endAt: validDate(src.endAt) || undefined,
        travellers: Number(src.travellers) || undefined,
        verified: Boolean(order),
      },
    };
  }
  if (kind === "savings") {
    const Trip = mongoose.models.Trip;
    const trip = Trip && mongoose.isValidObjectId(p.tripId) ? await Trip.findOne({ _id: p.tripId, owner: me }).lean() : null;
    if (!trip) throw fail("That trip plan wasn't found.");
    const saved = (trip.deposits || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    return { kind, text, payload: { destination: trip.destination, budgetMyr: trip.budgetMyr, savedMyr: Math.round(saved * 100) / 100, targetDate: trip.targetDate } };
  }
  throw fail("Unknown message type.");
}

router.post("/uploads", express.raw({ type: CHAT_TYPES, limit: MAX_UPLOAD }), async (req, res) => {
  const type = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (!CHAT_TYPES.includes(type) || !Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ message: "That file type can't be sent. Try a photo, video, PDF, Office document, text or ZIP file." });
  }
  const name = clip(decodeURIComponent(String(req.headers["x-file-name"] || "")), 120) || "file";
  const id = await saveBuffer(req.body, { scope: "chat", owner: req.user.email, contentType: type, name });
  res.status(201).json({ id, url: fileUrl(id) });
});

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
  const [n, rooms] = await Promise.all([Message.countDocuments({ to: me, readAt: null, from: { $in: friends } }), roomUnread(me)]);
  res.json({ unread: n + rooms.total, rooms: rooms.by });
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
  if (!(await isFriend(me, other))) return res.status(403).json({ message: "You can only chat with friends." });
  const m = await Message.create({ from: me, to: other, ...(await buildMessage(req.body || {}, me)) });
  res.status(201).json({ message: msgOut(m.toObject(), me) });
});

/* ---------- Polls ---------- */

router.post("/msg/:id/vote", async (req, res) => {
  const me = req.user.email;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Poll not found." });
  const m = await Message.findById(req.params.id);
  if (!m || m.kind !== "poll") return res.status(404).json({ message: "Poll not found." });
  const allowed = m.room ? await Room.exists({ _id: m.room, members: me }) : m.from === me || m.to === me;
  if (!allowed) return res.status(404).json({ message: "Poll not found." });
  const i = Number((req.body || {}).option);
  const options = (m.payload && m.payload.options) || [];
  if (!Number.isInteger(i) || i < 0 || i >= options.length) return res.status(400).json({ message: "Pick one of the options." });
  options.forEach((o) => {
    o.votes = o.votes || [];
  });
  const had = options[i].votes.includes(me);
  if (m.payload.multi) {
    // Multiple choice: tap an option to add or remove your vote.
    options[i].votes = had ? options[i].votes.filter((v) => v !== me) : [...options[i].votes, me];
  } else {
    // One choice: your vote moves to this option (tap again to remove it).
    options.forEach((o) => {
      o.votes = o.votes.filter((v) => v !== me);
    });
    if (!had) options[i].votes.push(me);
  }
  m.markModified("payload");
  await m.save();
  res.json({ message: msgOut(m.toObject(), me) });
});

/* ---------- Group rooms ---------- */

const roomOut = (r, me, who, extra = {}) => {
  const meeting = r.meeting && r.meeting.startedAt && !r.meeting.endedAt && Date.now() - new Date(r.meeting.startedAt) < 4 * 3600 * 1000 ? r.meeting : null;
  return {
    id: String(r._id),
    name: r.name,
    icon: r.icon,
    owner: r.owner,
    isOwner: r.owner === me,
    me,
    members: r.members.map((e) => (who && who[e]) || { email: e, name: e.split("@")[0] }),
    meeting: meeting ? { startedBy: meeting.startedBy, startedAt: meeting.startedAt } : null,
    lastAt: r.lastAt,
    ...extra,
  };
};

async function roomUnread(me) {
  const rooms = await Room.find({ members: me }).select("reads lastAt").lean();
  const counts = await Promise.all(
    rooms.map((r) => {
      const seen = readOf(r, me);
      return new Date(r.lastAt) > new Date(seen) ? Message.countDocuments({ room: String(r._id), from: { $ne: me }, createdAt: { $gt: seen } }) : 0;
    }),
  );
  const by = Object.fromEntries(rooms.map((r, i) => [String(r._id), counts[i]]));
  return { total: counts.reduce((a, b) => a + b, 0), by };
}

async function myRoom(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Room not found." });
    return null;
  }
  const r = await Room.findOne({ _id: req.params.id, members: req.user.email });
  if (!r) res.status(404).json({ message: "Room not found." });
  return r;
}

async function friendList(me, emails) {
  const wanted = [...new Set((Array.isArray(emails) ? emails : []).map((e) => clip(e, 200).toLowerCase()).filter((e) => e && e !== me))];
  const friends = new Set(await friendsOf(me));
  return wanted.filter((e) => friends.has(e));
}

router.get("/rooms", async (req, res) => {
  const me = req.user.email;
  const rooms = await Room.find({ members: me }).sort({ lastAt: -1 }).limit(50).lean();
  const ids = rooms.map((r) => String(r._id));
  const [lasts, unread] = await Promise.all([
    Message.aggregate([{ $match: { room: { $in: ids } } }, { $sort: { createdAt: -1 } }, { $group: { _id: "$room", last: { $first: "$$ROOT" } } }]),
    roomUnread(me),
  ]);
  const who = await people([...new Set(rooms.flatMap((r) => r.members).concat(lasts.map((l) => l.last.from)))]);
  const lastBy = Object.fromEntries(lasts.map((l) => [l._id, msgOut(l.last, me, who)]));
  res.json({ rooms: rooms.map((r) => roomOut(r, me, who, { last: lastBy[String(r._id)] || null, unread: unread.by[String(r._id)] || 0 })) });
});

router.post("/rooms", async (req, res) => {
  const me = req.user.email;
  const b = req.body || {};
  const name = clip(b.name, 60);
  if (!name) return res.status(400).json({ message: "Give the room a name." });
  const members = await friendList(me, b.members);
  if (members.length + 1 > MAX_MEMBERS) return res.status(400).json({ message: `A room can have up to ${MAX_MEMBERS} people, including you.` });
  const r = await Room.create({ name, icon: clip(b.icon, 8) || "✈️", owner: me, members: [me, ...members], reads: [{ email: me, at: new Date() }] });
  await Message.create({ from: me, room: String(r._id), kind: "text", text: `created "${name}"` });
  const who = await people(r.members);
  res.status(201).json({ room: roomOut(r.toObject(), me, who) });
});

router.get("/rooms/:id", async (req, res) => {
  const me = req.user.email;
  const r = await myRoom(req, res);
  if (!r) return;
  const filter = { room: String(r._id) };
  const after = validDate(req.query.after);
  if (after) filter.createdAt = { $gt: after };
  const list = await Message.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  markRead(r, me);
  await r.save();
  const who = await people([...new Set([...r.members, ...list.map((m) => m.from)])]);
  res.json({ room: roomOut(r.toObject(), me, who), messages: list.reverse().map((m) => msgOut(m, me, who)) });
});

router.put("/rooms/:id", async (req, res) => {
  const me = req.user.email;
  const r = await myRoom(req, res);
  if (!r) return;
  const b = req.body || {};
  const remove = (Array.isArray(b.remove) ? b.remove : []).map((e) => String(e).toLowerCase());
  const leaving = remove.length === 1 && remove[0] === me;
  if (r.owner !== me && !leaving) return res.status(403).json({ message: "Only the room's owner can change it." });
  const notes = [];
  if (r.owner === me) {
    if (b.name != null && clip(b.name, 60)) r.name = clip(b.name, 60);
    if (b.icon != null && clip(b.icon, 8)) r.icon = clip(b.icon, 8);
    const add = (await friendList(me, b.add)).filter((e) => !r.members.includes(e));
    if (r.members.length + add.length > MAX_MEMBERS) return res.status(400).json({ message: `A room can have up to ${MAX_MEMBERS} people.` });
    r.members.push(...add);
    if (add.length) notes.push(`added ${add.length} ${add.length === 1 ? "person" : "people"}`);
  }
  const removed = remove.filter((e) => r.members.includes(e) && (e !== r.owner || leaving));
  r.members = r.members.filter((e) => !removed.includes(e));
  if (leaving) notes.push("left the room");
  else if (removed.length) notes.push(`removed ${removed.length} ${removed.length === 1 ? "person" : "people"}`);
  if (!r.members.length) {
    await Promise.all([Room.deleteOne({ _id: r._id }), Message.deleteMany({ room: String(r._id) })]);
    return res.json({ removed: true });
  }
  if (r.owner === me && leaving) r.owner = r.members[0]; // hand the room over
  r.lastAt = new Date();
  await r.save();
  if (notes.length) await Message.create({ from: me, room: String(r._id), kind: "text", text: notes.join(", ") });
  const who = await people(r.members);
  res.json({ room: leaving ? null : roomOut(r.toObject(), me, who) });
});

router.post("/rooms/:id/messages", async (req, res) => {
  const me = req.user.email;
  const r = await myRoom(req, res);
  if (!r) return;
  const m = await Message.create({ from: me, room: String(r._id), ...(await buildMessage(req.body || {}, me)) });
  r.lastAt = m.createdAt;
  markRead(r, me, m.createdAt);
  await r.save();
  const who = await people([me]);
  res.status(201).json({ message: msgOut(m.toObject(), me, who) });
});

/* ---------- Group meetings (LiveKit) ---------- */

// Settings pasted with quotes or a "NAME=" prefix still work.
const setting = (name) =>
  String(process.env[name] || "")
    .trim()
    .replace(/^[A-Z_]+=/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
const livekit = () => {
  const url = setting("LIVEKIT_URL");
  const key = setting("LIVEKIT_API_KEY");
  const sec = setting("LIVEKIT_API_SECRET");
  return url && key && sec ? { url, key, sec } : null;
};

// Asks LiveKit whether it accepts a token before the browser tries, so a
// wrong key or secret shows a clear message. Returns null when it's fine
// (or LiveKit can't be reached, in which case the browser tries anyway).
async function livekitProblem(lk, token) {
  const host = lk.url.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/$/, "");
  try {
    const r = await fetch(`${host}/rtc/v1/validate?access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(5000) });
    if (r.ok || r.status === 404) return null;
    const reason = (await r.text()).trim().slice(0, 120);
    if (/invalid API key/i.test(reason)) {
      return "LiveKit doesn't recognise LIVEKIT_API_KEY. Check it in Vercel matches a key in your LiveKit project (Settings → API Keys), then redeploy.";
    }
    if (/invalid token/i.test(reason)) {
      return "LiveKit says LIVEKIT_API_SECRET doesn't match LIVEKIT_API_KEY. Create a new key in LiveKit, copy both the key and its secret into Vercel, then redeploy.";
    }
    return `LiveKit refused the meeting (${reason || r.status}).`;
  } catch (error) {
    console.error("LiveKit check failed:", error.message);
    return null;
  }
}

router.post("/rooms/:id/meeting", async (req, res) => {
  const me = req.user.email;
  const lk = livekit();
  if (!lk) {
    return res.status(501).json({ message: "Group meetings aren't switched on yet. Add LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET in Vercel.", configured: false });
  }
  const r = await myRoom(req, res);
  if (!r) return;
  const who = await people([me]);
  const now = Math.floor(Date.now() / 1000);
  // LiveKit access token: identity = email, only this room, 4 hours.
  const token = jwt.sign(
    {
      iss: lk.key,
      sub: me,
      jti: `${me}-${now}`,
      nbf: now - 10,
      exp: now + 4 * 3600,
      name: who[me].name,
      metadata: JSON.stringify({ avatar: who[me].avatar, country: who[me].country }),
      video: { room: `bookingflex-${r._id}`, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true },
    },
    lk.sec,
    { algorithm: "HS256" },
  );
  const problem = await livekitProblem(lk, token);
  if (problem) {
    console.error("LiveKit setup problem:", problem);
    return res.status(502).json({ message: problem });
  }
  const active = r.meeting && r.meeting.startedAt && !r.meeting.endedAt && Date.now() - new Date(r.meeting.startedAt) < 4 * 3600 * 1000;
  if (!active) {
    r.meeting = { startedBy: me, startedAt: new Date() };
    r.lastAt = new Date();
    await r.save();
    await Message.create({ from: me, room: String(r._id), kind: "text", text: "started a video meeting 🎥" });
  }
  res.json({ url: lk.url, token, room: roomOut(r.toObject(), me, who) });
});

// Closes the LiveKit room so everyone is disconnected (best effort).
async function closeLivekitRoom(name) {
  const lk = livekit();
  if (!lk) return;
  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ iss: lk.key, nbf: now - 10, exp: now + 60, video: { roomCreate: true } }, lk.sec, { algorithm: "HS256" });
  const host = lk.url.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/$/, "");
  try {
    const r = await fetch(`${host}/twirp/livekit.RoomService/DeleteRoom`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ room: name }),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok && r.status !== 404) console.error("LiveKit DeleteRoom returned", r.status);
  } catch (error) {
    console.error("LiveKit DeleteRoom failed:", error.message);
  }
}

router.post("/rooms/:id/meeting/end", async (req, res) => {
  const me = req.user.email;
  const r = await myRoom(req, res);
  if (!r) return;
  if (!r.meeting || !r.meeting.startedAt || r.meeting.endedAt) return res.json({ ended: true });
  if (r.owner !== me && r.meeting.startedBy !== me) return res.status(403).json({ message: "Only the owner or whoever started it can end the meeting." });
  r.meeting.endedAt = new Date();
  r.markModified("meeting");
  await r.save();
  await closeLivekitRoom(`bookingflex-${r._id}`);
  await Message.create({ from: me, room: String(r._id), kind: "text", text: "ended the meeting" });
  res.json({ ended: true });
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
  if (error && error.status === 400) return res.status(400).json({ message: error.message });
  if (error && error.type === "entity.too.large") return res.status(413).json({ message: "That file is too large. Files can be up to 4 MB." });
  console.error("Messaging route error:", error);
  if (!res.headersSent) res.status(500).json({ message: "Something went wrong. Please try again." });
});

module.exports = { messagingRouter: router, messagingPublicRouter: publicRouter, Message, Call, Room };
