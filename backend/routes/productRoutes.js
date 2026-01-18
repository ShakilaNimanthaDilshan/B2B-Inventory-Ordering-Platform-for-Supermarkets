const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  dashboardStats,
} = require("../controllers/productController");

// ==========================================
// SPECIFIC ROUTES (MUST BE AT THE TOP)
// ==========================================

// 1. Supplier Dashboard Stats
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("supplier"),
  dashboardStats
);

// 2. Supplier: Create Product
router.post(
  "/",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"),
  createProduct
);

// 3. Supplier: Get Own Products
router.get(
  "/my-products",
  protect,
  authorizeRoles("supplier"),
  getMyProducts
);

// 4. Supermarket: Get All Products (by district)
router.get(
  "/",
  protect,
  authorizeRoles("supermarket"),
  getAllProducts
);

// ==========================================
// DYNAMIC ROUTES (MUST BE AT THE BOTTOM)
// ==========================================

// 5. Get Product by ID
router.get("/:id", protect, getProductById);

// 6. Update Product (Supplier only)
router.patch(
  "/:id",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"),
  updateProduct
);

// 7. Delete Product (Supplier only)
router.delete(
  "/:id",
  protect,
  authorizeRoles("supplier"),
  deleteProduct
);

module.exports = router;
