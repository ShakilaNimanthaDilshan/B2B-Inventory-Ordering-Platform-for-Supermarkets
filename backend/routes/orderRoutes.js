const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createOrder,

  getSupplierOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");


// 1. Supermarket: Create Order (මෙන්න මේක තමයි අලුතින් දැම්මේ)
router.post("/", protect, authorizeRoles("supermarket"), createOrder);

// 2. Supermarket: List own orders
router.get("/my", protect, authorizeRoles("supermarket"), getMyOrders);

// 3. Supplier: List incoming orders
router.get("/supplier", protect, authorizeRoles("supplier"), getSupplierOrders);

// 4. Common: View order details
router.get("/:id", protect, getOrderById);

// 5. Supplier: Update order status
//  Supermarket: list own orders (MUST be before /:id)
router.get("/my", protect, authorizeRoles("supermarket"), getMyOrders);

//  Supplier: list incoming orders
router.get("/supplier", protect, authorizeRoles("supplier"), getSupplierOrders);

//  view order details
router.get("/:id", protect, getOrderById);

//  Supplier: update order status
router.patch("/:id/status", protect, authorizeRoles("supplier"), updateOrderStatus);

module.exports = router;