const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactEmail: String,
    contactPhone: String,
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
