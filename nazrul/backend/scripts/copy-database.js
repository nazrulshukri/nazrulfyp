#!/usr/bin/env node
// Copies every collection (documents and indexes) from your local MongoDB
// to another MongoDB, e.g. a free MongoDB Atlas cluster for the live site.
//
//   node backend/scripts/copy-database.js "mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/nazrulfyp"
//   node backend/scripts/copy-database.js          (uses ATLAS_URI from backend/.env)
//
// The target database is the name in the URI, or "nazrulfyp" when the URI
// has none (Atlas addresses often end in "/", which would mean "test").
// Use --db NAME to choose another.
//
// The source is MONGODB_URI from backend/.env (your local database).
// Collections that already have documents in the target are skipped, so it
// is safe to run twice. Add --replace to overwrite them instead, or --merge
// to add only the records that are missing (nothing in the target is changed
// or deleted; accounts whose email already exists there are kept as they are).
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { MongoClient } = require("mongodb");

const args = process.argv.slice(2);
const dbFlag = args.indexOf("--db");
const dbOverride = dbFlag >= 0 ? args[dbFlag + 1] : null;
const target = args.find((a, i) => /^mongodb(\+srv)?:\/\//.test(a) && (dbFlag < 0 || i !== dbFlag + 1)) || process.env.ATLAS_URI;
const replace = args.includes("--replace");
const merge = args.includes("--merge");
// --only a,b,c   copy just these collections
// --skip-test    leave out records for test emails (…@example.com)
const onlyFlag = args.indexOf("--only");
const only = onlyFlag >= 0 ? new Set(String(args[onlyFlag + 1] || "").split(",").map((x) => x.trim()).filter(Boolean)) : null;
const skipTest = args.includes("--skip-test");
const TEST_EMAIL = /@example\.(com|org|net)$/i;
const isTestDoc = (d) =>
  skipTest && ["email", "owner", "author", "from", "to", "addedBy"].some((k) => typeof d[k] === "string" && TEST_EMAIL.test(d[k]));
if (replace && merge) {
  console.error("Use either --replace or --merge, not both.");
  process.exit(1);
}
const source = process.env.MONGODB_URI || process.env.MONGO_URI;
const hide = (uri) => String(uri).replace(/\/\/[^@/]*@/, "//***@");

if (!target || !/^mongodb(\+srv)?:\/\//.test(target)) {
  console.error('Usage: node backend/scripts/copy-database.js "mongodb+srv://USER:PASS@HOST/DBNAME" [--db NAME] [--replace]');
  console.error("   or: add ATLAS_URI=... to backend/.env and run it with no address.");
  process.exit(1);
}
if (!source) {
  console.error("MONGODB_URI is missing from backend/.env, so there is nothing to copy from.");
  process.exit(1);
}
if (source === target) {
  console.error("Source and target are the same database.");
  process.exit(1);
}

(async () => {
  const from = new MongoClient(source);
  const to = new MongoClient(target);
  await Promise.all([from.connect(), to.connect()]);
  const src = from.db();
  // Database named in the URI path, else "nazrulfyp" (never the "test" default).
  const named = (/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/.exec(target) || [])[1];
  const dst = to.db(dbOverride || named || "nazrulfyp");
  const sameHost = (u) => (/^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?]+)/.exec(u) || [])[1];
  if (sameHost(source) === sameHost(target) && src.databaseName === dst.databaseName) {
    console.error("Source and target are the same database; nothing copied.");
    await Promise.all([from.close(), to.close()]);
    process.exit(1);
  }
  console.log(`Copying ${hide(source)}  →  ${hide(target)} (database "${dst.databaseName}")\n`);

  const collections = (await src.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));
  let copied = 0;
  for (const name of collections) {
    if (only && !only.has(name)) continue;
    const existing = await dst.collection(name).countDocuments();
    if (existing && merge) {
      // Add only what's missing: same _id, or (for accounts-like collections)
      // the same email, counts as already there.
      const docs = (await src.collection(name).find({}).toArray()).filter((d) => !isTestDoc(d));
      const ids = new Set((await dst.collection(name).find({ _id: { $in: docs.map((d) => d._id) } }).project({ _id: 1 }).toArray()).map((d) => String(d._id)));
      const hasEmail = docs.some((d) => typeof d.email === "string") && ["users", "admins", "profiles"].includes(name);
      const emails = hasEmail
        ? new Set((await dst.collection(name).find({ email: { $in: docs.map((d) => d.email).filter(Boolean) } }).project({ email: 1 }).toArray()).map((d) => String(d.email).toLowerCase()))
        : new Set();
      const missing = docs.filter((d) => !ids.has(String(d._id)) && !(hasEmail && emails.has(String(d.email || "").toLowerCase())));
      if (missing.length) await dst.collection(name).insertMany(missing, { ordered: false });
      copied += missing.length;
      console.log(`  merge ${name.padEnd(18)} added ${missing.length}, kept ${existing} existing (${docs.length - missing.length} already there)`);
      continue;
    }
    if (existing && !replace) {
      console.log(`  skip  ${name.padEnd(18)} already has ${existing} documents (use --replace to overwrite)`);
      continue;
    }
    if (existing) await dst.collection(name).deleteMany({});
    const docs = (await src.collection(name).find({}).toArray()).filter((d) => !isTestDoc(d));
    if (docs.length) await dst.collection(name).insertMany(docs, { ordered: false });
    const indexes = (await src.collection(name).indexes()).filter((ix) => ix.name !== "_id_");
    for (const ix of indexes) {
      const { key, name: ixName, v, ns, ...options } = ix;
      try {
        await dst.collection(name).createIndex(key, { name: ixName, ...options });
      } catch (error) {
        console.log(`        index ${ixName} not copied: ${error.message}`);
      }
    }
    copied += docs.length;
    console.log(`  copy  ${name.padEnd(18)} ${docs.length} documents, ${indexes.length} indexes`);
  }
  console.log(`\nDone: ${copied} documents copied. Put the target URI in Vercel as MONGODB_URI and redeploy.`);
  await Promise.all([from.close(), to.close()]);
})().catch((error) => {
  console.error("Copy failed:", error.message);
  process.exit(1);
});
