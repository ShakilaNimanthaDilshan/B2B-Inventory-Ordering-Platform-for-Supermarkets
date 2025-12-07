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

    // extra safety: don't allow rejecting admin
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

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
};
