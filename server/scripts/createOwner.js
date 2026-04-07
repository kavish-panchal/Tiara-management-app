require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createOwner = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    // Check if owner already exists
    const ownerExists = await User.findOne({ role: "owner" });

    if (ownerExists) {
      console.log("Owner account already exists:");
      console.log(`Username: ${ownerExists.username}`);
      console.log(`Name: ${ownerExists.name}`);
      process.exit(0);
    }

    // Create owner account
    const owner = await User.create({
      name: "Owner",
      username: "owner",
      password: "owner123",
      role: "owner",
    });

    console.log("Owner account created successfully!");
    console.log(`Username: ${owner.username}`);
    console.log(`Password: owner123`);
    console.log(
      "\n⚠️  IMPORTANT: Please change the password after first login!",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createOwner();
