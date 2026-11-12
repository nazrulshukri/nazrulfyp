import React, { useState } from "react";
import { t } from "../lib/i18n";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { saveSession, passwordStrength, errorMessage } from "../lib/auth";
import { AuthLayout, AuthField, StrengthMeter } from "./AuthKit";
import london from "../img/assets/travel/london.jpg";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const errors = {
    password: !passwordStrength(password).checks.length && "Use at least 8 characters",
    confirm: confirm !== password && "Passwords don't match",
  };

  async function submit(e) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (errors.password || errors.confirm) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/reset-password`, { token, password });
      saveSession(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "We couldn't update your password. Please try again."));
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      image={london}
      kicker="Account help"
      title={t("Choose a new password.")}
      text="Pick something you haven't used before. You'll be signed in straight away."
    >
      <header className="bf26-auth-head">
        <h1>{t("Set a new password")}</h1>
        <p>
          {t("Link expired?")} <Link to="/forgotpassword">{t("Send a new one")}</Link>
        </p>
      </header>
      <form className="bf26-auth-form" onSubmit={submit} noValidate>
        <AuthField
          id="reset-password"
          label={t("New password")}
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder={t("At least 8 characters")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={touched.password && errors.password}
        />
        <StrengthMeter password={password} />
        <AuthField
          id="reset-confirm"
          label={t("Confirm new password")}
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder={t("Type it again")}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={touched.confirm && errors.confirm}
        />
        {error && (
          <p className="bf26-auth-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="bf26-primary bf26-cta" disabled={loading}>
          {loading ? <Loader2 size={17} className="bf26-spin" /> : null}
          {loading ? "Saving…" : "Save and sign in"}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
