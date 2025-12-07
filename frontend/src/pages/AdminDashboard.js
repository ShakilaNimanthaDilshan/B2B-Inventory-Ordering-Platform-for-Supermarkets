// frontend/src/pages/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin. From here you can manage users.</p>

      <button onClick={() => navigate("/admin/pending-users")}>
        Manage Pending Users
      </button>
    </div>
  );
};

export default AdminDashboard;
