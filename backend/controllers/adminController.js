// backend/controllers/adminController.js
const User = require("../models/User");

// GET /api/admin/pending-users
const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/approve/:userId
const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();

    res.json({
      message: "User approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/reject/:userId
// For simplicity: delete the user
const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot reject admin user from here" });
    }

    await user.deleteOne();
    res.json({ message: "User rejected and removed" });
  } catch (error) {
    next(error);
  }
};

// 📊 GET /api/admin/stats
// Dashboard analytics: counts
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSuppliers = await User.countDocuments({ role: "supplier" });
    const totalSupermarkets = await User.countDocuments({
      role: "supermarket",
    });
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const approvedUsers = await User.countDocuments({ isApproved: true });

    res.json({
      totalUsers,
      totalSuppliers,
      totalSupermarkets,
      pendingUsers,
      approvedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// 👥 GET /api/admin/users?role=supplier&status=approved
// Manage suppliers & supermarkets
const getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role && ["admin", "supplier", "supermarket"].includes(role)) {
      filter.role = role;
    }

    if (status === "pending") filter.isApproved = false;
    else if (status === "approved") filter.isApproved = true;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// 📄 GET /api/admin/users-report
// Simple CSV report of all users
const getUsersReport = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    let csv = "Name,Email,Role,Approved,Created At\n";

    users.forEach((u) => {
      csv += `"${u.name}","${u.email}",${u.role},${
        u.isApproved ? "Yes" : "No"
      },${u.createdAt.toISOString()}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("users-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  getStats,
  getUsers,
  getUsersReport,
};
