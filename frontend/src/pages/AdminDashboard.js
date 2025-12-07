// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPending = async () => {
    const res = await api.get("/admin/pending-users");
    setPendingUsers(res.data);
  };

  const approveUser = async (id) => {
    await api.patch(`/admin/approve/${id}`);
    fetchPending();
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Pending Users</h3>
      <ul>
        {pendingUsers.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email} - {u.role}
            <button onClick={() => approveUser(u._id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
