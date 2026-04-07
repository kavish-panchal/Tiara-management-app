require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { createAuditLog } = require("../middleware/auditLog");

const testAuditLogging = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find the owner user
    const owner = await User.findOne({ role: "owner" });
    if (!owner) {
      console.log("❌ No owner user found. Please create one first.");
      process.exit(1);
    }

    console.log(`✅ Found owner user: ${owner.name} (@${owner.username})\n`);

    // Create a test order
    console.log("📝 Creating a test order...");
    const order = await Order.create({
      partyName: "Test Party for Audit",
      orderDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      specialNotes: "This is a test order for audit logging",
      designs: [
        {
          skuCode: "TEST-001",
          quantity: 100,
          weight: 50,
        },
      ],
      status: "pending",
    });

    console.log(`✅ Created order #${order.orderNumber}\n`);

    // Create audit log for the order creation
    console.log("📊 Creating audit log entry...");
    await createAuditLog({
      user: owner,
      action: "CREATE",
      resourceType: "Order",
      resourceId: order._id.toString(),
      description: `Created order #${order.orderNumber} for ${order.partyName}`,
      changes: {
        partyName: order.partyName,
        orderDate: order.orderDate,
        dueDate: order.dueDate,
        designCount: order.designs.length,
      },
    });

    console.log("✅ Audit log created\n");

    // Check if the audit log was created
    const logCount = await AuditLog.countDocuments();
    console.log(`📊 Total audit logs in database: ${logCount}\n`);

    // Fetch and display the latest audit log
    const latestLog = await AuditLog.findOne().sort({ createdAt: -1 });
    if (latestLog) {
      console.log("✅ Latest audit log:");
      console.log(`   Action: ${latestLog.action}`);
      console.log(`   Resource: ${latestLog.resourceType}`);
      console.log(`   User: ${latestLog.userName} (@${latestLog.userUsername})`);
      console.log(`   Description: ${latestLog.description}`);
      console.log(`   Date: ${latestLog.createdAt}`);
      console.log(`   Changes:`, JSON.stringify(latestLog.changes, null, 2));
    }

    console.log("\n✅ Audit logging test completed successfully!");
    console.log("\n🧹 Cleaning up test data...");
    
    // Delete the test order
    await Order.findByIdAndDelete(order._id);
    console.log("✅ Test order deleted");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testAuditLogging();

