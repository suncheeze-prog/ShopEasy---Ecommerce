const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");

// GET user's cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate("items.productId"); // ⭐ IMPORTANT FIX

    if (!cart) {
      return res.json({ success: true, items: [] });
    }

    // Map output so frontend always receives valid fields
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId?._id,
      name: item.name || item.productId?.name,
      image: item.image || item.productId?.image,
      size: item.size,
      selectedPrice: item.selectedPrice || item.productId?.price,
      orderQty: item.orderQty,
      vat: item.vat || 0
    }));

    res.json({ success: true, items: formattedItems });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ADD item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, name, image, size, selectedPrice, orderQty, vat } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [{ productId, name, image, size, selectedPrice, orderQty, vat }]
      });
    } else {
      // Add to existing cart
      cart.items.push({ productId, name, image, size, selectedPrice, orderQty, vat });
    }

    await cart.save();
    res.json({ success: true, message: "Added to cart", items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// REMOVE item from cart
router.delete("/remove/:userId/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    res.json({ success: true, message: "Item removed", items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CLEAR cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;