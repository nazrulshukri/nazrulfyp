// Reads the session token that /signin, /signup and /auth/firebase issue, and
// guards routes for signed-in users, admins and super admins.
//   Super admins: emails in SUPER_ADMIN_EMAILS (server setting). They can add
//                 and remove admins from the dashboard.
//   Admins:       emails in ADMIN_EMAILS, or added by a super admin (stored
//                 in the "admins" collection).
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const DEFAULT_SECRET = "your_jwt_secret";
const secret = () => process.env.JWT_SECRET || DEFAULT_SECRET;

// On the live site an unset JWT_SECRET means anyone could forge a token,
// so anything that trusts a token is switched off until it is set.
const secretIsUnsafe = () => Boolean(process.env.VERCEL) && !process.env.JWT_SECRET;

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    addedBy: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true },
);
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

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

// Tolerates values pasted with quotes, brackets, "mailto:" or a leading
// "SUPER_ADMIN_EMAILS=" (easy to do in the Vercel settings box).
const listFrom = (value) =>
  (value || "")
    .replace(/["'`]/g, "")
    .replace(/^\s*[A-Z_]+\s*=/i, "")
    .split(/[,;\s]+/)
    .map((e) => e.replace(/^mailto:/i, "").replace(/["'`<>[\]()]/g, "").trim().toLowerCase())
    .filter((e) => e.includes("@"));
const superAdminEmails = () => listFrom(process.env.SUPER_ADMIN_EMAILS);
const configuredAdminEmails = () => listFrom(process.env.ADMIN_EMAILS);

/** "super", "admin" or null for the given email. */
async function roleFor(email) {
  if (!email) return null;
  if (superAdminEmails().includes(email)) return "super";
  if (configuredAdminEmails().includes(email)) return "admin";
  if (mongoose.connection.readyState === 1 && (await Admin.exists({ email }))) return "admin";
  return null;
}

function requireUser(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ message: "Please sign in again." });
  req.user = user;
  next();
}

const requireRole = (needed) => async (req, res, next) => {
  if (secretIsUnsafe()) {
    return res.status(503).json({ message: "Admin is disabled until JWT_SECRET is set on the server." });
  }
  const user = readUser(req);
  if (!user) return res.status(401).json({ message: "Please sign in to open the admin dashboard." });
  try {
    const role = await roleFor(user.email);
    if (!role || (needed === "super" && role !== "super")) {
      // Say which setting is missing (never the values) so a wrong or
      // not-yet-deployed SUPER_ADMIN_EMAILS is easy to spot.
      const hint = !superAdminEmails().length
        ? "SUPER_ADMIN_EMAILS isn't set on this deployment. Add it in Vercel, then redeploy."
        : `${user.email} isn't in SUPER_ADMIN_EMAILS or ADMIN_EMAILS on this deployment.`;
      return res.status(403).json({
        message: needed === "super" ? "Only a super admin can manage admins." : "This account isn't an admin.",
        hint,
      });
    }
    req.user = { ...user, role };
    next();
  } catch (error) {
    console.error("Admin check failed:", error.message);
    res.status(500).json({ message: "Could not check admin access." });
  }
};

const requireAdmin = requireRole("admin");
const requireSuperAdmin = requireRole("super");

module.exports = {
  Admin,
  readUser,
  roleFor,
  requireUser,
  requireAdmin,
  requireSuperAdmin,
  superAdminEmails,
  configuredAdminEmails,
};
