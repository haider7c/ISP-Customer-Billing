const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
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
    regDate: {
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

    synced: {
        type: Boolean,
        default: false,
      },
    packageName: {
       type: String,
       required: true,
    },
  
    amount:{
      type:Number
    }
    
            
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
