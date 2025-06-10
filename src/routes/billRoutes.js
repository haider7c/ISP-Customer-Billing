const express = require("express");
const Bill = require("../models/Bill");
const router = express.Router();

// Add this to billRoutes.js
router.post("/", async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    const savedBill = await newBill.save();
    
    // Populate customer details in the response
    await savedBill.populate('customerId');
    
    res.status(201).json(savedBill);
  } catch (error) {
    console.error("Error creating bill:", error.message);
    res.status(500).json({ 
      error: "Failed to create bill",
      details: error.message 
    });
  }
});

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
