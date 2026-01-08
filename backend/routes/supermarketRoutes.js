const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSupplierBuyers } = require("../controllers/supermarketController");

router.get("/buyers", protect, authorizeRoles("supplier"), getSupplierBuyers);

module.exports = router;
