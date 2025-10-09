const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Customer = require('../models/Customer');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.sessionFile = path.join(__dirname, '../../whatsapp-session.json');
    this.init();
  }

  init() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      this.client.on('qr', (qr) => {
        console.log('📱 WhatsApp QR Code received:');
        qrcode.generate(qr, { small: true });
        
        // Save QR code to file for easy access
        const qrFile = path.join(__dirname, '../../whatsapp-qr.txt');
        fs.writeFileSync(qrFile, `Scan this QR code with WhatsApp:\n${qr}\nOr use this link: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr)}`);
        console.log(`💾 QR code saved to: ${qrFile}`);
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp client is ready!');
        this.isReady = true;
      });

      this.client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
        this.isReady = false;
      });

      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp client disconnected:', reason);
        this.isReady = false;
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.init(), 5000);
      });

      this.client.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
    }
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phone) {
    // Remove dashes and spaces from phone number
    let cleaned = phone.replace(/[-\s]/g, '');
    
    // If number starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.substring(1);
    }
    
    // Ensure it ends with @c.us for WhatsApp
    if (!cleaned.endsWith('@c.us')) {
      cleaned += '@c.us';
    }
    
    return cleaned;
  }

  // Send message to a customer
  async sendMessage(phone, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready. Please scan QR code first.');
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const response = await this.client.sendMessage(formattedPhone, message);
      console.log(`✅ Message sent to ${phone}: ${response.id._serialized}`);
      return { success: true, messageId: response.id._serialized };
    } catch (error) {
      console.error(`❌ Failed to send message to ${phone}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Check if customer's package expires tomorrow based on billReceiveDate
  isPackageExpiringTomorrow(customer) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowDay = tomorrow.getDate();
    const customerExpiryDay = customer.billReceiveDate;
    
    // Check if tomorrow's day matches the customer's billReceiveDate
    return tomorrowDay === customerExpiryDay;
  }

  // Check if customer's package expires today based on billReceiveDate
  isPackageExpiringToday(customer) {
    const today = new Date();
    const todayDay = today.getDate();
    const customerExpiryDay = customer.billReceiveDate;
    
    return todayDay === customerExpiryDay;
  }

  // Send expiry reminder to a customer
  async sendExpiryReminder(customerId) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if package expires tomorrow
      if (this.isPackageExpiringTomorrow(customer)) {
        const message = `🔔 *Package Expiry Reminder*

Dear ${customer.customerName},

Your *${customer.packageName}* package (Rs. ${customer.amount}) will expire *tomorrow* (Day ${customer.billReceiveDate} of the month).

Please make the payment to avoid service interruption.

*Payment Details:*
📦 Package: ${customer.packageName}
💰 Amount: Rs. ${customer.amount}
📅 Due Date: Day ${customer.billReceiveDate} of every month

Thank you for choosing our service!

Best regards,
Your ISP Team 🌐`;

        const result = await this.sendMessage(customer.phone, message);
        
        // Log the notification
        if (result.success) {
          console.log(`✅ Expiry reminder sent to ${customer.customerName} (${customer.phone}) - Expiry Day: ${customer.billReceiveDate}`);
        }
        
        return result;
      } 
      // Check if package expires today
      else if (this.isPackageExpiringToday(customer)) {
        const message = `⚠️ *URGENT: Package Expires Today!*

Dear ${customer.customerName},

Your *${customer.packageName}* package (Rs. ${customer.amount}) expires *TODAY* (Day ${customer.billReceiveDate})!

Please make immediate payment to avoid service disruption.

*Payment Details:*
📦 Package: ${customer.packageName}
💰 Amount: Rs. ${customer.amount}
📅 Due Date: TODAY (Day ${customer.billReceiveDate})

Contact support if you have already paid.

Best regards,
Your ISP Team 🌐`;

        const result = await this.sendMessage(customer.phone, message);
        
        if (result.success) {
          console.log(`✅ Urgent expiry reminder sent to ${customer.customerName} (${customer.phone}) - Expiry Day: ${customer.billReceiveDate}`);
        }
        
        return result;
      } else {
        return { success: false, error: 'Package does not expire tomorrow or today' };
      }
    } catch (error) {
      console.error('❌ Error sending expiry reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment receipt
  async sendPaymentReceipt(customerId, paymentDetails) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const message = `✅ *Payment Received - Thank You!*

Dear ${customer.customerName},

We have received your payment for *${customer.packageName}* package.

📋 *Payment Details:*
📦 Package: ${customer.packageName}
💰 Amount: Rs. ${paymentDetails.amount}
💳 Method: ${paymentDetails.method}
📅 Paid on: ${new Date().toLocaleDateString()}
🆔 Transaction: ${paymentDetails.transactionId || 'N/A'}

Your service will continue uninterrupted. Next payment due on Day ${customer.billReceiveDate} of next month.

For any queries, please contact support.

Best regards,
Your ISP Team 🌐`;

      const result = await this.sendMessage(customer.phone, message);
      
      if (result.success) {
        console.log(`✅ Payment receipt sent to ${customer.customerName}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error sending payment receipt:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bill reminder (on the due date)
  async sendBillReminder(customerId) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if today is the bill due date
      if (this.isPackageExpiringToday(customer)) {
        const message = `📋 *Monthly Bill Reminder*

Dear ${customer.customerName},

This is a friendly reminder that your monthly bill is due today.

*Bill Details:*
📦 Package: ${customer.packageName}
💰 Amount: Rs. ${customer.amount}
📅 Due Date: Today (Day ${customer.billReceiveDate})

Please make the payment at your earliest convenience to avoid any service interruption.

Thank you for your prompt attention.

Best regards,
Your ISP Team 🌐`;

        const result = await this.sendMessage(customer.phone, message);
        
        if (result.success) {
          console.log(`✅ Bill reminder sent to ${customer.customerName} (${customer.phone}) - Due Day: ${customer.billReceiveDate}`);
        }
        
        return result;
      } else {
        return { success: false, error: 'Today is not the bill due date' };
      }
    } catch (error) {
      console.error('❌ Error sending bill reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Check status
  getStatus() {
    return {
      isReady: this.isReady,
      isConnected: this.isReady
    };
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();
module.exports = whatsappService;