const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // ✅ IMPORT MO TO!

// -------------------------
// POST /api/login
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("🔍 Login attempt:", username);

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide username and password" 
      });
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    console.log("✅ Login successful! Role:", user.role);
    
    res.json({ 
      success: true, 
      message: "Login successful!",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        birthdate: user.birthdate,
        profilePicture: user.profilePicture,
        role: user.role  // ✅ IMPORTANTE
      }
    });
  } catch (err) {
    console.error("🔴 Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// -------------------------
// POST /api/register
// -------------------------
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      phone,
      address,
      password,
      gender,
      birthdate,
      profilePicture,
      role  // ✅ IMPORTANTE TO
    } = req.body;

    console.log("📥 Registration request received:");
    console.log("- Username:", username);
    console.log("- Role:", role);

    // Validate required fields
    if (!fullName || !username || !email || !phone || !address || !password || !gender || !birthdate || !profilePicture) {
      return res.status(400).json({ success: false, message: "Please fill out all fields including profile picture." });
    }

    // Check if username/email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username or email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      address,
      password: hashedPassword,
      gender,
      birthdate,
      profilePicture,
      role: role || "buyer"  // ✅ Use provided role or default to buyer
    });

    await newUser.save();

    console.log("✅ User created successfully:");
    console.log("- Username:", newUser.username);
    console.log("- Role:", newUser.role);

    res.json({ 
      success: true, 
      message: "Account created successfully!", 
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        gender: newUser.gender,
        birthdate: newUser.birthdate,
        profilePicture: newUser.profilePicture,
        role: newUser.role  // ✅ IMPORTANTE - isama sa response
      }
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// -------------------------
// GET /api/users/:id
// -------------------------
router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;