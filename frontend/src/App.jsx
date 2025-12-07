import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingUsers from "./pages/admin/PendingUsers";
// import Login from "./pages/auth/Login"; // your existing login
// import Home from "./pages/Home";        // your home page

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pending-users"
          element={
            <AdminRoute>
              <PendingUsers />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
