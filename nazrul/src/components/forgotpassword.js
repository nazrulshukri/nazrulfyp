import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Mail, ArrowLeft, Send, MailCheck, Loader2 } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { EMAIL_RE, errorMessage } from "../lib/auth";
import { AuthLayout, AuthField } from "./AuthKit";
import london from "../img/assets/travel/london.jpg";

const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const invalid = !EMAIL_RE.test(email.trim()) && "Enter a valid email address";

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/forgotpassword`, { email: email.trim() });
      setSent(data.message);
    } catch (err) {
      setError(errorMessage(err, "We couldn't send the email. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      image={london}
      kicker="Account help"
      title={t("Back on track in a minute.")}
      text="We'll email you a secure link to choose a new password."
    >
      <header className="bf26-auth-head">
        <h1>{t("Forgot your password?")}</h1>
        <p>{t("Enter the email you signed up with.")}</p>
      </header>
      {sent ? (
        <div className="bf26-auth-done">
          <MailCheck size={30} />
          <h2>{t("Check your inbox")}</h2>
          <p>{sent} The link works for 1 hour. Look in your spam folder if it doesn't arrive.</p>
          <Link className="bf26-primary bf26-cta" to="/signin" state={{ prefillEmail: email.trim() }}>
            {t("Back to sign in")}
          </Link>
        </div>
      ) : (
        <form className="bf26-auth-form" onSubmit={submit} noValidate>
          <AuthField
            id="forgot-email"
            label={t("Email")}
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched && invalid}
          />
          {error && (
            <p className="bf26-auth-alert" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="bf26-primary bf26-cta" disabled={loading}>
            {loading ? <Loader2 size={17} className="bf26-spin" /> : <Send size={16} />}
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <Link className="bf26-auth-back" to="/signin">
            <ArrowLeft size={15} /> {t("Back to sign in")}
          </Link>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
