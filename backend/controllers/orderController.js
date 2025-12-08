
const Order = require("../models/Order");

const getSupplierOrders = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    const orders = await Order.find({ supplier: supplierId })
      .populate("supermarket", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSupplierOrders };
