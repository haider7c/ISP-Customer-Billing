const express = require("express");
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const expiryChecker = require('../services/expiryChecker');
const Customer = require('../models/Customer');

// Get WhatsApp status
router.get("/status", (req, res) => {
  const status = whatsappService.getStatus();
  res.json(status);
});

// Send test message
router.post("/send-test", async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Phone and message are required" 
      });
    }

    const result = await whatsappService.sendMessage(phone, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send expiry reminder to specific customer
router.post("/send-expiry-reminder/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await whatsappService.sendExpiryReminder(customerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send bill reminder to specific customer
router.post("/send-bill-reminder/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await whatsappService.sendBillReminder(customerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send payment receipt
router.post("/send-payment-receipt/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount, method, transactionId } = req.body;
    
    const paymentDetails = {
      amount,
      method,
      transactionId
    };

    const result = await whatsappService.sendPaymentReceipt(customerId, paymentDetails);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get expiring packages (next X days)
router.get("/expiring-packages", async (req, res) => {
  try {
    const { days = 3 } = req.query;
    const packages = await expiryChecker.getExpiringPackages(parseInt(days));
    res.json(packages);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get packages due today
router.get("/due-today", async (req, res) => {
  try {
    const packages = await expiryChecker.getDueTodayPackages();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Run manual expiry check
router.post("/check-expiring", async (req, res) => {
  try {
    const results = await expiryChecker.checkExpiringPackages();
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Run manual due today check
router.post("/check-due-today", async (req, res) => {
  try {
    const results = await expiryChecker.checkDueTodayPackages();
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;