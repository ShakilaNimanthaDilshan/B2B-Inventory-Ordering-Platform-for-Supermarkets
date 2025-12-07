const mongoose = require("mongoose");

const supermarketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactEmail: String,
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supermarket", supermarketSchema);
