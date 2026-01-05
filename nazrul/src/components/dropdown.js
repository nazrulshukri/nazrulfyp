// src/components/DropdownMenu.js
import React from 'react';
import { Link } from 'react-router-dom';
import './dropdown.css'; // Create a CSS file for styling

const DropdownMenu = ({ userEmail }) => {
  return (
    <div className="dropdown">
      <button className="dropbtn">Hello, {userEmail || 'User'}</button>
      <div className="dropdown-content">
        <Link to="/profile">My Profile</Link>
        <Link to="/change-password">Change Password</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/server-qr">Server QR</Link>
        <Link to="/signout">Sign Out</Link>
      </div>
    </div>
  );
};

export default DropdownMenu;