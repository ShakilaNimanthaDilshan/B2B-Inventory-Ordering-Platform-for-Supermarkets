// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getStats,
  getUsers,
  getUsersReport,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All /api/admin/* are admin-only
router.use(protect, authorizeRoles("admin"));

// 📊 Dashboard stats
router.get("/stats", getStats);

// Pending users
router.get("/pending-users", getPendingUsers);

// Approve / Reject
router.patch("/approve/:userId", approveUser);
router.patch("/reject/:userId", rejectUser);

// Manage users: ?role=supplier&status=approved
router.get("/users", getUsers);

// CSV report
router.get("/users-report", getUsersReport);

module.exports = router;
