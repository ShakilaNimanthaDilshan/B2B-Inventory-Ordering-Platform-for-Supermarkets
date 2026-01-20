// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const supermarketRoutes = require("./routes/supermarketRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// ===============================
// GLOBAL MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// STATIC FILES (Image uploads)
// ===============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // ✅ VERY IMPORTANT (CORRECT)
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/supermarkets", supermarketRoutes);
app.use("/api/reports", reportRoutes);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ===============================
// ERROR HANDLER (LAST)
// ===============================
app.use(errorHandler);

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
