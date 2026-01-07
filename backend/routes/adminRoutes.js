// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  activateUser,
  getStats,
  getUsers,
  getUsersReport,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 🔒 All /api/admin/* routes are ADMIN only
router.use(protect, authorizeRoles("admin"));

// 📊 Dashboard stats
router.get("/stats", getStats);

// ⏳ Pending users
router.get("/pending-users", getPendingUsers);

// ✅ Approve / ❌ Reject users
router.patch("/approve/:userId", approveUser);
router.patch("/reject/:userId", rejectUser);

// 👥 Manage users: ?role=supplier&status=approved&status=active
router.get("/users", getUsers);

// 🚫 Deactivate user
router.put("/users/:id/deactivate", deactivateUser);

// ♻️ Activate user
router.put("/users/:id/activate", activateUser);

// 📄 CSV report
router.get("/users-report", getUsersReport);

module.exports = router;
