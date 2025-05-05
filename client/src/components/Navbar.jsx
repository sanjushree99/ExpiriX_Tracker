import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { debounce } from 'lodash';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${menuOpen ? 'menu-open' : ''} ${visible ? 'visible' : 'hidden'}`}>
      <div className="logo-container">
        <h2 className="logo">
          <span className="logo-text">Expirix</span>
          <span className="logo-icon">🚀</span>
        </h2>
      </div>

      <div className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
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