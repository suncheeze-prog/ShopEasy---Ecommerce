const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Siguraduhing tama ang path sa schema mo

// Route para makuha ang LAHAT ng users (para sa Admin Dashboard)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Kunin lahat pero wag isama ang password
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
});

// Route para mag-delete ng user (para gumana yung Delete button)
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;