// backend/scripts/createAdmin.js
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const email = "admin@gmail.com"; // use this for login
    const password = "Admin@123"; // use this for login

    // Check if admin already exists
    let admin = await User.findOne({ email });
    if (admin) {
      console.log("Admin user already exists:");
      console.log(admin);
      process.exit(0);
    }

    // Create new admin user
    admin = await User.create({
      name: "System Admin",
      email,
      password,          // will be hashed by pre-save hook
      role: "admin",
      isApproved: true,  // so admin can login immediately
    });

    console.log("Admin user created successfully:");
    console.log({
      id: admin._id,
      email: admin.email,
      role: admin.role,
      isApproved: admin.isApproved,
    });

    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err.message);
    process.exit(1);
  }
};

run();
