// backend/routes/productRoutes.js
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

// SUPERMARKET: get products (district filtered)
router.get("/", protect, authorizeRoles("supermarket"), getAllProducts);

// SUPPLIER: create product
// SUPPLIER: create product
router.post(
  "/",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"),
  createProduct
);

// SUPPLIER: own products
router.get("/my-products", protect, authorizeRoles("supplier"), getMyProducts);

//stats
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("supplier"),
  dashboardStats
);

// GET product by ID
router.get("/:id", protect, getProductById);


// UPDATE product
router.patch(
  "/:id",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"),
  updateProduct
);

// DELETE product
router.delete("/:id", protect, deleteProduct);



module.exports = router;
