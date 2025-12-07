import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingUsers from "./pages/admin/PendingUsers";

function App() {
  return (
    <Router>
      <Routes>
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
