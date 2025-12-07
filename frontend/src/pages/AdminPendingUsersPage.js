// frontend/src/pages/AdminPendingUsersPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminPendingUsersPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/pending-users");
      setPendingUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      await api.patch(`/admin/approve/${id}`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    }
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;
    try {
      await api.patch(`/admin/reject/${id}`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Users</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {pendingUsers.length === 0 && !loading && <p>No pending users.</p>}

      <ul>
        {pendingUsers.map((u) => (
          <li key={u._id} style={{ marginBottom: "10px" }}>
            <strong>{u.name}</strong> - {u.email} - {u.role}
            <div style={{ marginTop: "5px" }}>
              <button
                onClick={() => approveUser(u._id)}
                style={{ marginRight: "5px" }}
              >
                Approve
              </button>
              <button onClick={() => rejectUser(u._id)}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPendingUsersPage;
