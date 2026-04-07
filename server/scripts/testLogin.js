require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const username = "owner";
    const password = "owner123";

    console.log("🔑 Testing login with:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}\n`);

    // Step 1: Find user
    console.log("Step 1: Finding user...");
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }
    console.log(`✅ User found: ${user.name} (@${user.username})\n`);

    // Step 2: Check if active
    console.log("Step 2: Checking if user is active...");
    if (!user.active) {
      console.log("❌ User account is inactive!");
      process.exit(1);
    }
    console.log("✅ User is active\n");

    // Step 3: Verify password
    console.log("Step 3: Verifying password...");
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      console.log("❌ Password is incorrect!");
      process.exit(1);
    }
    console.log("✅ Password is correct\n");

    // Step 4: Create response
    console.log("Step 4: Creating login response...");
    const response = {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      token: user._id.toString(),
    };
    
    console.log("✅ Login response:");
    console.log(JSON.stringify(response, null, 2));

    console.log("\n✅ Login test SUCCESSFUL!");
    console.log("\nIf login is still failing in the app, the issue is likely:");
    console.log("1. Backend server not running (check if http://localhost:5000 is accessible)");
    console.log("2. CORS issue (check browser console for errors)");
    console.log("3. API endpoint issue (check Network tab in browser dev tools)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testLogin();
