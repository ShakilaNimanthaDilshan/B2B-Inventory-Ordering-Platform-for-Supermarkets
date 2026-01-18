// frontend/src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <Link to="/">📦 BridgeMart</Link>
      </div>

      <div className="navbar-links">
        {/* PUBLIC LINKS (only when NOT logged in) */}
        {!user && (
          <>
            <Link to="/" className="nav-link public-link">
              Home
            </Link>
            <Link to="/about" className="nav-link public-link">
              About
            </Link>
            <Link to="/contact" className="nav-link public-link">
              Contact
            </Link>
          </>
        )}

        {/* ROLE-BASED LINKS (only when logged in) */}
        {user && (
          <>
            {user.role === "admin" && (
              <>
                <Link to="/admin/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/admin/pending-users" className="nav-link">
                  Pending
                </Link>
                <Link to="/admin/users" className="nav-link">
                  Users
                </Link>
              </>
            )}

            {user.role === "supplier" && (
              <Link to="/supplier/dashboard" className="nav-link">
                Supplier Dashboard
              </Link>
            )}

            {user.role === "supermarket" && (
              <Link to="/supermarket/dashboard" className="nav-link">
                Supermarket Dashboard
              </Link>
            )}

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
