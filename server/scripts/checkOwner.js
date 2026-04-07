require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all users
    const users = await User.find();
    console.log(`📊 Total users in database: ${users.length}\n`);

    if (users.length === 0) {
      console.log("❌ No users found in the database!");
      console.log("Please run: node scripts/createOwner.js\n");
      process.exit(1);
    }

    console.log("👥 Users found:");
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.active}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Check specifically for owner
    const owner = await User.findOne({ username: "owner" });
    if (owner) {
      console.log("\n✅ Owner account exists!");
      console.log(`   Name: ${owner.name}`);
      console.log(`   Username: ${owner.username}`);
      console.log(`   Role: ${owner.role}`);
      console.log(`   Active: ${owner.active}`);
      
      // Test password
      const testPassword = "owner123";
      const isMatch = await owner.comparePassword(testPassword);
      console.log(`\n🔑 Password test (owner123): ${isMatch ? "✅ CORRECT" : "❌ WRONG"}`);
    } else {
      console.log("\n❌ Owner account not found!");
      console.log("Please run: node scripts/createOwner.js\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkOwner();
