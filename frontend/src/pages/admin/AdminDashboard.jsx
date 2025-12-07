// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setError("");
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const downloadReport = async () => {
    try {
      const res = await api.get("/admin/users-report", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download report");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin. From here you can manage users and view system stats.</p>

      {loadingStats && <p>Loading stats...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stats && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px 15px",
              minWidth: "180px",
            }}
          >
            <h4>Total Users</h4>
            <p>{stats.totalUsers}</p>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px 15px",
              minWidth: "180px",
            }}
          >
            <h4>Suppliers</h4>
            <p>{stats.totalSuppliers}</p>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px 15px",
              minWidth: "180px",
            }}
          >
            <h4>Supermarkets</h4>
            <p>{stats.totalSupermarkets}</p>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px 15px",
              minWidth: "180px",
            }}
          >
            <h4>Pending Users</h4>
            <p>{stats.pendingUsers}</p>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px 15px",
              minWidth: "180px",
            }}
          >
            <h4>Approved Users</h4>
            <p>{stats.approvedUsers}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <button onClick={() => navigate("/admin/pending-users")}>
          Manage Pending Users
        </button>

        <button onClick={downloadReport}>Download Users Report (CSV)</button>

        <button onClick={() => navigate("/admin/users")}>
          Manage Suppliers & Supermarkets
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
