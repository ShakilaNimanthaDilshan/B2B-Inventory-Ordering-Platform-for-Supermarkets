const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    supermarket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },   // snapshot
        qty: { type: Number, required: true },
        price: { type: Number, required: true },  // snapshot (unit price)
        lineTotal: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "dispatched", "delivered"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["credit", "cod", "bank"],
      default: "credit",
    },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
