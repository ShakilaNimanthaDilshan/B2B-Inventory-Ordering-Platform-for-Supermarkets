const mongoose = require("mongoose");
const Order = require("../models/Order");
const Supermarket = require("../models/Supermarket");

// GET /api/supermarkets/buyers  (supplier)
const getSupplierBuyers = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    const rows = await Order.aggregate([
      { $match: { supplier: new mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: "$supermarket",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const supermarketIds = rows.map((r) => r._id);

    const markets = await Supermarket.find({ _id: { $in: supermarketIds } })
      .select("name contactEmail address");

    const map = new Map(markets.map((m) => [m._id.toString(), m]));

    const result = rows.map((r) => {
      const sm = map.get(r._id.toString());
      return {
        supermarketId: r._id,
        name: sm?.name || "Unknown",
        contactEmail: sm?.contactEmail || "",
        address: sm?.address || "",
        totalOrders: r.totalOrders,
        totalRevenue: r.totalRevenue,
        lastOrderDate: r.lastOrderDate,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSupplierBuyers };
