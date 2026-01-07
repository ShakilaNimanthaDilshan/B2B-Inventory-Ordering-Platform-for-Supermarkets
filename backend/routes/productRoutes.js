// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// SUPERMARKET: get products (district filtered)
router.get("/", protect, authorizeRoles("supermarket"), getAllProducts);

// SUPPLIER: create product
router.post("/", protect, authorizeRoles("supplier"), createProduct);

// SUPPLIER: own products
router.get(
  "/my-products",
  protect,
  authorizeRoles("supplier"),
  getMyProducts
);

// GET product by ID
router.get("/:id", protect, getProductById);

// UPDATE product
router.patch("/:id", protect, updateProduct);

// DELETE product
router.delete("/:id", protect, deleteProduct);

module.exports = router;
