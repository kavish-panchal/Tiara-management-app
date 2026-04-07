require("dotenv").config();
const mongoose = require("mongoose");

const dropEmailIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    console.log("📋 Listing all indexes on users collection...\n");
    
    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log("Current indexes:");
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n🗑️  Dropping email_1 index...\n");

    try {
      // Drop the email index
      await usersCollection.dropIndex("email_1");
      console.log("✅ Successfully dropped email_1 index!\n");
    } catch (error) {
      if (error.code === 27 || error.message.includes("index not found")) {
        console.log("ℹ️  email_1 index does not exist (already dropped or never existed)\n");
      } else {
        throw error;
      }
    }

    console.log("📋 Listing indexes after drop...\n");
    
    // List indexes again
    const indexesAfter = await usersCollection.indexes();
    console.log("Remaining indexes:");
    indexesAfter.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n✅ Index cleanup complete!");
    console.log("\nYou can now create users with username field without conflicts.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

dropEmailIndex();
