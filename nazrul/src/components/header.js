import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Globe2, Menu, Moon, Sun, X, Plane } from "lucide-react";
import { useTheme } from "./themeprovider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem("userEmail");
  useEffect(() => {
    setMenuOpen(false);
    if (location.state?.email)
      localStorage.setItem("userEmail", location.state.email);
  }, [location]);
  const logout = () => {
    localStorage.removeItem("userEmail");
    navigate("/", { state: null });
  };
  return (
    <header className="bf-header">
      <Link className="bf-brand" to="/" aria-label="BookingFlex home">
        <span className="bf-brand-mark">
          <Plane size={22} />
        </span>
        booking<span>flex</span>
        <i />
      </Link>
      <nav
        className={menuOpen ? "bf-nav is-open" : "bf-nav"}
        aria-label="Main navigation"
      >
        <NavLink end to="/">
          Explore
        </NavLink>
        <NavLink to="/dashboard">My trips</NavLink>
        <NavLink to="/flightstatus">Flight status</NavLink>
        <NavLink to="/contact">Help centre</NavLink>
      </nav>
      <div className="bf-header-actions">
        <span className="bf-locale">
          <Globe2 size={16} /> EN · MYR
        </span>
        <button
          className="bf-icon-button"
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Use light theme" : "Use dark theme"}
        >
          {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        {email ? (
          <>
            <Link className="bf-account" to="/profile">
              {email.split("@")[0]}
            </Link>
            <button className="bf-signin" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <Link className="bf-signin" to="/signin">
            Sign in <ArrowUpRight size={16} />
          </Link>
        )}
        <button
          className="bf-icon-button bf-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
