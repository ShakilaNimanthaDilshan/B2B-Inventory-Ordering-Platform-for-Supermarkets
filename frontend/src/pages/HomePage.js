// frontend/src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";
import icon from "../assets/icon.png";
import InfoSection from "../components/InfoSection";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 check login

  return (
    <>
      <div className="home-container">
        <div className="home-left">
          <h1>Welcome to the Inventory Management System</h1>
          <p>Admin, Suppliers, and Supermarkets in one simple system.</p>

          {!user && (
            <div className="button-group">
              <button
                className="btn login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn register-btn"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          )}
        </div>

        <div className="home-right">
          <img src={icon} alt="Inventory Icon" />
        </div>
      </div>

      {/* ✅ InfoSection ONLY when NOT logged in */}
      {!user && <InfoSection />}
    </>
  );
};

export default HomePage;
