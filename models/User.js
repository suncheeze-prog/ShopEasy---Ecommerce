const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  birthdate: { type: Date },
  profilePicture: { 
    type: String,
    default: "https://via.placeholder.com/130/667eea/ffffff?text=User"
  },
  role: { 
    type: String, 
    enum: ["buyer", "seller", "admin"]
    // ✅ NO DEFAULT - para ma-receive yung galing frontend
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);