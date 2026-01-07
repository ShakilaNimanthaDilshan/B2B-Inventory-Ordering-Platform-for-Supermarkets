// frontend/src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import AdminStatsCharts from "../components/AdminStatsCharts.jsx";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");

  // 📊 Fetch dashboard stats
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

  // 📄 Download CSV report
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
    <div className="admin-page">
      <h2 className="admin-header-title">Admin Dashboard</h2>
      <p className="admin-header-subtitle">
        Welcome, Admin. View system stats and manage platform users.
      </p>

      {loadingStats && <p>Loading stats...</p>}
      {error && <p className="admin-error">{error}</p>}

      {stats && (
        <>
          <div className="admin-card-grid">
            <div className="admin-card">
              <div className="admin-card-title">Total Users</div>
              <div className="admin-card-value">{stats.totalUsers}</div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Suppliers</div>
              <div className="admin-card-value">{stats.totalSuppliers}</div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Supermarkets</div>
              <div className="admin-card-value">
                {stats.totalSupermarkets}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Pending Users</div>
              <div className="admin-card-value">{stats.pendingUsers}</div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">Approved Users</div>
              <div className="admin-card-value">{stats.approvedUsers}</div>
            </div>
          </div>

          {/* 📈 Charts */}
          <AdminStatsCharts stats={stats} />
        </>
      )}

      <div className="admin-actions-row">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/pending-users")}
        >
          Manage Pending Users
        </button>

        <button
          className="btn"
          onClick={() => navigate("/admin/users")}
        >
          Manage Suppliers & Supermarkets
        </button>

        <button className="btn" onClick={downloadReport}>
          Download Users Report (CSV)
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
