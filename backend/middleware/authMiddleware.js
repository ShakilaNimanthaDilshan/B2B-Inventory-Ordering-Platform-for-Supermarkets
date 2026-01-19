// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 Protect middleware (JWT verify + load user)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get token
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Fetch user from DB
      const user = await User.findById(decoded.id).select(
        "role district isActive"
      );

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (user.isActive === false) {
        return res
          .status(403)
          .json({ message: "Account deactivated. Contact admin." });
      }

      // 4. Attach user to request
      req.user = {
        id: user._id.toString(),
        role: user.role,
        district: user.district,
      };

      next();
    } catch (error) {
      // ✅ IMPORTANT FIX: handle expired token clearly
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Session expired. Please login again.",
        });
      }

      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// 🔒 Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access required" });
};

// 🎭 Role-based authorization
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  authorizeRoles,
};
