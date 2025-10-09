const express = require("express");
const BillStatus = require("../models/BillStatus");
const router = express.Router();

// Get bill status for month
router.get('/monthly', async (req, res) => {
  const { month, year } = req.query;
  
  try {
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }
    
    const billStatuses = await BillStatus.find({ 
      month: parseInt(month), 
      year: parseInt(year) 
    }).populate('customerId'); // This is important!
    
    res.json(billStatuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/update bill status
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

// NEW: Mark bill as paid and record transaction
router.post('/mark-paid', async (req, res) => {
  try {
    const { customerId, month, year, transactionId, paymentAmount, paymentMethod, paymentDate } = req.body;
    
    // Validate required fields
    if (!customerId || !month || !year || !transactionId || !paymentAmount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: customerId, month, year, transactionId, paymentAmount, paymentMethod" 
      });
    }

    // Update or create bill status record
    const billStatus = await BillStatus.findOneAndUpdate(
      { customerId, month, year },
      {
        billStatus: true,
        received: true,
        transactionId,
        paymentAmount,
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        receiptSent: true,
        receiptSentAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('customerId');

    res.json({ 
      success: true, 
      billStatus,
      message: `Payment recorded successfully for ${billStatus.customerId.customerName}`
    });
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    
    // Handle duplicate transaction ID
    if (error.code === 11000 && error.keyPattern?.transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: "Transaction ID already exists. Please generate a new one." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// NEW: Get bill status by transaction ID
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const billStatus = await BillStatus.findOne({ transactionId })
      .populate('customerId');
    
    if (!billStatus) {
      return res.status(404).json({ 
        success: false, 
        error: "Transaction not found" 
      });
    }
    
    res.json({ success: true, billStatus });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// NEW: Get payment history for customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 10 } = req.query;
    
    const payments = await BillStatus.find({ 
      customerId, 
      billStatus: true 
    })
    .sort({ paymentDate: -1 })
    .limit(parseInt(limit))
    .populate('customerId');
    
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;