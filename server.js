require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); // ✅ ADDED: Para sa password hashing

const app = express();
const PORT = 4000;

// ✅ Middleware
app.use(cors());

// Taasan ang limit para sa Base64 images (e.g., 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Logging middleware (before routes)
app.use((req, res, next) => {
  console.log("📥 Incoming request:", req.method, req.url);
  next();
});

// ✅ Connect to MongoDB (NO MORE WARNINGS!)
mongoose
  .connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("🚀 MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================================
// OTP SCHEMA - ✅ MOVED BEFORE ROUTES
// ============================================
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});
const OTP = mongoose.model('OTP', otpSchema);

// ============================================
// USER MODEL - ✅ IMPORT FROM YOUR MODELS
// ============================================
// Option 1: If you have a User model file
const User = require('./models/User'); // Adjust path if different

// Option 2: If wala ka pang User model, uncomment this:
/*
const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  address: String,
  password: { type: String, required: true },
  role: { type: String, default: 'buyer' }
});
const User = mongoose.model('User', userSchema);
*/

// ============================================
// NODEMAILER CONFIGURATION
// ============================================
// ⚠️ IMPORTANTE: Palitan ang credentials below!

// OPTION 1: Try with App Password (Recommended)
const SENDER_EMAIL = 'sanchezallen2003@gmail.com';     // ← Your actual Gmail
const SENDER_APP_PASSWORD = 'oomw alha ypeq jaos'; // ← Generate from Google

// OPTION 2: If App Password doesn't work, try Less Secure Apps method
// Enable it at: https://myaccount.google.com/lesssecureapps
// Then use your regular password instead

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD
  },
  // Additional options for better reliability
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
    console.log('📌 Make sure you:');
    console.log('   1. Generated App Password from Google');
    console.log('   2. Enabled 2-Step Verification');
    console.log('   3. Pasted the correct 16-character code');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Sending emails from: ${SENDER_EMAIL}`);
  }
});

// ============================================
// HELPER FUNCTION: Generate 6-digit OTP
// ============================================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// REGISTER EXISTING ROUTES
// ============================================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoute");
const purchasedRoute = require("./routes/purchasedRoute");
const vatRoutes = require("./routes/vatRoute");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoute = require("./routes/wishlistRoute");
const userRoute = require("./routes/userRoute");

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchased", purchasedRoute);
app.use("/api/vat", vatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoute);
app.use('/api/users', userRoute);

// ============================================
// NEW ENDPOINTS: FORGOT PASSWORD WITH OTP
// ============================================

// 1️⃣ FORGOT PASSWORD - Send OTP via Email
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Forgot password request for:', email);
    
    // Validate email
    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Email not found:', email);
      return res.json({ success: false, message: 'Email not found in our system' });
    }
    
    console.log('✅ User found:', user.username);
    
    // Generate 6-digit OTP
    const otp = generateOTP();
    console.log('🔑 Generated OTP:', otp);
    
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });
    
    // Save new OTP to database
    const newOTP = new OTP({ email, otp });
    await newOTP.save();
    console.log('💾 OTP saved to database');
    
    // Send OTP via email
    const mailOptions = {
      from: `ShopEasy <${SENDER_EMAIL}>`, // ✅ Better format
      to: email,                           // ✅ User's email from database
      subject: 'ShopEasy - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0078d7; text-align: center;">ShopEasy</h2>
            <h3 style="color: #333;">Password Reset Request</h3>
            <p style="color: #555; font-size: 16px;">Hello ${user.fullName || user.username},</p>
            <p style="color: #555; font-size: 16px;">You requested to reset your password. Please use the OTP below:</p>
            
            <div style="background-color: #0078d7; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px;">
              ${otp}
            </div>
            
            <p style="color: #555; font-size: 14px;">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #555; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">© 2025 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Attempting to send email...');
    console.log('From:', SENDER_EMAIL);
    console.log('To:', email);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ OTP sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Email sent from: ${SENDER_EMAIL} → to: ${email}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your email successfully',
      // REMOVE THIS IN PRODUCTION (for testing only)
      debug_otp: otp 
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// 2️⃣ VERIFY OTP and RESET PASSWORD
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    console.log('🔍 Verifying OTP for:', email);
    
    // Validate input
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: 'All fields are required' });
    }
    
    // Find OTP in database
    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      console.log('❌ Invalid or expired OTP');
      return res.json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    console.log('✅ OTP verified');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔒 Password hashed');
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    console.log('✅ Password updated for:', user.username);
    
    // Delete used OTP
    await OTP.deleteOne({ email, otp });
    console.log('🗑️ OTP deleted');
    
    res.json({ 
      success: true, 
      message: 'Password reset successful! You can now login with your new password.' 
    });
    
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.json({ success: false, message: 'Failed to reset password.' });
  }
});

// ============================================
// DEFAULT & ERROR HANDLERS
// ============================================

// ✅ Default route (optional)
app.get("/", (req, res) => {
  res.send("Welcome to ShopEasy API!");
});

// 🔥 404 Handler - for undefined routes
app.use((req, res) => {
  console.log("❌ 404 Not Found:", req.method, req.url);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// 🔥 Error Handler - for server errors
app.use((err, req, res, next) => {
  console.error("🔴 ERROR:", err.message);
  console.error("🔴 Stack:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📧 Email service configured');
  console.log('🔐 OTP feature ready');
});