// backend/controllers/adminController.js
const User = require("../models/User");

// 🔍 GET /api/admin/pending-users
const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// ✅ PATCH /api/admin/approve/:userId
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
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ❌ PATCH /api/admin/reject/:userId
// Reject = delete user
const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot reject admin user" });
    }

    await user.deleteOne();
    res.json({ message: "User rejected and removed" });
  } catch (error) {
    next(error);
  }
};

// 🚫 PATCH /api/admin/deactivate/:id
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin cannot be deactivated" });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: "User access removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove user access" });
  }
};

// ♻️ PATCH /api/admin/activate/:id
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: "User re-activated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate user" });
  }
};

// 📊 GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSuppliers = await User.countDocuments({ role: "supplier" });
    const totalSupermarkets = await User.countDocuments({ role: "supermarket" });
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.json({
      totalUsers,
      totalSuppliers,
      totalSupermarkets,
      pendingUsers,
      approvedUsers,
      activeUsers,
      inactiveUsers,
    });
  } catch (error) {
    next(error);
  }
};

// 👥 GET /api/admin/users?role=supplier&status=approved
const getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role && ["admin", "supplier", "supermarket"].includes(role)) {
      filter.role = role;
    }

    if (status === "pending") filter.isApproved = false;
    else if (status === "approved") filter.isApproved = true;
    else if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// 📄 GET /api/admin/users-report
const getUsersReport = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    let csv = "Name,Email,Role,Approved,Active,Created At\n";

    users.forEach((u) => {
      csv += `"${u.name}","${u.email}",${u.role},${
        u.isApproved ? "Yes" : "No"
      },${u.isActive ? "Yes" : "No"},${u.createdAt.toISOString()}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("users-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// 🚀 EXPORTS
module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  activateUser,
  getStats,
  getUsers,
  getUsersReport,
};
