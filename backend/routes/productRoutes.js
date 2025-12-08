// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); // multer

const {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");



// GET /api/products        → list all active products (for supermarkets)
router.get("/", getAllProducts);



// GET /api/products/my-products       supplier's own products
router.get(
  "/my-products",
  protect,
  authorizeRoles("supplier"),
  getMyProducts
);

// GET /api/products/:id               get single product by id (public)
router.get("/:id", getProductById);

// POST /api/products                  create product (with image, supplier only)
router.post(
  "/",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"),
  createProduct
);

// PATCH /api/products/:id             update product (supplier owner or admin)
router.patch(
  "/:id",
  protect,
  authorizeRoles("supplier", "admin"),
  upload.single("image"),
  updateProduct
);

// DELETE /api/products/:id           delete product (supplier owner or admin)
router.delete(
  "/:id",
  protect,
  authorizeRoles("supplier", "admin"),
  deleteProduct
);

module.exports = router;
