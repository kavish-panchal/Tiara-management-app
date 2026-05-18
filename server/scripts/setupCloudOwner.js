require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const setupCloudOwner = async () => {
  try {
    // Check if URI is provided
    if (!process.env.MONGODB_URI) {
      console.log("❌ MONGODB_URI is not set in your .env file!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas\n");

    const username = "owner";
    const password = "owner123";

    // Check if owner already exists
    let owner = await User.findOne({ username });

    if (owner) {
      console.log(`✅ Owner account already exists (@${owner.username})`);
      
      // Update password just to be sure it matches what we expect
      owner.password = password; // The pre-save hook will hash it
      await owner.save();
      console.log("✅ Owner password reset to default: owner123\n");
    } else {
      console.log("Creating new owner account...");
      
      // Create new owner
      owner = await User.create({
        name: "Owner",
        username: username,
        password: password,
        role: "owner",
        active: true
      });
      
      console.log(`✅ Owner account created! (@${owner.username})\n`);
    }

    console.log("=========================================");
    console.log("🔐 CLOUD LOGIN CREDENTIALS:");
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

setupCloudOwner();
