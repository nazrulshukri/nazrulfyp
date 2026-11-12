#!/usr/bin/env node
// Read-only look at a MongoDB database, compared with the local one.
// Prints collection names, record counts, index names and field names only
// (never the values), plus how many local accounts already exist there.
//
//   node backend/scripts/inspect-database.js --db Bookingflight      (uses ATLAS_URI from backend/.env)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { MongoClient } = require("mongodb");

const args = process.argv.slice(2);
const flag = args.indexOf("--db");
const dbName = flag >= 0 ? args[flag + 1] : null;
const target = args.find((a) => /^mongodb(\+srv)?:\/\//.test(a)) || process.env.ATLAS_URI;
const source = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!target) {
  console.error("Add ATLAS_URI=... to backend/.env first.");
  process.exit(1);
}

(async () => {
  const remote = new MongoClient(target, { serverSelectionTimeoutMS: 10000 });
  await remote.connect();
  const named = (/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/.exec(target) || [])[1];
  const db = remote.db(dbName || named || "nazrulfyp");
  const local = source ? new MongoClient(source, { serverSelectionTimeoutMS: 5000 }) : null;
  if (local) await local.connect().catch(() => null);
  const ldb = local ? local.db() : null;

  console.log(`Database "${db.databaseName}" on ${target.replace(/\/\/[^@/]*@/, "//***@").replace(/\?.*$/, "")}\n`);
  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
  const localNames = ldb ? (await ldb.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name) : [];
  for (const name of names) {
    const col = db.collection(name);
    const [count, indexes, sample] = await Promise.all([col.countDocuments(), col.indexes(), col.find({}).limit(20).toArray()]);
    const fields = [...new Set(sample.flatMap((d) => Object.keys(d)))].filter((f) => f !== "__v");
    const localCount = localNames.includes(name) ? await ldb.collection(name).countDocuments() : null;
    console.log(`  ${name.padEnd(20)} ${String(count).padStart(5)} records${localCount != null ? `   (local: ${localCount})` : ""}`);
    console.log(`      fields:  ${fields.join(", ") || "-"}`);
    const extra = indexes.filter((i) => i.name !== "_id_").map((i) => `${i.name}${i.unique ? " (unique)" : ""}`);
    if (extra.length) console.log(`      indexes: ${extra.join(", ")}`);
  }
  const onlyLocal = localNames.filter((n) => !names.includes(n) && !n.startsWith("system."));
  if (onlyLocal.length) console.log(`\n  Only on this Mac (would be added): ${onlyLocal.join(", ")}`);
  if (ldb && names.includes("users")) {
    const localEmails = (await ldb.collection("users").find({}, { projection: { email: 1 } }).toArray()).map((u) => String(u.email).toLowerCase());
    const both = await db.collection("users").countDocuments({ email: { $in: localEmails } });
    console.log(`\n  Accounts: ${localEmails.length} on this Mac, ${both} of them already in "${db.databaseName}".`);
  }
  await remote.close();
  if (local) await local.close();
})().catch((e) => {
  console.error("Could not read the database:", e.message.replace(/\/\/[^@/]*@/, "//***@"));
  process.exit(1);
});
