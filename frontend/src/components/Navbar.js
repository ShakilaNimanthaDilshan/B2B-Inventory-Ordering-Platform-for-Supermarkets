// frontend/src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: "#222",
        color: "#fff",
      }}
    >
      {/* Left side - logo / home */}
      <div>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          <strong>Inventory System</strong>
        </Link>
      </div>

      {/* Right side - links */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* 🔹 If NO user is logged in */}
        {!user && (
          <>
            <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Register
            </Link>
          </>
        )}

        {/* 🔹 If user IS logged in */}
        {user && (
          <>
            {/* Admin-only links */}
            {user.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/pending-users"
                  style={{ color: "#fff", textDecoration: "none" }}
                >
                  Pending Users
                </Link>
              </>
            )}

            {/* Supplier link */}
            {user.role === "supplier" && (
              <Link
                to="/supplier/dashboard"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                Supplier Dashboard
              </Link>
            )}

            {/* Supermarket link */}
            {user.role === "supermarket" && (
              <Link
                to="/supermarket/dashboard"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                Supermarket Dashboard
              </Link>
            )}

            {/* Logout button (for all logged-in users) */}
            <button
              onClick={logout}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
