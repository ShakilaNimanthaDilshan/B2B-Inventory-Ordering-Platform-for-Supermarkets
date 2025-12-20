// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//image upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

//product routes
app.use("/api/products", productRoutes);

//FOR INCOMING ORDER
app.use("/api/orders", orderRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
