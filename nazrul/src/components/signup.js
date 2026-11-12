import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { saveSession, EMAIL_RE, passwordStrength, errorMessage } from "../lib/auth";
import { AuthLayout, AuthField, GoogleButton, EmailCodeSignIn, StrengthMeter } from "./AuthKit";
import greece from "../img/assets/travel/Greece_hero.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 && "Enter your name",
    email: !EMAIL_RE.test(form.email.trim()) && "Enter a valid email address",
    password: !passwordStrength(form.password).checks.length && "Use at least 8 characters",
    confirm: form.confirm !== form.password && "Passwords don't match",
    agree: !agree && "Please accept the terms to continue",
  };
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    error: touched[key] && errors[key],
  });

  async function submit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true, agree: true });
    if (Object.values(errors).some(Boolean)) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/signup`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      saveSession(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err?.response?.status === 409) {
        navigate("/signin", {
          state: { prefillEmail: form.email.trim(), notice: err.response.data.message, from: location.state?.from },
        });
        return;
      }
      setError(errorMessage(err, "We couldn't create your account. Please try again."));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      image={greece}
      kicker="Join BookingFlex"
      title={t("Less ordinary. More out there.")}
      text="Create a free account to keep your tickets, vouchers and trips together."
    >
      <header className="bf26-auth-head">
        <h1>{t("Create your account")}</h1>
        <p>
          {t("Already have one?")} <Link to="/signin" state={location.state}>{t("Sign in")}</Link>
        </p>
      </header>

      <GoogleButton onError={setError} redirectTo={redirectTo} />

      <form className="bf26-auth-form" onSubmit={submit} noValidate>
        <AuthField id="signup-name" label={t("Full name")} icon={User} autoComplete="name" placeholder={t("As on your passport")} {...bind("name")} />
        <AuthField id="signup-email" label={t("Email")} icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" {...bind("email")} />
        <AuthField
          id="signup-password"
          label={t("Password")}
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder={t("At least 8 characters")}
          {...bind("password")}
        />
        <StrengthMeter password={form.password} />
        <AuthField
          id="signup-confirm"
          label={t("Confirm password")}
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder={t("Type it again")}
          {...bind("confirm")}
        />
        <label className={`bf26-auth-check ${touched.agree && errors.agree ? "has-error" : ""}`}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the BookingFlex terms and privacy policy.
            {touched.agree && errors.agree && <small role="alert">{errors.agree}</small>}
          </span>
        </label>
        {error && (
          <p className="bf26-auth-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="bf26-primary bf26-cta" disabled={loading}>
          {loading ? <Loader2 size={17} className="bf26-spin" /> : null}
          {loading ? "Creating account…" : "Create account"}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
      <EmailCodeSignIn initialEmail={form.email.trim()} redirectTo={redirectTo} askName />
    </AuthLayout>
  );
};

export default Signup;
