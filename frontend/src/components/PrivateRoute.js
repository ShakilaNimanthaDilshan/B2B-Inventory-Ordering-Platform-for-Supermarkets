// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Forbidden: You are not allowed to view this page.</div>;
  }

  // If supplier/supermarket but not approved
  if (
    (user.role === "supplier" || user.role === "supermarket") &&
    !user.isApproved
  ) {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
