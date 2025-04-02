const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. "3mb"
  speed: { type: String, required: true },         // just for display if needed
  defaultAmount: { type: Number, required: true }, // e.g. 1000
}, {
  timestamps: true,
});

module.exports = mongoose.model("Package", packageSchema);
