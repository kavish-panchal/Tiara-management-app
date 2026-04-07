require("dotenv").config();
const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");

const checkLogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const count = await AuditLog.countDocuments();
    console.log("\n📊 Total audit logs in database:", count);

    const logs = await AuditLog.find().limit(10).sort({ createdAt: -1 });
    
    if (logs.length === 0) {
      console.log("\n❌ No audit logs found in the database!");
      console.log("This means audit logging is not working or no actions have been logged yet.");
    } else {
      console.log("\n✅ Recent audit logs:");
      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.action} - ${log.resourceType}`);
        console.log(`   User: ${log.userName} (@${log.userUsername})`);
        console.log(`   Description: ${log.description}`);
        console.log(`   Date: ${log.createdAt}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkLogs();

