const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSupplierOrders } = require("../controllers/orderController");

// GET /api/orders/supplier
router.get(
  "/supplier",
  protect,
  authorizeRoles("supplier"),
  getSupplierOrders
);

module.exports = router;
