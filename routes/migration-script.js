// migration-script.js
// Run this ONCE to update existing purchased items with missing fields

const mongoose = require("mongoose");
const Purchased = require("./models/Purchased");

// IMPORTANT: Update this with your MongoDB connection string
const MONGO_URI = "mongodb://127.0.0.1:27017/mydb";

async function migrateData() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    console.log("🔍 Finding purchased items with missing data...");
    
    // Find all purchased items
    const items = await Purchased.find({});
    console.log(`📦 Found ${items.length} items`);

    let updatedCount = 0;

    for (const item of items) {
      let needsUpdate = false;
      const updates = {};

      // Add missing size
      if (!item.size || item.size === "N/A") {
        updates.size = "Standard";
        needsUpdate = true;
      }

      // Add missing price (if 0 or null)
      if (!item.price || item.price === 0) {
        // You might need to set a default or fetch from product
        updates.price = item.totalAmount / (item.quantity || 1);
        needsUpdate = true;
      }

      // Add missing image
      if (!item.image) {
        updates.image = "placeholder.png";
        needsUpdate = true;
      }

      // Add missing status
      if (!item.status) {
        updates.status = "Pending";
        needsUpdate = true;
      }

      // Fix totalAmount if using old totalAfterVAT
      if (item.totalAfterVAT && !item.totalAmount) {
        updates.totalAmount = item.totalAfterVAT;
        needsUpdate = true;
      }

      // Add userId if missing (you need to determine how to get this)
      if (!item.userId) {
        console.warn(`⚠️  Item ${item._id} missing userId - needs manual fix`);
        // updates.userId = "default-user"; // Uncomment and set proper value
      }

      if (needsUpdate) {
        await Purchased.findByIdAndUpdate(item._id, updates);
        updatedCount++;
        console.log(`✅ Updated item ${item._id}: ${item.name}`);
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`📊 Updated ${updatedCount} out of ${items.length} items`);
    
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from database");
  }
}

// Run migration
migrateData();

// HOW TO USE:
// 1. Update MONGO_URI with your connection string
// 2. Run: node migration-script.js