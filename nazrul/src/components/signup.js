import React, { useState } from "react";
import "./signup.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock } from "react-icons/fa";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Better: use env var. fallback to localhost.
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001";

      const response = await axios.post(`${baseURL}/signup`, {
        email: email.trim(),
        password,
      });

      setSuccess(response.data?.message || "Signup successful!");
      setLoading(false);

      // small delay so user sees success
      setTimeout(() => navigate("/signin"), 700);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error signing up. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="su-page">
      <div className="su-overlay" />

      <motion.div
        className="su-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="su-head">
          <p className="su-badge">Create Account</p>
          <h1 className="su-title">Sign up</h1>
          <p className="su-subtitle">
            Join Booking Flex and unlock a smooth booking experience.
          </p>
        </div>

        <div className="su-social">
          <button type="button" className="su-socialBtn fb" disabled>
            <FaFacebookF /> Continue with Facebook
          </button>
          <button type="button" className="su-socialBtn gg" disabled>
            <FaGoogle /> Continue with Google
          </button>
          <div className="su-divider">
            <span>OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="su-form">
          <label className="su-field">
            <span className="su-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="su-field">
            <span className="su-icon">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="su-field">
            <span className="su-icon">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button className="su-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              className="su-alert error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="su-alert success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="su-foot">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;