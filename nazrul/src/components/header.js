import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './themeprovider';
import './header.css';
import logo from '../img/assets/Booking.png';
import searchIcon from '../img/assets/search-w.png';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const isActive = (path) => location.pathname === path;
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleHelpSelect = (text) => {
  setSearchTerm(text);          // put text into input
  
  setSearchFocused(false);      // close dropdown
  setSuggestions([]);           // optional
  navigate(`/search?query=${encodeURIComponent(text)}`);
};

  const email = location.state?.email || localStorage.getItem('userEmail');

  if (location.state?.email) {
    localStorage.setItem('userEmail', location.state.email);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
      if (!location.pathname.startsWith("/search")) {
    setSearchTerm("");
    setSuggestions([]);
    setSearchFocused(false);
  }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname]);

  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      const base = value.toLowerCase();
      const fakeSuggestions = [
        base,
        `flights to ${base}`,
        `cheap ${base} flights`,
        `${base} travel deals`,
      ];
      setSuggestions(fakeSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/search?query=${searchTerm}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const [searchFocused, setSearchFocused] = useState(false);


  return (
    <header className={`header ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
      <div className="header-content">
        <div className="logo-wrapper">
  <img src={logo} alt="Booking Flex Logo" className="header-logo" />
</div>
        
        {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}

      <button className={`hamburger ${menuOpen ? 'open' : ''}`}onClick={toggleMenu} aria-label="Menu"> 
      <span></span>
      <span></span>
      <span></span>
      </button>

<nav className={`nav-container ${menuOpen ? 'open' : ''}`}>
  <ul className="nav-list">
    <li>
      <Link
        to="/"
        className={isActive('/') ? 'nav-active' : ''}
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
    </li>

    <li>
      <Link
        to="/about"
        className={isActive('/about') ? 'nav-active' : ''}
        onClick={() => setMenuOpen(false)}
      >
        About
      </Link>
    </li>

    <li>
      <Link
        to="/services"
        className={isActive('/services') ? 'nav-active' : ''}
        onClick={() => setMenuOpen(false)}
      >
        Check-in
      </Link>
    </li>

    <li>
      <Link
        to="/flightstatus"
        className={isActive('/flightstatus') ? 'nav-active' : ''}
        onClick={() => setMenuOpen(false)}
      >
        Flight Status
      </Link>
    </li>

    {!email && (
      <>
        <li>
          <Link
            to="/signup"
            className={isActive('/signup') ? 'nav-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </li>

        <li>
          <Link
            to="/signin"
            className={isActive('/signin') ? 'nav-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </li>
      </>
    )}
  </ul>
</nav>


        <div className="header-actions">
          {email ? (
            <div className="user-dropdown1" ref={dropdownRef}>
              <div className="user-greeting1" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Hi, {email.split('@')[0]} ▼
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu1">
                  <Link to="/profile" className="dropdown-item1">Profile</Link>
                  <Link to="/profile-maintenance" className="dropdown-item1">Profile Maintenance</Link>
                  <div className="dropdown-item1 logout" onClick={handleLogout}>Logout</div>
                </div>
              )}
            </div>
          ) : (
            <>
            <div
  className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
  onClick={toggleTheme}
  aria-label="Toggle theme"
>
  <div className="theme-track">
    <span className="theme-icon sun">☀️</span>
    <span className="theme-icon moon">🌙</span>
  </div>

  <div className="theme-thumb">
    <span className="thumb-icon">
      {isDarkMode ? "🌙" : "☀️"}
    </span>
  </div>
</div>



              <form className="search-form" onSubmit={handleSearchSubmit}>
  <input
    type="text"
    value={searchTerm}
    onChange={handleSearchChange}
    onFocus={() => setSearchFocused(true)}
    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
    placeholder="Search..."
  />

  <button type="submit">
    <img src={searchIcon} alt="Search Icon" />
  </button>

  {/* HELP DROPDOWN */}
  {searchFocused && (
  <div className="search-help-dropdown">
    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("How to search flights")}
    >
      ✈️ How to search flights
    </div>

    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("How to book a hotel")}
    >
      🏨 How to book a hotel
    </div>

    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("How to book train tickets")}
    >
      🚆 How to book train tickets
    </div>

    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("How to claim flight vouchers")}
    >
      🎟️ How to claim flight vouchers
    </div>

    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("Member discounts")}
    >
      💳 How to get member discounts
    </div>

    <div
      className="search-help-item"
      onMouseDown={() => handleHelpSelect("Student discount pricing")}
    >
      🎓 Student discount pricing
    </div>
  </div>
)}


  {/* NORMAL SEARCH SUGGESTIONS */}
  {suggestions.length > 0 && (
    <ul className="search-suggestions">
      {suggestions.map((item, i) => (
        <li
          key={i}
          onClick={() => {
            setSearchTerm(item);
            setSuggestions([]);
            navigate(`/search?query=${item}`);
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  )}
</form>

            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
