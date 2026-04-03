const mongoose = require("mongoose");

const purchasedSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Para mas mabilis yung queries
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: "placeholder.png"
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    default: "Standard"
  },
  vat: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Pending"
  },
  date: {
    type: String, // Formatted date string for display
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatic createdAt and updatedAt
});

// Index para sa mabilis na queries
purchasedSchema.index({ userId: 1, createdAt: -1 });
purchasedSchema.index({ status: 1 });

// Virtual for subtotal (without VAT)
purchasedSchema.virtual('subtotal').get(function() {
  return this.price * this.quantity;
});

// Method to calculate total with VAT
purchasedSchema.methods.calculateTotal = function() {
  const subtotal = this.price * this.quantity;
  const vatAmount = subtotal * (this.vat / 100);
  return subtotal + vatAmount;
};

module.exports = mongoose.model("Purchased", purchasedSchema);