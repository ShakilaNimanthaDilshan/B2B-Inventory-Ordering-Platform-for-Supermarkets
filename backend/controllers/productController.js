// backend/controllers/productController.js
const Product = require("../models/Product");

// CREATE PRODUCT (supplier only)
const createProduct = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { name, description, price, category, stock } = body; // ✅ FIXED

    if (!name || price === undefined || price === "")
      return res.status(400).json({ message: "Name and price required" });

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock || 0),
      supplier: req.user.id,
      district: req.user.district,
    });

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// SUPPLIER: own products
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      supplier: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// SUPERMARKET: ONLY SAME DISTRICT PRODUCTS
const getAllProducts = async (req, res, next) => {
  try {
    const q = {
      isActive: true,
      district: req.user.district, // ✅ FILTER BY DISTRICT
    };

    if (req.query.category) q.category = req.query.category;

    const products = await Product.find(q)
      .populate("supplier", "name email district")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "supplier",
      "name email district"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ EXTRA SAFETY
    if (
      req.user.role === "supermarket" &&
      product.district !== req.user.district
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (
      product.supplier.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this product" });
    }

    const { name, description, price, category, stock, isActive } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (isActive !== undefined) product.isActive = isActive;

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (
      product.supplier.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    next(err);
  }
};

//dashboard-Stats
const dashboardStats = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    const totalProducts = await Product.countDocuments({ supplier: supplierId });

    const activeProducts = await Product.countDocuments({
      supplier: supplierId,
      isActive: true,
    });

    // low stock = stock <= 10 (same as frontend)
    const lowStock = await Product.countDocuments({
      supplier: supplierId,
      stock: { $lte: 10 },
    });

    res.json({ totalProducts, activeProducts, lowStock });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  dashboardStats,
};
