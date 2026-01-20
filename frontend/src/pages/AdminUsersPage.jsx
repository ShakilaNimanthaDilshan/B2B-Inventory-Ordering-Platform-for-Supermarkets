import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminUsersPage = () => {
  const [roleFilter, setRoleFilter] = useState("supplier");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔄 Fetch users
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

  // 🚫 Deactivate user (soft remove)
  const handleDeactivate = async (userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this user's access?"
    );
    if (!confirmRemove) return;

    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      alert("User access removed successfully");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  // ♻️ Activate user
  const handleActivate = async (userId) => {
    const confirmActivate = window.confirm(
      "Are you sure you want to re-activate this user?"
    );
    if (!confirmActivate) return;

    try {
      await api.put(`/admin/users/${userId}/activate`);
      alert("User re-activated successfully");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to activate user");
    }
  };

  // ❌❌ PERMANENT DELETE (NEW)
  const handlePermanentDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "⚠️ WARNING!\n\nThis will PERMANENTLY delete the user.\nThis action CANNOT be undone.\n\nDo you want to continue?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/users/${userId}/permanent`);
      alert("User permanently deleted");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to permanently delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [roleFilter, statusFilter]);

  return (
    <div className="admin-page">
      <h2 className="admin-header-title">Manage Suppliers & Supermarkets</h2>
      <p className="admin-header-subtitle">
        View, deactivate, reactivate, or permanently delete system users.
      </p>

      {/* Filters */}
      <div className="admin-filter-row">
        <div>
          <label>Role:</label>
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
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="all">All</option>
          </select>
        </div>

        <button className="btn" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && users.length === 0 && (
        <p className="admin-text-muted">No users found.</p>
      )}

      {users.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Approved</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isApproved ? "Yes" : "No"}</td>

                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>

                  <td>{new Date(u.createdAt).toLocaleString()}</td>

                  <td>
                    {/* Prevent actions on admins */}
                    {u.role !== "admin" && (
                      <>
                        {u.isActive ? (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeactivate(u._id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            className="btn btn-success"
                            onClick={() => handleActivate(u._id)}
                          >
                            Reactivate
                          </button>
                        )}

                        {/* 🔥 Permanent delete */}
                        <button
                          className="btn btn-danger"
                          style={{ marginLeft: "8px", backgroundColor: "#b00020" }}
                          onClick={() => handlePermanentDelete(u._id)}
                        >
                          Delete Permanently
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
