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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/search?query=${searchTerm}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <header className={`header ${isDarkMode ? 'darkMode' : 'lightMode'}`}>
      <div className="header-content">
        <img src={logo} alt="Booking Flex Logo" className="header-logo" />

        {/* <nav>
          <ul className="nav-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Check-in</Link></li>
            <li><Link to="/contact">Flight Status</Link></li>
            <li><Link to="/signup" >Sign Up</Link></li>
            <li><Link to="/signin">Login</Link></li>
          </ul>
        </nav> */}

<nav>
  <ul className="nav-list">
    <li><Link to="/">Home</Link></li>
    <li><Link to="/about">About</Link></li>
    <li><Link to="/services">Check-in</Link></li>
    <li><Link to="/contact">Flight Status</Link></li>

    {/* Hide Sign Up & Sign In when logged in */}
    {!email && (
      <>
        <li><Link to="/signup">Sign Up</Link></li>
        <li><Link to="/signin">Login</Link></li>
      </>
    )}
  </ul>
</nav>


        <div className="header-actions">
          {email ? (
            // 👤 "Hi, email" replaces theme toggle & search bar
            <div className="user-dropdown1" ref={dropdownRef}>
              <div
                className="user-greeting1"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
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
            // 🌗 Theme Toggle & 🔍 Search Bar (for non-logged-in users)
            <>
              <div className={`switch-toggle ${isDarkMode ? 'checked' : ''}`} onClick={toggleTheme}>
                <div className="switch-toggle-knob"></div>
              </div>

              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
                <button type="submit">
                  <img src={searchIcon} alt="Search Icon" />
                </button>
              </form>

             
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
