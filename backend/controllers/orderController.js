const mongoose = require("mongoose");
const Order = require("../models/Order");


//  Supplier: list incoming orders
const getSupplierOrders = async (req, res, next) => {
  try {
    const q = { supplier: req.user.id };

    // optional filters
    if (req.query.status) q.status = req.query.status;

    // optional search by supermarket name/email (simple way: populate + filter in frontend)
    const orders = await Order.find(q)
      .populate("supermarket", "name email district")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

//  Order details (supplier only sees their own, supermarket only sees theirs)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid order id" });

    const order = await Order.findById(id)
      .populate("supermarket", "name email district address")
      .populate("supplier", "name email district")
      .populate("items.product", "name price image");

    if (!order) return res.status(404).json({ message: "Order not found" });

    //  Access control
    if (req.user.role === "supplier" && order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (req.user.role === "supermarket" && order.supermarket.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

//  Supplier: update status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ["pending", "approved", "rejected", "dispatched", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only supplier who owns it can update
    if (order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //  simple flow rules 
    const flow = {
      pending: ["approved", "rejected"],
      approved: ["dispatched"],
      rejected: [],
      dispatched: ["delivered"],
      delivered: [],
    };

    const current = order.status;
    if (!flow[current].includes(status) && status !== current) {
      return res.status(400).json({
        message: `Cannot change status from ${current} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ supermarket: req.user.id })
      .populate("supplier", "name email district")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getSupplierOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
 
};
