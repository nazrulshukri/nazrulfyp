import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Plane, Check, Ticket, BedDouble, TrainFront } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { API_BASE } from "../lib/apiConfig";
import { saveSession, passwordStrength, errorMessage } from "../lib/auth";

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

/** "Continue with Google". Hidden when Firebase isn't configured for this build. */
export function GoogleButton({ onError, redirectTo }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!auth) return null;
  async function go() {
    onError("");
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await axios.post(`${API_BASE}/auth/firebase`, { idToken });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") return;
      onError(errorMessage(err, "Google sign-in didn't work. Please try again."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className="bf26-auth-google" onClick={go} disabled={busy}>
        <GoogleMark /> {busy ? "Connecting…" : "Continue with Google"}
      </button>
      <div className="bf26-auth-or">
        <span>{t("or with email")}</span>
      </div>
    </>
  );
}
