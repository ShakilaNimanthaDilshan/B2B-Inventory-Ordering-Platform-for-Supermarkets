// frontend/src/pages/PendingApprovalPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const PendingApprovalPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Account Pending Approval</h2>
      <p>
        Your account has been created and is waiting for admin approval.
        <br />
        Once the admin approves your account, you can log in and access your
        dashboard.
      </p>
      <p style={{ marginTop: "10px" }}>
        If you recently received approval, please{" "}
        <Link to="/login">click here to login</Link>.
      </p>
    </div>
  );
};

export default PendingApprovalPage;
