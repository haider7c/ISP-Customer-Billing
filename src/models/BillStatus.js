// models/BillStatus.js
const mongoose = require('mongoose');

const billStatusSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  billStatus: {
    type: Boolean,
    default: false
  },
  received: {  // Add this field
    type: Boolean,
    default: false
  },
  paymentMethod: String,
  paymentNote: String,
  // ADD THESE FIELDS:
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentAmount: Number,
  paymentDate: Date,
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: Date
}, { timestamps: true });

// Add indexes
billStatusSchema.index({ customerId: 1, month: 1, year: 1 }, { unique: true });
billStatusSchema.index({ transactionId: 1 });

module.exports = mongoose.model('BillStatus', billStatusSchema);