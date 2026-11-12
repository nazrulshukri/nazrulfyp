// Reads the session token that /signin, /signup and /auth/firebase issue, and
// guards routes for signed-in users and admins (emails in ADMIN_EMAILS).
const jwt = require("jsonwebtoken");

const DEFAULT_SECRET = "your_jwt_secret";
const secret = () => process.env.JWT_SECRET || DEFAULT_SECRET;

// On the live site an unset JWT_SECRET means anyone could forge a token,
// so anything that trusts a token is switched off until it is set.
const secretIsUnsafe = () => Boolean(process.env.VERCEL) && !process.env.JWT_SECRET;

function readUser(req) {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
  if (!match || secretIsUnsafe()) return null;
  try {
    const payload = jwt.verify(match[1], secret());
    if (!payload.email || payload.purpose) return null; // reset tokens are not sessions
    return { email: String(payload.email).toLowerCase(), id: payload.userId };
  } catch {
    return null;
  }
}

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function requireUser(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ message: "Please sign in again." });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (secretIsUnsafe()) {
    return res.status(503).json({ message: "Admin is disabled until JWT_SECRET is set on the server." });
  }
  const user = readUser(req);
  if (!user) return res.status(401).json({ message: "Please sign in to open the admin dashboard." });
  if (!adminEmails().includes(user.email)) {
    return res.status(403).json({ message: "This account isn't an admin." });
  }
  req.user = user;
  next();
}

module.exports = { readUser, requireUser, requireAdmin, adminEmails };
