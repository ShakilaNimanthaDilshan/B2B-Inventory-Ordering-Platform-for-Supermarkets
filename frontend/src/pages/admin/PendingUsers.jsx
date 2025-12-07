import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("/admin/users/pending");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch pending users error:", err);
      alert("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/approve`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/reject`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject user");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading pending users...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Pending Users</h1>
      {users.length === 0 ? (
        <p>No pending users 🎉</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.role}</td>
                <td style={tdStyle}>
                  <button style={btnApprove} onClick={() => handleApprove(u._id)}>
                    Approve
                  </button>
                  <button style={btnReject} onClick={() => handleReject(u._id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  padding: "8px",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

const btnApprove = {
  marginRight: 8,
  padding: "4px 8px",
  background: "green",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const btnReject = {
  padding: "4px 8px",
  background: "red",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

export default PendingUsers;
