const express = require('express');
const router = express.Router();
// Siguraduhin na i-import mo ang iyong Order/Purchased Model dito
// Halimbawa: const Order = require('../models/Order'); 

// 1. GET: Para makuha ang orders ng isang Seller
router.get("/seller/orders", async (req, res) => {
    const { sellerId } = req.query;
    try {
        const orders = await Order.find({ sellerId: sellerId }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Hindi makuha ang orders" });
    }
});

// 2. POST: Para i-update ang Status (Pending -> Packed -> Shipped)
router.post("/orders/update-status", async (req, res) => {
    const { orderId, status } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// 3. POST: Ang Checkout Route (Customer Side)
router.post("/checkout", async (req, res) => {
    const { productId, buyerId, sellerId, productName, price, quantity } = req.body;
    try {
        const newOrder = new Order({
            productId,
            name: productName,
            price,
            quantity,
            sellerId, // Mahalaga ito para sa Seller Dashboard
            userId: buyerId,
            status: "Pending",
            date: new Date().toLocaleString()
        });
        await newOrder.save();
        res.json({ success: true, message: "Order placed!" });
    } catch (error) {
        res.status(500).json({ error: "Checkout failed" });
    }
});

module.exports = router;