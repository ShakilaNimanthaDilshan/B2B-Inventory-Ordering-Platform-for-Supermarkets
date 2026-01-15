const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * 1. Create Order (Supermarket)
 */
// backend/controllers/orderController.js - createOrder function ONLY

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, supplierId, deliveryAddress, note, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // ✅ Payment Logic: Card නම් කෙලින්ම Paid, නැත්නම් Pending
    let initialPaymentStatus = "Pending";
    if (paymentMethod === "Card") {
      initialPaymentStatus = "Paid";
    }

    const order = new Order({
      supermarket: req.user.id,
      supplier: supplierId,
      items: items.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      deliveryAddress,
      note,
      paymentMethod: paymentMethod || "Cash", // Default to Cash
      paymentStatus: initialPaymentStatus,    // Auto set to Paid or Pending
      status: "Pending",
      district: req.user.district,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order Create Error:", error); // Terminal එකේ Error එක පෙන්නන්න
    res.status(500).json({ message: error.message });
  }
};

/**
 * 2. Get My Orders (Supermarket)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ supermarket: req.user.id })
      .populate("supplier", "name email district")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 3. Get Supplier Orders
 */
const getSupplierOrders = async (req, res) => {
  try {
    const query = { supplier: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate("supermarket", "name email district")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 4. Get Order By ID (Access Controlled)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("supermarket", "name email district address")
      .populate("supplier", "name email district")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role === "supplier" &&
      order.supplier.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "supermarket" &&
      order.supermarket.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 5. Update Order Status (Supplier Only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "approved", "rejected", "dispatched", "delivered"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const flow = {
      pending: ["approved", "rejected"],
      approved: ["dispatched"],
      rejected: [],
      dispatched: ["delivered"],
      delivered: [],
    };

    if (!flow[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * EXPORTS
 */
module.exports = {
  createOrder,
  getMyOrders,
  getSupplierOrders,
  getOrderById,
  updateOrderStatus,
};
