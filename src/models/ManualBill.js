// ❌ If it has `export default`, you will also get the same error

// ✅ CommonJS compatible model
const mongoose = require("mongoose");

const manualBillSchema = new mongoose.Schema({
  customerName: String,
  date: String,
  billAmount: Number,
  months: Number,
  connectionFee: Number,
  additions: [
    {
      title: String,
      amount: Number,
    },
  ],
  packageName: String,
  totalAmount: Number,
});

const ManualBill = mongoose.model("ManualBill", manualBillSchema);
module.exports = ManualBill; // ✅ Export correctly
