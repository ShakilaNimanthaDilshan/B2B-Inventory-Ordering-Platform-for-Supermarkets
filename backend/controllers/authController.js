// backend/controllers/authController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, district } = req.body;

    if (!name || !email || !password || !role || !district) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Block admin registration via API
    if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin registration is not allowed" });
    }

    if (!["supplier", "supermarket"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      district,        // ✅ SAVE DISTRICT
      isApproved: false,
    });

    res.status(201).json({
      message: "User registered successfully. Pending admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district, // ✅ RETURN DISTRICT
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (
      (user.role === "supplier" || user.role === "supermarket") &&
      !user.isApproved
    ) {
      return res
        .status(403)
        .json({ message: "Account pending admin approval" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district, // ✅ IMPORTANT
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
