import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="logo-container">
        <h2 className="logo">
          <span className="logo-text">Expirix</span>
          <span className="logo-icon">🚀</span>
        </h2>
      </div>

      <div className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        <li>
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="nav-icon-container"><i className="nav-icon">🏠</i></div>
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/inventory" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="nav-icon-container"><i className="nav-icon">📦</i></div>
            <span>Inventory</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/scan" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="nav-icon-container"><i className="nav-icon">📱</i></div>
            <span>Scan</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/donate" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="nav-icon-container"><i className="nav-icon">🤝</i></div>
            <span>Donate</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/reminders" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="nav-icon-container"><i className="nav-icon">⏰</i></div>
            <span>Reminders</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;