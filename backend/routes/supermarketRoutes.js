// backend/routes/supermarketRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getMyBuyers } = require("../controllers/supermarketController");

router.get("/buyers", protect, authorizeRoles("supplier"), getMyBuyers);

module.exports = router;
