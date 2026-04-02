const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ➕ Add Product
router.post("/add", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();

    res.json({ message: "Product added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding product" });
  }
});

// 📦 Get All Products (optional)
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
