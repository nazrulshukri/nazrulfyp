import React, { useEffect, useState } from "react";
import { t } from "../lib/i18n";
import CurrencyPicker from "./CurrencyPicker";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, Moon, Sun, X, Plane } from "lucide-react";
import { useTheme } from "./themeprovider";
import { clearSession } from "../lib/auth";
import { useAdminRole } from "../lib/adminAccess";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem("userEmail");
  // Only admins see the Admin link; re-checked as they move around (e.g. after sign-in).
  const adminRole = useAdminRole(`${email || ""}|${location.pathname}`);
  useEffect(() => {
    setMenuOpen(false);
    if (location.state?.email)
      localStorage.setItem("userEmail", location.state.email);
  }, [location]);
  const logout = () => {
    clearSession();
    navigate("/", { state: null });
  };
  return (
    <header className="bf-header">
      <Link className="bf-brand" to="/" aria-label={t("BookingFlex home")}>
        <span className="bf-brand-mark">
          <Plane size={22} />
        </span>
        booking<span>flex</span>
        <i />
      </Link>
      <nav
        className={menuOpen ? "bf-nav is-open" : "bf-nav"}
        aria-label={t("Main navigation")}
      >
        <NavLink end to="/">
          {t("Explore")}
        </NavLink>
        <NavLink to="/news">{t("News & deals")}</NavLink>
        <NavLink to="/dashboard">{t("My trips")}</NavLink>
        <NavLink to="/track">{t("Track")}</NavLink>
        <NavLink to="/about">{t("About")}</NavLink>
        {adminRole && <NavLink to="/admin">{t("Admin")}</NavLink>}
        <NavLink to="/contact">{t("Help centre")}</NavLink>
        <div className="bf26-cur-mobile">
          <CurrencyPicker />
        </div>
      </nav>
      <div className="bf-header-actions">
        <div className="bf26-cur-desktop">
          <CurrencyPicker />
        </div>
        <button
          className="bf-icon-button"
          onClick={toggleTheme}
          aria-label={t(isDarkMode ? "Use light theme" : "Use dark theme")}
        >
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        {email ? (
          <>
            <Link className="bf-account" to="/profile">
              {(localStorage.getItem("userName") || email.split("@")[0]).split(" ")[0]}
            </Link>
            <button className="bf-signin" onClick={logout}>
              {t("Sign out")}
            </button>
          </>
        ) : (
          <Link className="bf-signin" to="/signin">
            {t("Sign in")} <ArrowUpRight size={16} />
          </Link>
        )}
        <button
          className="bf-icon-button bf-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={t("Toggle navigation")}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
