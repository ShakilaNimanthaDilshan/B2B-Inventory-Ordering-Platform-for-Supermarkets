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
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingUsersPage from "./pages/AdminPendingUsersPage";
import SupplierDashboard from "./pages/supplier/DashboardPage/SupplierDashboard";
import SupermarketDashboard from "./pages/SupermarketDashboard";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import SupplierOrders from "./pages/supplier/OrderPage/SupplierOrders";

import ViewProducts from "./pages/supplier/ProductPage/ViewProducts
import SupplierBuyers from "./pages/supplier/SupplierBuyers/SupplierBuyers";

// ...
<Route path="/supplier/supermarkets" element={<SupplierBuyers />} />


//This USe to Hide Navigation bar for tha page that dosent need it
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
          {/*Routes with Navbar---*/}
          <Route element={<MainLayout />}>
            
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

           

            {/* 🔐 Supermarket-only */}
            <Route element={<PrivateRoute allowedRoles={["supermarket"]} />}>
              <Route
                path="/supermarket/dashboard"
                element={<SupermarketDashboard />}
              />
            </Route>

            {/* Fallback (with navbar) */}
            <Route path="*" element={<HomePage />} />
          </Route>

          {/* ---------- SUPPLIER AREA (NO NAVBAR) ---------- */}
          <Route element={<PrivateRoute allowedRoles={["supplier"]} />}>
            <Route
              path="/supplier/dashboard"
              element={<SupplierDashboard />}
            />
            
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
