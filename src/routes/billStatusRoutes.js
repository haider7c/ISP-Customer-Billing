const express = require("express");
const BillStatus = require("../models/BillStatus");
const router = express.Router();

router.get('/monthly', async (req, res) => {
  const { month, year } = req.query;
  
  try {
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }
    
    const billStatuses = await BillStatus.find({ 
      month: parseInt(month), 
      year: parseInt(year) 
    }).populate('customerId');
    
    res.json(billStatuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Backend route for creating/updating bill status
router.post('/', async (req, res) => {
  const { customerId, month, year, billStatus, paymentMethod, paymentNote } = req.body;
  
  try {
    let billStatusDoc = await BillStatus.findOne({ customerId, month, year });
    
    if (billStatusDoc) {
      billStatusDoc.billStatus = billStatus;
      billStatusDoc.paymentMethod = paymentMethod;
      billStatusDoc.paymentNote = paymentNote;
    } else {
      billStatusDoc = new BillStatus({
        customerId,
        month,
        year,
        billStatus,
        paymentMethod,
        paymentNote
      });
    }
    
    const savedStatus = await billStatusDoc.save();
    res.status(201).json(savedStatus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Bill Status by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedBill = await BillStatus.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.status(200).json(updatedBill);
  } catch (error) {
    console.error("Error updating Bill: ", error.message);
    res.status(500).json({ message: "Failed to update bill", error: error.message });
  }
});


module.exports = router;