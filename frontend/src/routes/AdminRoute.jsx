import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const userJson = localStorage.getItem("user");

  if (!userJson) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
