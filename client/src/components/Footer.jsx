import React from 'react';
import './Footer.css';
import { FaLinkedin, FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Expirix. All rights reserved.</p>
      <div className="social-icons">
        <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin /></a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
        <a href="mailto:someone@example.com"><FaEnvelope /></a>
      </div>
    </footer>
  );
};

export default Footer;
