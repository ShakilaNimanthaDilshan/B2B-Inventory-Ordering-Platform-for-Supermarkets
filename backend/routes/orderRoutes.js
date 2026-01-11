const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getSupplierOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

//  Supermarket: list own orders (MUST be before /:id)
router.get("/my", protect, authorizeRoles("supermarket"), getMyOrders);

//  Supplier: list incoming orders
router.get("/supplier", protect, authorizeRoles("supplier"), getSupplierOrders);

//  view order details
router.get("/:id", protect, getOrderById);

//  Supplier: update order status
router.patch("/:id/status", protect, authorizeRoles("supplier"), updateOrderStatus);

module.exports = router;
