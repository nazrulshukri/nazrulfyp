// Social dashboard: profiles, friends and invites, posts, and trip plans with
// savings. Every route needs a signed-in user (session token).
//   GET  /social/me                     my profile (+ counts)
//   PUT  /social/me                     update my profile
//   GET  /social/people/:email          someone's profile (friends see more)
//   GET  /social/friends                friends, incoming and outgoing requests
//   POST /social/friends                { email } send a request, or an email invite
//   POST /social/friends/:email/accept  accept a request
//   DELETE /social/friends/:email       decline, cancel or unfriend
//   POST /social/invites                create a shareable invite link
//   GET  /social/invites/:token         who invited you (no sign-in needed)
//   POST /social/invites/:token/accept  become friends with the inviter
//   GET  /social/feed                   my posts and my friends' posts
//   POST /social/posts                  { text, image, thumb, videoId, poster } new post
//   GET  /social/gallery?email=         someone's photos and videos (me or a friend)
//   GET  /social/posts/:id              one post (me or a friend)
//   POST /social/posts/:id/view         count a view of someone else's post
//   POST /social/media                  upload a video (raw body, up to 4 MB)
//   GET  /social/media/:id?sig=         stream a video (signed link, no sign-in)
//   DELETE /social/posts/:id            delete my post
//   POST /social/posts/:id/like         like / unlike
//   GET|POST /social/trips, PUT|DELETE /social/trips/:id
//   POST /social/trips/:id/deposits     { amount, note } add savings
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { requireUser } = require("./authz");

const router = express.Router();

// Express 4 doesn't catch errors thrown by async handlers; without this an
// unexpected database error would crash the whole server.
for (const method of ["get", "post", "put", "delete"]) {
  const original = router[method].bind(router);
  router[method] = (path, ...handlers) =>
    original(path, ...handlers.map((h) => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}
const dbReady = () => mongoose.connection.readyState === 1;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE = 450 * 1024; // characters of a data URL, ~330 KB image
const MAX_THUMB = 120 * 1024; // grid thumbnails and video covers
// Vercel accepts request bodies up to 4.5 MB, so videos stay under 4 MB.
const MAX_VIDEO = 4 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const CABINS = ["Economy", "Premium Economy", "Business", "First"];

const RELATIONSHIPS = ["", "single", "in a relationship", "engaged", "married", "divorced", "widowed", "prefer not to say"];
const VISIBILITY = ["public", "friends", "private"];

const ProfileSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, maxlength: 80 },
    avatar: {
      kind: { type: String, enum: ["character", "photo"], default: "character" },
      character: { type: String, default: "traveller" },
      photo: String,
    },
    cover: { type: String, default: "forest" },
    profession: { type: String, trim: true, maxlength: 80 },
    age: { type: Number, min: 13, max: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    location: { type: String, trim: true, maxlength: 80 },
    bio: { type: String, trim: true, maxlength: 400 },
    mood: { emoji: String, text: { type: String, maxlength: 80 } },
    relationship: { type: String, enum: RELATIONSHIPS, default: "" },
    interests: [{ type: String, maxlength: 30 }],
    experience: [{ title: String, company: String, from: String, to: String }],
    education: [{ school: String, course: String, year: String }],
    certificates: [{ name: String, issuer: String, year: String }],
    visibility: {
      phone: { type: String, enum: VISIBILITY, default: "friends" },
      age: { type: String, enum: VISIBILITY, default: "friends" },
      relationship: { type: String, enum: VISIBILITY, default: "friends" },
    },
    // Booking details. Only the owner ever sees these.
    travel: {
      legalName: { type: String, trim: true, maxlength: 100 },
      nationality: { type: String, trim: true, maxlength: 60 },
      passport: { type: String, trim: true, maxlength: 20 },
      preferredAirport: { type: String, trim: true, maxlength: 100 },
      cabin: { type: String, enum: CABINS, default: "Economy" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);
const FriendSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true, index: true },
    to: { type: String, required: true, lowercase: true, index: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true },
);
FriendSchema.index({ from: 1, to: 1 }, { unique: true });
const InviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    from: { type: String, required: true, lowercase: true },
    toEmail: { type: String, lowercase: true },
    acceptedBy: [String],
  },
  { timestamps: true },
);
const PostSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, lowercase: true, index: true },
    text: { type: String, maxlength: 500 },
    image: String,
    thumb: String, // small square-ish preview for the photo grid
    video: { id: String, mime: String }, // file in the "media" GridFS bucket
    poster: String, // first frame of the video
    views: { type: Number, default: 0 },
    likes: [String],
  },
  { timestamps: true },
);
const TripSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, lowercase: true, index: true },
    destination: { type: String, required: true, trim: true, maxlength: 80 },
    targetDate: Date,
    budgetMyr: { type: Number, min: 0, max: 10_000_000, default: 0 },
    note: { type: String, maxlength: 300 },
    friends: [String],
    deposits: [{ amount: Number, note: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);

const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);
const Profile = model("Profile", ProfileSchema);
const Friend = model("Friend", FriendSchema);
const Invite = model("Invite", InviteSchema);
const Post = model("Post", PostSchema);
const Trip = model("Trip", TripSchema);

router.use(requireUser);
router.use((req, res, next) => (dbReady() ? next() : res.status(503).json({ message: "The database isn't connected." })));

const clip = (v, n) => (v == null ? undefined : String(v).trim().slice(0, n));
const isImage = (v, max = MAX_IMAGE) => typeof v === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(v) && v.length <= max;

/* Videos live in a GridFS bucket. A <video> tag can't send the session
   token, so each video link carries a signature instead and is only handed
   to people allowed to see the post. */
const { GridFSBucket, ObjectId } = mongoose.mongo;
const bucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: "media" });
const mediaSecret = () => (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) || "your_jwt_secret";
const signMedia = (id) => crypto.createHmac("sha256", mediaSecret()).update(`media:${id}`).digest("base64url").slice(0, 32);
const videoUrl = (v) => (v && v.id ? `/social/media/${v.id}?sig=${signMedia(v.id)}` : undefined);
const sameSig = (a, b) => typeof a === "string" && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const removeVideo = (v) =>
  v && v.id && mongoose.isValidObjectId(v.id)
    ? bucket()
        .delete(new ObjectId(v.id))
        .catch(() => {})
    : Promise.resolve();
const listOf = (arr, keys, max = 10) =>
  (Array.isArray(arr) ? arr : [])
    .slice(0, max)
    .map((row) => Object.fromEntries(keys.map((k) => [k, clip(row && row[k], 80) || ""])))
    .filter((row) => Object.values(row).some(Boolean));

async function myProfile(email) {
  const existing = await Profile.findOne({ email }).lean();
  if (existing) return existing;
  const User = mongoose.models.User;
  const user = User ? await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).lean() : null;
  // The dashboard makes several requests at once, so two may try to create
  // the profile together: an upsert makes that safe.
  try {
    return await Profile.findOneAndUpdate(
      { email },
      { $setOnInsert: { email, name: (user && user.name) || email.split("@")[0] } },
      { upsert: true, new: true },
    ).lean();
  } catch (error) {
    if (error && error.code === 11000) return Profile.findOne({ email }).lean();
    throw error;
  }
}

async function friendEmails(email) {
  const rows = await Friend.find({ status: "accepted", $or: [{ from: email }, { to: email }] }).lean();
  return rows.map((r) => (r.from === email ? r.to : r.from));
}
async function areFriends(a, b) {
  return Boolean(await Friend.exists({ status: "accepted", $or: [{ from: a, to: b }, { from: b, to: a }] }));
}

// What a viewer may see of a profile.
function publicView(p, { self, friend }) {
  const can = (field) => self || p.visibility?.[field] === "public" || (friend && p.visibility?.[field] === "friends");
  const out = {
    email: self || friend ? p.email : undefined,
    name: p.name,
    avatar: p.avatar,
    cover: p.cover,
    profession: p.profession,
    location: p.location,
    bio: p.bio,
    mood: p.mood,
    interests: p.interests,
    experience: p.experience,
    education: p.education,
    certificates: p.certificates,
  };
  if (can("phone")) out.phone = p.phone;
  if (can("age")) out.age = p.age;
  if (can("relationship")) out.relationship = p.relationship;
  if (self) {
    out.visibility = p.visibility;
    out.travel = p.travel || {};
  }
  return out;
}

const cards = async (emails) => {
  const profiles = await Profile.find({ email: { $in: emails } }).lean();
  const by = Object.fromEntries(profiles.map((p) => [p.email, p]));
  return emails.map((email) => ({
    email,
    name: (by[email] && by[email].name) || email.split("@")[0],
    avatar: (by[email] && by[email].avatar) || { kind: "character", character: "traveller" },
    profession: by[email] && by[email].profession,
    mood: by[email] && by[email].mood,
  }));
};

/* ---------- Profile ---------- */

router.get("/me", async (req, res) => {
  const me = req.user.email;
  const [p, friends, incoming, posts, trips] = await Promise.all([
    myProfile(me),
    friendEmails(me),
    Friend.countDocuments({ to: me, status: "pending" }),
    Post.countDocuments({ author: me }),
    Trip.countDocuments({ owner: me }),
  ]);
  res.json({ profile: publicView(p, { self: true }), counts: { friends: friends.length, incoming, posts, trips } });
});

router.put("/me", async (req, res) => {
  const b = req.body || {};
  const update = {};
  for (const [k, n] of [["name", 80], ["profession", 80], ["phone", 30], ["location", 80], ["bio", 400], ["cover", 20]]) {
    if (k in b) update[k] = clip(b[k], n);
  }
  if ("age" in b) {
    const age = Number(b.age);
    update.age = b.age === "" || b.age == null ? undefined : Number.isInteger(age) && age >= 13 && age <= 120 ? age : null;
    if (update.age === null) return res.status(400).json({ message: "Age must be a whole number from 13 to 120." });
  }
  if ("relationship" in b) {
    if (!RELATIONSHIPS.includes(b.relationship)) return res.status(400).json({ message: "Unknown relationship status." });
    update.relationship = b.relationship;
  }
  if ("mood" in b) update.mood = { emoji: clip(b.mood && b.mood.emoji, 8), text: clip(b.mood && b.mood.text, 80) };
  if ("interests" in b) update.interests = [...new Set((b.interests || []).map((i) => clip(i, 30)).filter(Boolean))].slice(0, 20);
  if ("experience" in b) update.experience = listOf(b.experience, ["title", "company", "from", "to"]);
  if ("education" in b) update.education = listOf(b.education, ["school", "course", "year"]);
  if ("certificates" in b) update.certificates = listOf(b.certificates, ["name", "issuer", "year"]);
  if ("visibility" in b) {
    update.visibility = {};
    for (const f of ["phone", "age", "relationship"]) {
      update.visibility[f] = VISIBILITY.includes(b.visibility && b.visibility[f]) ? b.visibility[f] : "friends";
    }
  }
  if ("travel" in b) {
    const t = b.travel || {};
    update.travel = {
      legalName: clip(t.legalName, 100),
      nationality: clip(t.nationality, 60),
      passport: clip(t.passport, 20) && clip(t.passport, 20).toUpperCase().replace(/[^A-Z0-9]/g, ""),
      preferredAirport: clip(t.preferredAirport, 100),
      cabin: CABINS.includes(t.cabin) ? t.cabin : "Economy",
      notifications: t.notifications !== false,
    };
  }
  if ("avatar" in b) {
    const a = b.avatar || {};
    if (a.kind === "photo") {
      if (!isImage(a.photo)) return res.status(400).json({ message: "Use a JPG, PNG or WebP photo under about 300 KB." });
      update.avatar = { kind: "photo", photo: a.photo, character: clip(a.character, 30) || "traveller" };
    } else {
      update.avatar = { kind: "character", character: clip(a.character, 30) || "traveller" };
    }
  }
  await myProfile(req.user.email);
  const p = await Profile.findOneAndUpdate({ email: req.user.email }, { $set: update }, { new: true, runValidators: true }).lean();
  res.json({ profile: publicView(p, { self: true }) });
});

router.get("/people/:email", async (req, res) => {
  const email = String(req.params.email).toLowerCase();
  const p = await Profile.findOne({ email }).lean();
  if (!p) return res.status(404).json({ message: "No profile found." });
  const self = email === req.user.email;
  const friend = !self && (await areFriends(req.user.email, email));
  res.json({ profile: publicView(p, { self, friend }), friend });
});

/* ---------- Friends and invites ---------- */

router.get("/friends", async (req, res) => {
  const me = req.user.email;
  const [friends, incoming, outgoing] = await Promise.all([
    friendEmails(me),
    Friend.find({ to: me, status: "pending" }).lean(),
    Friend.find({ from: me, status: "pending" }).lean(),
  ]);
  res.json({
    friends: await cards(friends),
    incoming: await cards(incoming.map((r) => r.from)),
    outgoing: await cards(outgoing.map((r) => r.to)),
  });
});

const appUrl = (req) =>
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : `${req.protocol}://${req.get("host")}`.replace(":5001", ":3000"));

router.post("/friends", async (req, res) => {
  const me = req.user.email;
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (email === me) return res.status(400).json({ message: "That's your own email." });
  if (await areFriends(me, email)) return res.status(409).json({ message: "You're already friends." });

  const User = mongoose.models.User;
  const exists = User && (await User.exists({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }));
  if (exists) {
    // If they already asked me, this accepts their request.
    const theirs = await Friend.findOne({ from: email, to: me });
    if (theirs) {
      theirs.status = "accepted";
      await theirs.save();
      return res.json({ status: "accepted" });
    }
    await Friend.updateOne({ from: me, to: email }, { $setOnInsert: { from: me, to: email, status: "pending" } }, { upsert: true });
    return res.status(201).json({ status: "requested" });
  }

  // Not on BookingFlex yet: email them an invite link.
  const token = crypto.randomBytes(16).toString("hex");
  await Invite.create({ token, from: me, toEmail: email });
  const link = `${appUrl(req)}/invite/${token}`;
  const profile = await myProfile(me);
  const sendMail = req.app.locals.sendMail;
  let emailed = false;
  if (sendMail) {
    try {
      await sendMail({
        to: email,
        subject: `${profile.name || "A friend"} invited you to BookingFlex`,
        text: `${profile.name || "Your friend"} wants to plan trips with you on BookingFlex.\n\nJoin here: ${link}`,
        html: `<p><strong>${(profile.name || "Your friend").replace(/</g, "&lt;")}</strong> wants to plan trips with you on BookingFlex.</p><p><a href="${link}">Accept the invite</a></p>`,
      });
      emailed = true;
    } catch (error) {
      console.error("Invite email failed:", error.message);
    }
  }
  res.status(201).json({ status: "invited", emailed, link });
});

router.post("/friends/:email/accept", async (req, res) => {
  const r = await Friend.findOne({ from: String(req.params.email).toLowerCase(), to: req.user.email, status: "pending" });
  if (!r) return res.status(404).json({ message: "No request from that person." });
  r.status = "accepted";
  await r.save();
  res.json({ status: "accepted" });
});

router.delete("/friends/:email", async (req, res) => {
  const other = String(req.params.email).toLowerCase();
  const me = req.user.email;
  const { deletedCount } = await Friend.deleteMany({ $or: [{ from: me, to: other }, { from: other, to: me }] });
  res.json({ removed: deletedCount > 0 });
});

router.post("/invites", async (req, res) => {
  const token = crypto.randomBytes(16).toString("hex");
  await Invite.create({ token, from: req.user.email });
  res.status(201).json({ link: `${appUrl(req)}/invite/${token}` });
});

router.post("/invites/:token/accept", async (req, res) => {
  const inv = await Invite.findOne({ token: req.params.token });
  if (!inv) return res.status(404).json({ message: "This invite link isn't valid." });
  const me = req.user.email;
  if (inv.from === me) return res.status(400).json({ message: "That's your own invite link." });
  await Friend.updateOne(
    { from: inv.from, to: me },
    { $set: { status: "accepted" }, $setOnInsert: { from: inv.from, to: me } },
    { upsert: true },
  );
  await Friend.deleteOne({ from: me, to: inv.from, status: "pending" });
  await Invite.updateOne({ _id: inv._id }, { $addToSet: { acceptedBy: me } });
  const [card] = await cards([inv.from]);
  res.json({ status: "accepted", friend: card });
});

/* ---------- Posts ---------- */

const postOut = (p, me, people) => ({
  id: String(p._id),
  author: people[p.author] || { email: p.author, name: p.author.split("@")[0] },
  text: p.text,
  image: p.image,
  video: videoUrl(p.video),
  poster: p.poster,
  views: p.views || 0,
  likes: (p.likes || []).length,
  liked: (p.likes || []).includes(me),
  mine: p.author === me,
  createdAt: p.createdAt,
});

router.get("/feed", async (req, res) => {
  const me = req.user.email;
  const authors = [me, ...(await friendEmails(me))];
  const posts = await Post.find({ author: { $in: authors } }).sort({ createdAt: -1 }).limit(30).lean();
  const people = Object.fromEntries((await cards([...new Set(posts.map((p) => p.author))])).map((c) => [c.email, c]));
  res.json({ posts: posts.map((p) => postOut(p, me, people)) });
});

router.post("/posts", async (req, res) => {
  const b = req.body || {};
  const text = clip(b.text, 500) || "";
  const { image, thumb, poster } = b;
  let video;
  if (b.videoId) {
    if (!mongoose.isValidObjectId(b.videoId)) return res.status(400).json({ message: "That video upload wasn't found." });
    const file = await mongoose.connection.db.collection("media.files").findOne({ _id: new ObjectId(b.videoId) });
    if (!file || (file.metadata && file.metadata.owner) !== req.user.email) return res.status(400).json({ message: "That video upload wasn't found." });
    video = { id: String(file._id), mime: file.metadata.contentType };
  }
  if (!text && !image && !video) return res.status(400).json({ message: "Write something or add a photo or video." });
  if (image && !isImage(image)) return res.status(400).json({ message: "Use a JPG, PNG or WebP photo under about 300 KB." });
  if (thumb && !isImage(thumb, MAX_THUMB)) return res.status(400).json({ message: "The preview image is too large." });
  if (poster && !isImage(poster, MAX_THUMB)) return res.status(400).json({ message: "The video cover is too large." });
  const p = await Post.create({
    author: req.user.email,
    text,
    image: video ? undefined : image || undefined,
    thumb: thumb || undefined,
    video,
    poster: video ? poster || undefined : undefined,
  });
  const people = Object.fromEntries((await cards([req.user.email])).map((c) => [c.email, c]));
  res.status(201).json({ post: postOut(p.toObject(), req.user.email, people) });
});

// Posts are visible to their author and the author's friends.
async function readablePost(id, me) {
  if (!mongoose.isValidObjectId(id)) return null;
  const p = await Post.findById(id).lean();
  if (!p || (p.author !== me && !(await areFriends(me, p.author)))) return null;
  return p;
}

router.get("/posts/:id", async (req, res) => {
  const p = await readablePost(req.params.id, req.user.email);
  if (!p) return res.status(404).json({ message: "Post not found." });
  const people = Object.fromEntries((await cards([p.author])).map((c) => [c.email, c]));
  res.json({ post: postOut(p, req.user.email, people) });
});

router.post("/posts/:id/view", async (req, res) => {
  const p = await readablePost(req.params.id, req.user.email);
  if (!p) return res.status(404).json({ message: "Post not found." });
  if (p.author === req.user.email) return res.json({ views: p.views || 0 });
  const r = await Post.findByIdAndUpdate(p._id, { $inc: { views: 1 } }, { new: true }).select("views").lean();
  res.json({ views: r.views });
});

// Photo and video grid for a profile: my own, or a friend's.
router.get("/gallery", async (req, res) => {
  const me = req.user.email;
  const email = req.query.email ? String(req.query.email).toLowerCase() : me;
  if (email !== me && !(await areFriends(me, email))) return res.status(403).json({ message: "Only friends can see these photos." });
  const posts = await Post.find({ author: email, $or: [{ image: { $exists: true, $ne: null } }, { "video.id": { $exists: true } }] })
    .sort({ createdAt: -1 })
    .limit(150)
    .select("thumb poster video views likes createdAt text image")
    .lean();
  res.json({
    items: posts.map((p) => ({
      id: String(p._id),
      kind: p.video && p.video.id ? "video" : "photo",
      // Older posts have no thumbnail, so their full photo stands in.
      thumb: p.thumb || p.poster || p.image,
      views: p.views || 0,
      likes: (p.likes || []).length,
      text: p.text ? p.text.slice(0, 120) : "",
      createdAt: p.createdAt,
    })),
  });
});

router.post("/media", express.raw({ type: VIDEO_TYPES, limit: MAX_VIDEO }), async (req, res) => {
  const type = String(req.headers["content-type"] || "").split(";")[0].trim();
  if (!VIDEO_TYPES.includes(type) || !Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ message: "Upload an MP4, WebM or MOV video." });
  }
  const id = new ObjectId();
  await new Promise((resolve, reject) => {
    const up = bucket().openUploadStreamWithId(id, `video-${id}`, { metadata: { owner: req.user.email, contentType: type } });
    up.once("finish", resolve).once("error", reject);
    up.end(req.body);
  });
  res.status(201).json({ id: String(id) });
});

router.delete("/posts/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const p = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.email }).lean();
  if (!p) return res.status(404).json({ message: "Post not found." });
  await removeVideo(p.video);
  res.json({ removed: true });
});

router.post("/posts/:id/like", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Post not found." });
  const me = req.user.email;
  const p = await Post.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Post not found." });
  if (p.author !== me && !(await areFriends(me, p.author))) return res.status(403).json({ message: "Only friends can like this post." });
  const liked = p.likes.includes(me);
  p.likes = liked ? p.likes.filter((e) => e !== me) : [...p.likes, me];
  await p.save();
  res.json({ liked: !liked, likes: p.likes.length });
});

/* ---------- Trip plans and savings ---------- */

const tripOut = (t) => {
  const saved = (t.deposits || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
  return {
    id: String(t._id),
    destination: t.destination,
    targetDate: t.targetDate,
    budgetMyr: t.budgetMyr,
    note: t.note,
    savedMyr: Math.round(saved * 100) / 100,
    deposits: (t.deposits || []).map((d) => ({ id: String(d._id), amount: d.amount, note: d.note, at: d.at })).reverse(),
    createdAt: t.createdAt,
  };
};
const tripInput = (b) => {
  const out = {};
  if ("destination" in b) out.destination = clip(b.destination, 80);
  if ("note" in b) out.note = clip(b.note, 300);
  if ("budgetMyr" in b) out.budgetMyr = Math.max(0, Math.min(10_000_000, Number(b.budgetMyr) || 0));
  if ("targetDate" in b) out.targetDate = b.targetDate && !Number.isNaN(new Date(b.targetDate).getTime()) ? new Date(b.targetDate) : undefined;
  return out;
};

router.get("/trips", async (req, res) => {
  const trips = await Trip.find({ owner: req.user.email }).sort({ targetDate: 1, createdAt: -1 }).lean();
  res.json({ trips: trips.map(tripOut) });
});

router.post("/trips", async (req, res) => {
  const data = tripInput(req.body || {});
  if (!data.destination) return res.status(400).json({ message: "Where do you want to go?" });
  if ((await Trip.countDocuments({ owner: req.user.email })) >= 30) return res.status(400).json({ message: "You can plan up to 30 trips." });
  const t = await Trip.create({ ...data, owner: req.user.email });
  res.status(201).json({ trip: tripOut(t.toObject()) });
});

router.put("/trips/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Trip not found." });
  const t = await Trip.findOneAndUpdate({ _id: req.params.id, owner: req.user.email }, { $set: tripInput(req.body || {}) }, { new: true }).lean();
  if (!t) return res.status(404).json({ message: "Trip not found." });
  res.json({ trip: tripOut(t) });
});

router.delete("/trips/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Trip not found." });
  const { deletedCount } = await Trip.deleteOne({ _id: req.params.id, owner: req.user.email });
  res.json({ removed: deletedCount > 0 });
});

router.post("/trips/:id/deposits", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Trip not found." });
  const amount = Math.round(Number((req.body || {}).amount) * 100) / 100;
  // Negative amounts record a withdrawal from the savings.
  if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 1_000_000) {
    return res.status(400).json({ message: "Enter an amount, e.g. 200." });
  }
  const t = await Trip.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.email },
    { $push: { deposits: { amount, note: clip((req.body || {}).note, 80) } } },
    { new: true },
  ).lean();
  if (!t) return res.status(404).json({ message: "Trip not found." });
  res.json({ trip: tripOut(t) });
});

// Any error in a /social route: log it and answer with a message.
// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
  if (error && error.type === "entity.too.large") {
    return res.status(413).json({ message: "That file is too large. Videos can be up to 4 MB." });
  }
  console.error("Social route error:", error);
  if (!res.headersSent) res.status(500).json({ message: "Something went wrong. Please try again." });
});

// Invite details can be read before signing in, so this router is mounted
// separately without requireUser.
const publicRouter = express.Router();
publicRouter.get("/invites/:token", async (req, res, next) => {
  try {
  if (!dbReady()) return res.status(503).json({ message: "The database isn't connected." });
  const inv = await Invite.findOne({ token: req.params.token }).lean();
  if (!inv) return res.status(404).json({ message: "This invite link isn't valid." });
  const p = await Profile.findOne({ email: inv.from }).lean();
  res.json({
    from: {
      name: (p && p.name) || inv.from.split("@")[0],
      avatar: (p && p.avatar && p.avatar.kind === "character" ? p.avatar : { kind: "character", character: "traveller" }),
      profession: p && p.profession,
    },
  });
  } catch (error) {
    next(error);
  }
});

// Streams a video with byte ranges (Safari and iPhone need them to play).
publicRouter.get("/media/:id", async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).end();
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id) || !sameSig(req.query.sig, signMedia(id))) return res.status(404).end();
    const file = await mongoose.connection.db.collection("media.files").findOne({ _id: new ObjectId(id) });
    if (!file) return res.status(404).end();
    const size = file.length;
    let start = 0;
    let end = size - 1;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    res.set({
      "Accept-Ranges": "bytes",
      "Content-Type": (file.metadata && file.metadata.contentType) || "video/mp4",
      "Cache-Control": "private, max-age=86400",
    });
    if (range && (range[1] || range[2])) {
      if (range[1] === "") start = Math.max(0, size - Number(range[2]));
      else {
        start = Number(range[1]);
        if (range[2]) end = Math.min(Number(range[2]), size - 1);
      }
      if (start > end || start >= size) {
        res.status(416).set("Content-Range", `bytes */${size}`);
        return res.end();
      }
      res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    res.set("Content-Length", String(end - start + 1));
    if (req.method === "HEAD") return res.end();
    bucket()
      .openDownloadStream(file._id, { start, end: end + 1 })
      .on("error", next)
      .pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = { socialRouter: router, socialPublicRouter: publicRouter, Profile, Friend, Post, Trip, Invite };
