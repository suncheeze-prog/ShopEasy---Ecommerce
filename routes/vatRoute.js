const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// VAT Schema
const vatSchema = new mongoose.Schema({
  percentage: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const VAT = mongoose.model("VAT", vatSchema);

// POST: Save/Update VAT
router.post("/set", async (req, res) => {
  try {
    const { vat } = req.body;
    
    console.log("Received VAT:", vat);

    if (isNaN(vat) || vat < 0 || vat > 100) {
      return res.json({ success: false, message: "Invalid VAT value" });
    }

    await VAT.deleteMany({});
    const newVAT = new VAT({ percentage: vat });
    await newVAT.save();

    console.log("✅ VAT saved to MongoDB:", vat);
    res.json({ success: true, message: "VAT saved successfully", vat });
    
  } catch (err) {
    console.error("❌ Error:", err);
    res.json({ success: false, message: err.message });
  }
});

// Example: productRoute.js
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    next(error); // Ipapasa sa error handler
  }
});

// GET: Retrieve Current VAT
router.get("/get", async (req, res) => {
  try {
    const vat = await VAT.findOne().sort({ updatedAt: -1 });
    
    if (!vat) {
      return res.json({ success: false, message: "No VAT found" });
    }
    
    console.log("✅ VAT retrieved:", vat.percentage);
    res.json({ success: true, vat: vat.percentage });
    
  } catch (err) {
    console.error("❌ Error:", err);
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;