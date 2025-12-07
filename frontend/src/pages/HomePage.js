// frontend/src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Inventory Management System</h1>
      <p>Admin, Suppliers, and Supermarkets in one simple system.</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{ padding: "10px 20px" }}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default HomePage;
