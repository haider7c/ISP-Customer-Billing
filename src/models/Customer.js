const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },

    // ✅ Renamed field here
    billReceiveDate: {
      type: Date,
      required: true,
    },

    customerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    // ✅ Billing fields
    billStatus: {
      type: Boolean,
      default: false, // false = unpaid, true = paid
    },
    billDate: {
      type: Date,
      default: Date.now,
    },
 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
