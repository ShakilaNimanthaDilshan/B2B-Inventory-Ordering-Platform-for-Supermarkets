// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingUsersPage from "./pages/AdminPendingUsersPage";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupermarketDashboard from "./pages/SupermarketDashboard";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AddProduct from "./pages/supplier/AddProduct";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending" element={<PendingApprovalPage />} />

          {/* 🔐 Admin-only routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/pending-users"
              element={<AdminPendingUsersPage />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          {/* 🔐 Supplier-only */}
          <Route element={<PrivateRoute allowedRoles={["supplier"]} />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/add-product" element={<AddProduct />} />
          </Route>

          {/* 🔐 Supermarket-only */}
          <Route element={<PrivateRoute allowedRoles={["supermarket"]} />}>
            <Route
              path="/supermarket/dashboard"
              element={<SupermarketDashboard />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
