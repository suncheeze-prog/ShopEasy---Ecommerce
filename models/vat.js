const mongoose = require("mongoose");

const vatSchema = new mongoose.Schema({
  vatPercent: { type: Number, required: true },
  dateUpdated: { type: Date, default: Date.now }
});

// Update dateUpdated on every save
vatSchema.pre("save", function (next) {
  this.dateUpdated = Date.now();
  next();
});

module.exports = mongoose.model("VAT", vatSchema);
