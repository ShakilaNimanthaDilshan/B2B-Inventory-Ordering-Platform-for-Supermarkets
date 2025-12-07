const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Supplier = require("../models/Supplier");
const Supermarket = require("../models/Supermarket");
const Order = require("../models/Order");

/* =============== USER APPROVAL =============== */

// GET all pending users
router.get("/users/pending", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ status: "pending" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching pending users:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// APPROVE user
router.patch("/users/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User approved", user });
  } catch (err) {
    console.error("Approve user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// REJECT user
router.patch("/users/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User rejected", user });
  } catch (err) {
    console.error("Reject user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============== SUPPLIER MANAGEMENT =============== */

// CREATE supplier
router.post("/suppliers", protect, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    console.error("Create supplier error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all suppliers
router.get("/suppliers", protect, adminOnly, async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    console.error("Get suppliers error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE supplier
router.put("/suppliers/:id", protect, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.json(supplier);
  } catch (err) {
    console.error("Update supplier error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE supplier
router.delete("/suppliers/:id", protect, adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.json({ message: "Supplier deleted" });
  } catch (err) {
    console.error("Delete supplier error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============== SUPERMARKET MANAGEMENT =============== */

router.post("/supermarkets", protect, adminOnly, async (req, res) => {
  try {
    const supermarket = await Supermarket.create(req.body);
    res.status(201).json(supermarket);
  } catch (err) {
    console.error("Create supermarket error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/supermarkets", protect, adminOnly, async (req, res) => {
  try {
    const supermarkets = await Supermarket.find();
    res.json(supermarkets);
  } catch (err) {
    console.error("Get supermarkets error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/supermarkets/:id", protect, adminOnly, async (req, res) => {
  try {
    const supermarket = await Supermarket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!supermarket)
      return res.status(404).json({ message: "Supermarket not found" });

    res.json(supermarket);
  } catch (err) {
    console.error("Update supermarket error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/supermarkets/:id", protect, adminOnly, async (req, res) => {
  try {
    const supermarket = await Supermarket.findByIdAndDelete(req.params.id);
    if (!supermarket)
      return res.status(404).json({ message: "Supermarket not found" });

    res.json({ message: "Supermarket deleted" });
  } catch (err) {
    console.error("Delete supermarket error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============== DASHBOARD SUMMARY =============== */

router.get("/dashboard/summary", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ status: "approved" });
    const pendingUsers = await User.countDocuments({ status: "pending" });
    const totalSuppliers = await Supplier.countDocuments();
    const totalSupermarkets = await Supermarket.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      totalUsers,
      pendingUsers,
      totalSuppliers,
      totalSupermarkets,
      totalOrders,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============== REPORTS =============== */

router.get("/reports/orders", protect, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter)
      .populate("supermarket", "name")
      .populate("supplier", "name");

    res.json(orders);
  } catch (err) {
    console.error("Orders report error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
