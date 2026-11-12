import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Plane, Check, Ticket, BedDouble, TrainFront, Mail, User, Loader2 } from "lucide-react";
import { OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { API_BASE } from "../lib/apiConfig";
import { saveSession, passwordStrength, errorMessage, EMAIL_RE } from "../lib/auth";

export function AuthLayout({ image, kicker, title, text, children }) {
  return (
    <div className="bf26-page bf26-auth">
      <div className="bf26-auth-card">
        <aside className="bf26-auth-side" style={{ "--auth-img": `url(${image})` }}>
          <Link to="/" className="bf26-auth-brand" aria-label={t("BookingFlex home")}>
            <span>
              <Plane size={18} />
            </span>
            <b>
              booking<em>flex.</em>
            </b>
          </Link>
          <div className="bf26-auth-side-copy">
            <span className="bf26-kicker">{kicker}</span>
            <h2>{title}</h2>
            <p>{text}</p>
            <ul>
              <li>
                <Ticket size={15} /> {t("Tickets and vouchers in one place")}
              </li>
              <li>
                <BedDouble size={15} /> {t("Flights, stays and vacations")}
              </li>
              <li>
                <TrainFront size={15} /> {t("Rail across Malaysia")}
              </li>
            </ul>
          </div>
        </aside>
        <main className="bf26-auth-main">{children}</main>
      </div>
    </div>
  );
}

export function AuthField({ id, label, icon: Icon, error, type = "text", hint, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={`bf26-input ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div>
        <Icon size={17} aria-hidden="true" />
        <input id={id} type={isPassword && show ? "text" : type} aria-invalid={!!error} {...props} />
        {isPassword && (
          <button
            type="button"
            className="bf26-auth-eye"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? <small role="alert">{error}</small> : hint ? <small className="bf26-auth-hint">{hint}</small> : null}
    </div>
  );
}

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];

export function StrengthMeter({ password }) {
  if (!password) return null;
  const { score, checks } = passwordStrength(password);
  return (
    <div className={`bf26-strength is-${score}`} aria-live="polite">
      <div className="bf26-strength-bar">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= score ? "is-on" : ""} />
        ))}
        <span>{STRENGTH[score]}</span>
      </div>
      <ul>
        {[
          ["length", "8+ characters"],
          ["letters", "Upper & lower case"],
          ["number", "A number"],
          ["symbol", "A symbol"],
        ].map(([key, label]) => (
          <li key={key} className={checks[key] ? "is-ok" : ""}>
            <Check size={12} /> {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Extra Firebase sign-in providers, switched on per build with
// REACT_APP_AUTH_PROVIDERS="microsoft,yahoo,apple" once each is enabled in
// the Firebase console (Authentication → Sign-in method).
const EXTRA_PROVIDERS = {
  microsoft: { id: "microsoft.com", label: "Continue with Microsoft", hint: "Outlook, Hotmail, Live", mark: "🟦" },
  yahoo: { id: "yahoo.com", label: "Continue with Yahoo", hint: "Yahoo Mail", mark: "🟪" },
  apple: { id: "apple.com", label: "Continue with Apple", hint: "iCloud, Apple ID", mark: "" },
};
const enabledExtras = () =>
  String(process.env.REACT_APP_AUTH_PROVIDERS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((k) => EXTRA_PROVIDERS[k]);

/**
 * "Continue with Google" plus any extra providers. Hidden when Firebase
 * isn't configured for this build.
 */
export function GoogleButton({ onError, redirectTo }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  if (!auth) return null;
  async function go(key) {
    onError("");
    setBusy(key);
    try {
      let provider = googleProvider;
      if (key !== "google") {
        provider = new OAuthProvider(EXTRA_PROVIDERS[key].id);
        provider.addScope("email");
        if (key === "apple") provider.addScope("name");
      }
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const { data } = await axios.post(`${API_BASE}/auth/firebase`, { idToken });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") return;
      const name = key === "google" ? "Google" : EXTRA_PROVIDERS[key].label.replace("Continue with ", "");
      const why =
        err?.code === "auth/operation-not-allowed"
          ? ` ${name} sign-in isn't switched on in Firebase yet.`
          : err?.code === "auth/unauthorized-domain"
            ? " This website isn't on Firebase's authorised domains list yet."
            : err?.code === "auth/account-exists-with-different-credential"
              ? " This email already uses another sign-in method. Try Google or a sign-in code."
              : "";
      onError(why ? `${name} sign-in didn't work.${why}` : errorMessage(err, `${name} sign-in didn't work. Please try again.`));
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <div className="bf26-auth-providers">
        <button type="button" className="bf26-auth-google" onClick={() => go("google")} disabled={Boolean(busy)}>
          <GoogleMark /> {busy === "google" ? "Connecting…" : "Continue with Google"}
        </button>
        {enabledExtras().map((key) => (
          <button key={key} type="button" className={`bf26-auth-google is-${key}`} onClick={() => go(key)} disabled={Boolean(busy)} title={EXTRA_PROVIDERS[key].hint}>
            {key === "apple" ? <span className="bf26-apple" aria-hidden="true"></span> : <span aria-hidden="true">{EXTRA_PROVIDERS[key].mark}</span>}{" "}
            {busy === key ? "Connecting…" : EXTRA_PROVIDERS[key].label}
          </button>
        ))}
      </div>
      <div className="bf26-auth-or">
        <span>{t("or with email")}</span>
      </div>
    </>
  );
}

/**
 * Sign in with a 6-digit code sent to any email address (Gmail, Yahoo,
 * Outlook, Hotmail, iCloud…). New emails get an account automatically.
 */
export function EmailCodeSignIn({ initialEmail = "", redirectTo, askName = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function send(e) {
    if (e) e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setMsg({ error: true, text: "Enter a valid email address." });
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/email-code`, { email: email.trim() });
      setStep("code");
      setMsg({ text: `${data.message} Check your inbox (and spam folder).` });
    } catch (err) {
      setMsg({ error: true, text: errorMessage(err, "We couldn't send the code. Please try again.") });
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/email-code/verify`, { email: email.trim(), code, name: name.trim() });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setMsg({ error: true, text: errorMessage(err, "That code didn't work. Please try again.") });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="bf26-auth-codebtn" onClick={() => setOpen(true)}>
        <Mail size={16} /> Email me a sign-in code instead
        <small>Works with Gmail, Yahoo, Outlook, Hotmail, iCloud and any other email</small>
      </button>
    );
  }

  return (
    <div className="bf26-auth-code">
      {step === "email" ? (
        <form onSubmit={send} noValidate>
          <AuthField id="code-email" label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {askName && (
            <AuthField id="code-name" label="Your name (optional)" icon={User} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <button type="submit" className="bf26-primary bf26-cta" disabled={busy}>
            {busy ? <Loader2 size={17} className="bf26-spin" /> : <Mail size={17} />} Send my code
          </button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate>
          <label className="bf26-auth-otp">
            <span>6-digit code sent to {email.trim()}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </label>
          <button type="submit" className="bf26-primary bf26-cta" disabled={busy || code.length !== 6}>
            {busy ? <Loader2 size={17} className="bf26-spin" /> : null} Sign in
          </button>
          <div className="bf26-auth-row">
            <button type="button" className="bf26-auth-linkbtn" onClick={() => send()} disabled={busy}>
              Send a new code
            </button>
            <button type="button" className="bf26-auth-linkbtn" onClick={() => { setStep("email"); setCode(""); setMsg(null); }}>
              Use a different email
            </button>
          </div>
        </form>
      )}
      {msg && (
        <p className={msg.error ? "bf26-auth-alert" : "bf26-auth-note"} role={msg.error ? "alert" : "status"}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
