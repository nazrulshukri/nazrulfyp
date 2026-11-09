// Signed-in session kept in localStorage. "userEmail" is the key the rest of
// the app (header, My trips, profile) already reads.
const KEYS = { email: "userEmail", name: "userName", token: "token" };

export function saveSession({ token, user }) {
  if (!user?.email) return;
  localStorage.setItem(KEYS.email, user.email);
  localStorage.setItem(KEYS.name, user.name || "");
  if (token) localStorage.setItem(KEYS.token, token);
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getSession() {
  const email = localStorage.getItem(KEYS.email);
  return email ? { email, name: localStorage.getItem(KEYS.name) || "" } : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 0–4 score plus the checks a new password passes. */
export function passwordStrength(password = "") {
  const checks = {
    length: password.length >= 8,
    letters: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score: checks.length ? score : Math.min(score, 1), checks };
}

/** Best-effort message from an axios error. */
export const errorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  (err?.request && !err?.response ? "Can't reach the server. Check your connection and try again." : fallback);
