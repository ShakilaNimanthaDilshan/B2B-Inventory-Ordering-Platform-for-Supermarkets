import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fake chart data for now (we can wire real data later)
  const [ordersData, setOrdersData] = useState([
    { date: "Mon", orders: 10 },
    { date: "Tue", orders: 15 },
    { date: "Wed", orders: 8 },
    { date: "Thu", orders: 20 },
    { date: "Fri", orders: 12 },
  ]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/admin/dashboard/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard summary error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* Quick links */}
      <div style={{ margin: "16px 0" }}>
        <Link to="/admin/pending-users" style={{ marginRight: 12 }}>
          View Pending Users
        </Link>
        {/* Later: /admin/suppliers, /admin/supermarkets, /admin/reports */}
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard title="Approved Users" value={summary?.totalUsers || 0} />
        <SummaryCard title="Pending Users" value={summary?.pendingUsers || 0} />
        <SummaryCard title="Suppliers" value={summary?.totalSuppliers || 0} />
        <SummaryCard title="Supermarkets" value={summary?.totalSupermarkets || 0} />
        <SummaryCard title="Total Orders" value={summary?.totalOrders || 0} />
      </div>

      {/* Orders chart */}
      <div style={{ height: 300, background: "#f7f7f7", padding: 16, borderRadius: 8 }}>
        <h3>Orders Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ordersData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div
    style={{
      padding: 16,
      borderRadius: 8,
      background: "#f5f5f5",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <div style={{ fontSize: 14, color: "#555" }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: "bold" }}>{value}</div>
  </div>
);

export default AdminDashboard;
