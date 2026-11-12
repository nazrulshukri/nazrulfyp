#!/bin/bash
# Saves your MongoDB Atlas address into backend/.env as ATLAS_URI without
# ever showing it on screen. Handles <db_password>, special characters and
# usernames with "@", and uses the Bookingflight database.
cd "$(dirname "$0")/.." || exit 1
echo ""
echo "Paste the address from Atlas (Connect > Drivers), then press Enter."
echo "(Nothing will show while you paste; that's normal.)"
read -rs uri
echo ""
uri="$(printf '%s' "$uri" | tr -d '[:space:]')"
case "$uri" in
  mongodb+srv://*|mongodb://*) ;;
  *) echo "That doesn't look like a MongoDB address (it should start with mongodb+srv://). Nothing saved."; exit 1 ;;
esac
pass=""
if printf '%s' "$uri" | grep -q '<db_password>'; then
  echo "Now type your DATABASE USER's password, then press Enter (it won't show):"
  read -rs pass
  echo ""
fi
# Rebuild the address safely: encode the username and password, add the
# database name. Prints only the username and server, never the password.
out="$(PASS="$pass" node -e '
const raw = process.argv[1];
const m = /^(mongodb(?:\+srv)?:\/\/)(.*)@([^@\/?]+)(\/[^?]*)?(\?.*)?$/.exec(raw);
if (!m) { console.error("Could not read that address. Copy it again from Atlas > Connect > Drivers."); process.exit(1); }
const [, scheme, cred, host, , query] = m;
let [user, ...rest] = cred.split(":");
let pass = rest.join(":");
if (pass === "<db_password>") pass = process.env.PASS || "";
const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
user = encodeURIComponent(dec(user));
pass = encodeURIComponent(dec(pass));
const uri = `${scheme}${user}:${pass}@${host}/Bookingflight${query || "?retryWrites=true&w=majority"}`;
process.stdout.write(uri);
console.error(`Database user: ${dec(user)}   Server: ${host}   Database: Bookingflight`);
' "$uri")" || exit 1
grep -v '^ATLAS_URI=' .env > .env.tmp 2>/dev/null; mv .env.tmp .env
printf 'ATLAS_URI=%s\n' "$out" >> .env
echo "Saved to backend/.env. Testing the connection…"
node -e '
require("dotenv").config();
const { MongoClient } = require("mongodb");
let c;
try { c = new MongoClient(process.env.ATLAS_URI, { serverSelectionTimeoutMS: 10000 }); }
catch (e) { console.log("That address is not valid:", e.message); process.exit(1); }
c.connect().then(async () => { const n = (await c.db().listCollections().toArray()).length; console.log(`Connected! ${n} collections found. Go back to the chat and say "done".`); await c.close(); })
 .catch((e) => {
   const msg = String(e.message).replace(/\/\/[^@\/]*@/g, "//***@");
   console.log("Could not connect:", /auth/i.test(msg) ? "wrong database username or password." : msg);
   console.log("Use a user from Atlas > Database Access (not your MongoDB website login), and check Network Access allows 0.0.0.0/0.");
   process.exit(1);
 });
'
