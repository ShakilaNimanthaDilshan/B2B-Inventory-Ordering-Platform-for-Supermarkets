// frontend/src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import icon from "../assets/icon.png"; // adjust path if needed

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Left side */}
      <div className="home-left">
        <h1>Welcome to the Inventory Management System</h1>
        <p>Admin, Suppliers, and Supermarkets in one simple system.</p>

        <div className="button-group">
          <button className="btn login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="btn register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="home-right">
        <img src={icon} alt="Inventory Icon" />
      </div>
    </div>
  );
};

export default HomePage;
