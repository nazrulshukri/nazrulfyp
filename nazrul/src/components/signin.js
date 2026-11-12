import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { saveSession, EMAIL_RE, errorMessage } from "../lib/auth";
import { AuthLayout, AuthField, GoogleButton } from "./AuthKit";
import plane from "../img/assets/4k-plane-beautiful-sunset-shawraxhzg2ibf4f.jpg";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";
  const [email, setEmail] = useState(location.state?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(false);

  const errors = {
    email: !EMAIL_RE.test(email.trim()) && "Enter a valid email address",
    password: !password && "Enter your password",
  };

  async function submit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/signin`, { email: email.trim(), password });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "We couldn't sign you in. Please try again."));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      image={plane}
      kicker="Welcome back"
      title={t("Your next trip starts here.")}
      text="Sign in to see your bookings, download tickets and pick up where you left off."
    >
      <header className="bf26-auth-head">
        <h1>{t("Sign in")}</h1>
        <p>
          {t("New to BookingFlex?")} <Link to="/signup">{t("Create an account")}</Link>
        </p>
      </header>

      <GoogleButton onError={setError} redirectTo={redirectTo} />

      <form className="bf26-auth-form" onSubmit={submit} noValidate>
        <AuthField
          id="signin-email"
          label={t("Email")}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={touched.email && errors.email}
        />
        <AuthField
          id="signin-password"
          label={t("Password")}
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder={t("Your password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={touched.password && errors.password}
        />
        <div className="bf26-auth-row">
          <Link to="/forgotpassword" state={{ email: email.trim() }}>
            {t("Forgot password?")}
          </Link>
        </div>
        {error && (
          <p className="bf26-auth-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="bf26-primary bf26-cta" disabled={loading}>
          {loading ? <Loader2 size={17} className="bf26-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
