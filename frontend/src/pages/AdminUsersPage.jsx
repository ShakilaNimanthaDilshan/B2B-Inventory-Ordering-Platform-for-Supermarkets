// frontend/src/pages/AdminUsersPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminUsersPage = () => {
  const [roleFilter, setRoleFilter] = useState("supplier");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/admin/users", { params });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [roleFilter, statusFilter]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Suppliers & Supermarkets</h2>

      <div style={{ margin: "15px 0", display: "flex", gap: "10px" }}>
        <div>
          <label>Role: </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="supplier">Supplier</option>
            <option value="supermarket">Supermarket</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label>Status: </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="all">All</option>
          </select>
        </div>

        <button onClick={fetchUsers}>Refresh</button>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && users.length === 0 && <p>No users found.</p>}

      {users.length > 0 && (
        <table
          style={{
            marginTop: "10px",
            borderCollapse: "collapse",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Email
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Role</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Approved
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {u.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {u.email}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {u.role}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {u.isApproved ? "Yes" : "No"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {new Date(u.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
