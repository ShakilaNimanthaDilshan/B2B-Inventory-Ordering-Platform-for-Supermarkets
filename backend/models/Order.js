const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    supermarket: { type: mongoose.Schema.Types.ObjectId, ref: "Supermarket" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
