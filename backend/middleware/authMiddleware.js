// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); //  ADD THIS

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("role district isActive");
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (user.isActive === false) {
        return res.status(403).json({ message: "Account deactivated. Contact admin." });
      }

      req.user = {
        id: user._id.toString(),
        role: user.role,
        district: user.district,
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// 🔒 Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access required" });
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  next();
};

module.exports = { protect, adminOnly, authorizeRoles };
