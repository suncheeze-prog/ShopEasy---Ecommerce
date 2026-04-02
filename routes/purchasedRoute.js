const express = require("express");
const router = express.Router();
const Purchased = require("../models/purchased");
const Product = require('../models/Product');

// Add purchase - FIXED VERSION
router.post("/add", async (req, res) => {
  try {
    const items = req.body.items;
    if (!items || !Array.isArray(items)) {
      return res.json({ success: false, message: "Invalid data format" });
    }

    const savedItems = [];

    for (const item of items) {
      const newItem = new Purchased({
  userId: item.userId,           // ✅
  name: item.name,               // ✅
  image: item.image,             // ✅
  price: item.price,             // ✅ IMPORTANTE!
  quantity: item.quantity,       // ✅
  size: item.size,               // ✅ IMPORTANTE!
  vat: item.vat,                 // ✅
  totalAmount: item.totalAmount, // ✅
  status: item.status,           // ✅
  date: item.date,               // ✅
  createdAt: item.createdAt      // ✅
});
      
      const saved = await newItem.save();
      savedItems.push(saved);
    }

    res.json({ 
      success: true, 
      message: "Purchase recorded successfully!",
      items: savedItems 
    });
  } catch (err) {
    console.error("❌ Error saving purchase:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all purchases for a specific user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    
    const purchases = await Purchased.find(query).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    console.error("❌ Error fetching purchases:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single purchase by ID
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchased.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body; // Changed from deliveryStatus to status
    const updated = await Purchased.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Error updating status" });
  }
});

// Delete a purchase (optional)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Purchased.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ success: true, message: "Purchase deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;