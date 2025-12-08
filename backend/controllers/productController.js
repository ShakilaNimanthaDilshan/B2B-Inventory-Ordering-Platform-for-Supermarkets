// backend/controllers/productController.js
const Product = require("../models/Product");

// POST /api/products/        (supplier only) - multipart/form-data (image)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price required" });

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock || 0),
      supplier: req.user.id,
    });

    if (req.file) {
      // store relative path so frontend can request /uploads/...
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/my-products (supplier only) - list supplier's products
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ supplier: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/        (public) - list all active products (for supermarkets)
const getAllProducts = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.category) q.category = req.query.category;
    if (req.query.supplier) q.supplier = req.query.supplier;
    q.isActive = true;
    const products = await Product.find(q).populate("supplier", "name email").sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id     (public)
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplier", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id   (supplier only, only owner OR admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // only supplier owner or admin can edit
    if (product.supplier.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this product" });
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

// DELETE /api/products/:id  (supplier only, only owner OR admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.supplier.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
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
};
