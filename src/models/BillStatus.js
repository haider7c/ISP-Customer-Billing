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
  paymentMethod: String,
  paymentNote: String
}, { timestamps: true });

module.exports = mongoose.model('BillStatus', billStatusSchema);