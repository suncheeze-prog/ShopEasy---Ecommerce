const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  desc: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
    // Base64 format string or URL
  },

  // Prices for different sizes
  prices: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 }
  },

  // ✅ Links Product to Seller
  // This is the seller's userId from localStorage
  seller: { 
    type: String, 
    required: true,
    index: true // For faster queries
  }, 

  // Location with coordinates
  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// ✅ CRITICAL: Prevent "Cannot overwrite Model" error
// This checks if the model already exists before creating it
module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);