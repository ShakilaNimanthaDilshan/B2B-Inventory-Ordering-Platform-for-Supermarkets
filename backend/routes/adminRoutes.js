// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  getPendingUsers,
  approveUser,
  rejectUser,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/admin/pending-users
router.get(
  "/pending-users",
  protect,
  authorizeRoles("admin"),
  getPendingUsers
);

// PATCH /api/admin/approve/:userId
router.patch(
  "/approve/:userId",
  protect,
  authorizeRoles("admin"),
  approveUser
);

// PATCH /api/admin/reject/:userId
router.patch(
  "/reject/:userId",
  protect,
  authorizeRoles("admin"),
  rejectUser
);

module.exports = router;
