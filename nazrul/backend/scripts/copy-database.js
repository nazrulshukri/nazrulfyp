#!/usr/bin/env node
// Copies every collection (documents and indexes) from your local MongoDB
// to another MongoDB, e.g. a free MongoDB Atlas cluster for the live site.
//
//   node backend/scripts/copy-database.js "mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/nazrulfyp"
//
// The source is MONGODB_URI from backend/.env (your local database).
// Collections that already have documents in the target are skipped, so it
// is safe to run twice. Add --replace to overwrite them instead.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { MongoClient } = require("mongodb");

const target = process.argv[2];
const replace = process.argv.includes("--replace");
const source = process.env.MONGODB_URI || process.env.MONGO_URI;
const hide = (uri) => String(uri).replace(/\/\/[^@/]*@/, "//***@");

if (!target || !/^mongodb(\+srv)?:\/\//.test(target)) {
  console.error('Usage: node backend/scripts/copy-database.js "mongodb+srv://USER:PASS@HOST/DBNAME" [--replace]');
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
  const dst = to.db();
  console.log(`Copying ${hide(source)}  →  ${hide(target)} (database "${dst.databaseName}")\n`);

  const collections = (await src.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));
  let copied = 0;
  for (const name of collections) {
    const existing = await dst.collection(name).countDocuments();
    if (existing && !replace) {
      console.log(`  skip  ${name.padEnd(18)} already has ${existing} documents (use --replace to overwrite)`);
      continue;
    }
    if (existing) await dst.collection(name).deleteMany({});
    const docs = await src.collection(name).find({}).toArray();
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
