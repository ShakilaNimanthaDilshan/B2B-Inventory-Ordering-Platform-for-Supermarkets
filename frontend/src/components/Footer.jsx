// frontend/src/components/Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-section">
          <h3>📦 InventoryPro</h3>
          <p>
            A smart B2B inventory management system designed to connect suppliers,
            supermarkets, and administrators in one reliable platform.
          </p>
        </div>

        {/* Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@inventorypro.com</p>
          <p>Phone: +94 77 123 4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} InventoryPro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
