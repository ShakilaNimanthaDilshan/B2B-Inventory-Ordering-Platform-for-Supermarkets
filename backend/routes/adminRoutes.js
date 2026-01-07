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

// ✅ STEP 3 — Correct middleware imports
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ===============================
// 📊 Dashboard stats
// ===============================
router.get("/stats", protect, adminOnly, getStats);

// ===============================
// ⏳ Pending users
// ===============================
router.get("/pending-users", protect, adminOnly, getPendingUsers);

// ===============================
// ✅ Approve / ❌ Reject users
// ===============================
router.patch("/approve/:userId", protect, adminOnly, approveUser);
router.patch("/reject/:userId", protect, adminOnly, rejectUser);

// ===============================
// 👥 Manage users
// ===============================
router.get("/users", protect, adminOnly, getUsers);

// ===============================
// 🚫 Deactivate user
// ===============================
router.put(
  "/users/:id/deactivate",
  protect,
  adminOnly,
  deactivateUser
);

// ===============================
// ♻️ Activate user
// ===============================
router.put(
  "/users/:id/activate",
  protect,
  adminOnly,
  activateUser
);

// ===============================
// 📄 CSV report
// ===============================
router.get("/users-report", protect, adminOnly, getUsersReport);

module.exports = router;
