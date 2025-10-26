const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Get WhatsApp service instance
function getWhatsAppService() {
  try {
    // Use require inside function to avoid circular dependencies
    const createWhatsAppService = require("../services/whatsappService");
    // Get the singleton instance
    return createWhatsAppService();
  } catch (error) {
    console.error('Error getting WhatsApp service:', error);
    return null;
  }
}

// Get WhatsApp status
router.get("/status", async (req, res) => {
  try {
    const whatsappService = getWhatsAppService();
    if (whatsappService) {
      const status = whatsappService.getStatus();
      res.json(status);
    } else {
      res.json({ 
        isReady: false, 
        isConnected: false,
        error: "WhatsApp service not available"
      });
    }
  } catch (error) {
    console.error('Status route error:', error);
    res.status(500).json({ 
      error: "Failed to get WhatsApp status: " + error.message 
    });
  }
});

// Send test message
router.post("/send-test", async (req, res) => {
  try {
    const { phone, message } = req.body;

    console.log('Send test request:', { phone, message });

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Phone and message are required",
      });
    }

    const whatsappService = getWhatsAppService();
    
    if (!whatsappService) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp service not available",
      });
    }

    // Check if WhatsApp is ready
    if (!whatsappService.isReady) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp is not connected. Please scan the QR code first.",
      });
    }

    console.log('Sending test message via WhatsApp service...');
    const result = await whatsappService.sendMessage(phone, message);
    
    console.log('Send test result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Send test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send expiry reminder to specific customer
router.post("/send-expiry-reminder/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log('Send expiry reminder for customer:', customerId);

    const whatsappService = getWhatsAppService();
    
    if (!whatsappService) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp service not available",
      });
    }

    if (!whatsappService.isReady) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp is not connected",
      });
    }

    const result = await whatsappService.sendExpiryReminder(customerId);
    console.log('Expiry reminder result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Send expiry reminder error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send bill reminder to specific customer
router.post("/send-bill-reminder/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log('Send bill reminder for customer:', customerId);

    const whatsappService = getWhatsAppService();
    
    if (!whatsappService) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp service not available",
      });
    }

    if (!whatsappService.isReady) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp is not connected",
      });
    }

    const result = await whatsappService.sendBillReminder(customerId);
    console.log('Bill reminder result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Send bill reminder error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send payment receipt
router.post("/send-payment-receipt/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount, method, transactionId } = req.body;

    console.log('Send payment receipt:', { customerId, amount, method, transactionId });

    const paymentDetails = {
      amount,
      method,
      transactionId,
    };

    const whatsappService = getWhatsAppService();
    
    if (!whatsappService) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp service not available",
      });
    }

    if (!whatsappService.isReady) {
      return res.status(503).json({
        success: false,
        error: "WhatsApp is not connected",
      });
    }

    const result = await whatsappService.sendPaymentReceipt(customerId, paymentDetails);
    console.log('Payment receipt result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Send payment receipt error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get expiring packages
router.get("/expiring-packages", async (req, res) => {
  try {
    const { days = 3 } = req.query;
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + parseInt(days));

    const customers = await Customer.find({
      billReceiveDate: { $lte: targetDate.getDate() },
    });

    res.json(customers);
  } catch (error) {
    console.error('Get expiring packages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get packages due today
router.get("/due-today", async (req, res) => {
  try {
    const today = new Date();
    const todayDay = today.getDate();

    const customers = await Customer.find({
      billReceiveDate: todayDay,
    });

    res.json(customers);
  } catch (error) {
    console.error('Get due today error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run manual expiry check
router.post("/check-expiring", async (req, res) => {
  try {
    const expiryChecker = require("../services/expiryChecker");
    const results = await expiryChecker.checkExpiringPackages();
    
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Check expiring error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Run manual due today check
router.post("/check-due-today", async (req, res) => {
  try {
    const expiryChecker = require("../services/expiryChecker");
    const results = await expiryChecker.checkDueTodayPackages();
    
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Check due today error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;