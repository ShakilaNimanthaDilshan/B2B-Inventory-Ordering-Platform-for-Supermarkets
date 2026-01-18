// frontend/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingUsersPage from "./pages/AdminPendingUsersPage";
import AdminUsersPage from "./pages/AdminUsersPage";

// ✅ Supplier Pages (Updated Paths based on Folder Structure)
import SupplierDashboard from "./pages/supplier/DashboardPage/SupplierDashboard";
import SupplierOrders from "./pages/supplier/OrderPage/SupplierOrders";
import ViewProducts from "./pages/supplier/ProductPage/ViewProducts";
import SupplierBuyers from "./pages/supplier/SupplierBuyers/SupplierBuyers";

// ✅ Supermarket Pages (Updated Paths based on Folder Structure)
import SupermarketDashboard from "./pages/supermarket/SupermarketDashboard";
import SupermarketMyOrders from "./pages/supermarket/SupermarketMyOrders"; // අලුත් Page එක

// Layout to hide Navbar for specific roles if needed, 
// currently used for general pages
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Routes with Navbar --- */}
          <Route element={<MainLayout />}>
            
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingApprovalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 🔐 Admin-only routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/pending-users" element={<AdminPendingUsersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* 🔐 Supermarket-only routes */}
            <Route element={<PrivateRoute allowedRoles={["supermarket"]} />}>
              {/* Dashboard */}
              <Route path="/supermarket/dashboard" element={<SupermarketDashboard />} />
              {/* ✅ New: My Orders & Invoice Tracking */}
              <Route path="/supermarket/my-orders" element={<SupermarketMyOrders />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Route>

          {/* ---------- SUPPLIER AREA (NO NAVBAR / Custom Sidebar) ---------- */}
          <Route element={<PrivateRoute allowedRoles={["supplier"]} />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/products" element={<ViewProducts />} />
            <Route path="/supplier/orders" element={<SupplierOrders />} />
            <Route path="/supplier/supermarkets" element={<SupplierBuyers />} />
          </Route>

        </Routes>
      </Router>
      
      <Footer />
    </AuthProvider>
  );
};

export default App;