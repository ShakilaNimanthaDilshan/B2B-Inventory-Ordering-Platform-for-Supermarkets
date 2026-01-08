// backend/controllers/supermarketController.js
const Order = require("../models/Order");

// GET /api/supermarkets/buyers  (Supplier only)
const getMyBuyers = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    // Orders වලින් buyers (supermarkets) list එක aggregate කරගන්නවා
    const buyers = await Order.aggregate([
      { $match: { supplier: require("mongoose").Types.ObjectId.createFromHexString(supplierId) } },
      {
        $group: {
          _id: "$supermarket",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "supermarket",
        },
      },
      { $unwind: "$supermarket" },
      {
        $project: {
          supermarketId: "$supermarket._id",
          name: "$supermarket.name",
          contactEmail: "$supermarket.email",
          district: "$supermarket.district",
          totalOrders: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(buyers);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyBuyers };
