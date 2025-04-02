const express = require("express");
const Bill = require("../models/Bill");
const router = express.Router();

// Get all bills or filter by customer/month
router.get("/", async (req, res) => {
  const { customerId, month } = req.query;
  const filter = {};
  if (customerId) filter.customerId = customerId;
  if (month) filter.billMonth = month;

  const bills = await Bill.find(filter).populate("customerId");
  res.json(bills);
});

// Mark bill as paid
router.put("/:id/pay", async (req, res) => {
  await Bill.findByIdAndUpdate(req.params.id, { billStatus: true });
  res.json({ message: "Bill marked as paid" });
});

module.exports = router;
