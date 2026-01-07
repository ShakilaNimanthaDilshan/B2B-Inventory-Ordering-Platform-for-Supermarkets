const User = require("../models/User");

/* =========================
   GET PENDING USERS
========================= */
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("getPendingUsers error:", error);
    res.status(500).json({ message: "Failed to load pending users" });
  }
};

/* =========================
   APPROVE USER
========================= */
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = true;
    user.isActive = true;

    // ⚠️ approve is part of onboarding → validation is OK here
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
    console.error("approveUser error:", error);
    res.status(500).json({ message: "Failed to approve user" });
  }
};

/* =========================
   REJECT USER (DELETE)
========================= */
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot reject admin user" });
    }

    await user.deleteOne();
    res.json({ message: "User rejected and removed" });
  } catch (error) {
    console.error("rejectUser error:", error);
    res.status(500).json({ message: "Failed to reject user" });
  }
};

/* =========================
   DEACTIVATE USER ✅ FIXED
========================= */
const deactivateUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Admin cannot be deactivated" });
    }

    // ✅ IMPORTANT FIX: bypass validation
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isActive: false } }
    );

    res.json({ message: "User access removed successfully" });
  } catch (error) {
    console.error("deactivateUser error:", error);
    res.status(500).json({ message: "Failed to remove user access" });
  }
};

/* =========================
   ACTIVATE USER ✅ FIXED
========================= */
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ IMPORTANT FIX: bypass validation
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isActive: true } }
    );

    res.json({ message: "User re-activated successfully" });
  } catch (error) {
    console.error("activateUser error:", error);
    res.status(500).json({ message: "Failed to activate user" });
  }
};

/* =========================
   DASHBOARD STATS
========================= */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSuppliers = await User.countDocuments({ role: "supplier" });
    const totalSupermarkets = await User.countDocuments({
      role: "supermarket",
    });
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
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

/* =========================
   GET USERS (FILTERABLE)
========================= */
const getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role && ["admin", "supplier", "supermarket"].includes(role)) {
      filter.role = role;
    }

    if (status === "pending") filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
};

/* =========================
   USERS CSV REPORT
========================= */
const getUsersReport = async (req, res) => {
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
    console.error("getUsersReport error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

/* =========================
   EXPORTS
========================= */
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
