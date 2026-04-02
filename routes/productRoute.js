const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// -----------------------
// MIDDLEWARE: Check if User is Seller
// -----------------------
function isSeller(req, res, next) {
  const userRole = req.headers['x-user-role'] || req.body.role;
  const userId = req.headers['x-user-id'] || req.body.seller;

  if (!userId) {
    return res.status(403).json({
      success: false,
      message: "User ID is required"
    });
  }

  if (userRole !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Only sellers are allowed to add products"
    });
  }

  req.userId = userId;
  req.userRole = userRole;
  next();
}

// 1. ADD PRODUCT
router.post("/add", isSeller, async (req, res) => {
  try {
    const { name, category, quantity, desc, image, prices, location } = req.body;
    const product = new Product({
      name,
      category,
      quantity,
      desc,
      image,
      prices,
      seller: req.userId,
      location
    });

    await product.save();
    res.status(200).json({
      success: true,
      message: "Product added successfully",
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding product: " + error.message
    });
  }
});

// 2. GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET PRODUCTS BY SELLER
router.get("/seller/:id", async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. DELETE PRODUCT BY ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.json({
      success: true,
      message: "Product deleted successfully",
      deleted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product: " + error.message
    });
  }
});

// -------------------------------------------------------
// ✅ BAGONG DAGDAG: UPDATE PRODUCT (PUT)
// Ito ang kailangan para hindi mag-404 ang SAVE button mo
// -------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { name, category, quantity, desc, image, prices } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, quantity, desc, image, prices },
      { new: true } // Para ibalik ang updated data
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product: " + error.message
    });
  }
});

module.exports = router;