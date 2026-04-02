const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlist");

// GET user's wishlist
router.get("/:userId", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate("products");
    if (!wishlist) {
      return res.json({ success: true, products: [] });
    }
    res.json({ success: true, products: wishlist.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD to wishlist
router.post("/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else {
      // Check if already exists
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    const populated = await wishlist.populate("products");
    res.json({ success: true, message: "Added to wishlist", products: populated.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// REMOVE from wishlist
router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== req.params.productId);
    await wishlist.save();

    const populated = await wishlist.populate("products");
    res.json({ success: true, message: "Removed from wishlist", products: populated.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;