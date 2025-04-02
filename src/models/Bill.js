const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  billMonth: {
    type: String, // Format: "2025-03"
    required: true,
  },
  billReceiveDate: {
    type: Date,
    default: Date.now,
  },
  billStatus: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: 1500, // Or get from plan/customer info
  },
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
