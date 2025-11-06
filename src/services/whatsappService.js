const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Customer = require('../models/Customer');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor(mainWindow) {
    this.client = null;
    this.isReady = false;
    this.mainWindow = mainWindow;
    this.sessionFile = path.join(__dirname, '../../whatsapp-session.json');
    this.currentQR = null;
    
    // Store the main window reference for event forwarding
    this.mainWindowRef = mainWindow;
    
    this.init();
  }

  init() {
    try {
      console.log('🔄 Initializing WhatsApp client...');
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: "whatsapp-client"
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
          executablePath: process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome'
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
      });

      // Single QR event handler
      this.client.on('qr', (qr) => {
        console.log('📱 WhatsApp QR Code received');
        this.currentQR = qr;
        
        // Send QR code to main window
        if (this.mainWindowRef && !this.mainWindowRef.isDestroyed()) {
          console.log('Sending QR code to main window...');
          this.mainWindowRef.webContents.send('whatsapp-qr', qr);
        }
        
        // Generate terminal QR
        qrcode.generate(qr, { small: true });
        
        // Save QR code to file
        const qrFile = path.join(__dirname, '../../whatsapp-qr.txt');
        fs.writeFileSync(qrFile, `Scan this QR code with WhatsApp:\n${qr}\nGenerated at: ${new Date().toISOString()}`);
        console.log(`💾 QR code saved to: ${qrFile}`);
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp client is ready!');
        this.isReady = true;
        this.currentQR = null; // Clear QR when ready
        
        // Notify frontend
        if (this.mainWindowRef && !this.mainWindowRef.isDestroyed()) {
          this.mainWindowRef.webContents.send('whatsapp-status', {
            isReady: true,
            isConnected: true
          });
        }
      });

      this.client.on('authenticated', () => {
        console.log('✅ WhatsApp client authenticated!');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
        this.isReady = false;
        
        if (this.mainWindowRef && !this.mainWindowRef.isDestroyed()) {
          this.mainWindowRef.webContents.send('whatsapp-status', {
            isReady: false,
            isConnected: false,
            error: msg
          });
        }
      });

      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp client disconnected:', reason);
        this.isReady = false;
        this.currentQR = null;
        
        if (this.mainWindowRef && !this.mainWindowRef.isDestroyed()) {
          this.mainWindowRef.webContents.send('whatsapp-status', {
            isReady: false,
            isConnected: false,
            error: reason
          });
        }
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect WhatsApp...');
          this.destroyClient();
          this.init();
        }, 5000);
      });

      this.client.on('loading_screen', (percent, message) => {
        console.log(`📱 WhatsApp Loading: ${percent}% ${message}`);
      });

      this.client.initialize().then(() => {
        console.log('✅ WhatsApp client initialization started');
      }).catch(error => {
        console.error('❌ WhatsApp client initialization failed:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp client:', error);
    }
  }

  // Destroy client properly
  async destroyClient() {
    if (this.client) {
      try {
        await this.client.destroy();
        this.client = null;
      } catch (error) {
        console.error('Error destroying client:', error);
      }
    }
  }

  // Format phone number for WhatsApp
  formatPhoneNumber(phone) {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // If number starts with 92 and length is 10, it's good
    // If number doesn't start with country code, add it
    if (!cleaned.startsWith('92') && cleaned.length === 10) {
      cleaned = '92' + cleaned;
    }
    
    // Validate length
    if (cleaned.length !== 12) {
      throw new Error(`Invalid phone number length: ${cleaned}. Expected 12 digits, got ${cleaned.length}`);
    }
    
    // Add @c.us suffix
    return cleaned + '@c.us';
  }

  // Send message to a customer
  async sendMessage(phone, message) {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client is not ready. Please scan QR code first.');
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      console.log(`📤 Sending message to ${formattedPhone}`);
      
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
    if (!customer || !customer.billReceiveDate) return false;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowDay = tomorrow.getDate();
    const customerExpiryDay = parseInt(customer.billReceiveDate);
    
    return tomorrowDay === customerExpiryDay;
  }

  // Check if customer's package expires today based on billReceiveDate
  isPackageExpiringToday(customer) {
    if (!customer || !customer.billReceiveDate) return false;
    
    const today = new Date();
    const todayDay = today.getDate();
    const customerExpiryDay = parseInt(customer.billReceiveDate);
    
    return todayDay === customerExpiryDay;
  }

  // Send expiry reminder to a customer
  async sendExpiryReminder(customerId) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      if (!customer.phone) {
        throw new Error('Customer phone number not found');
      }

      console.log(`🔔 Checking expiry for ${customer.customerName}, Day: ${customer.billReceiveDate}`);

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
        
        if (result.success) {
          console.log(`✅ Expiry reminder sent to ${customer.customerName} (${customer.phone}) - Expiry Day: ${customer.billReceiveDate}`);
        } else {
          console.log(`❌ Failed to send expiry reminder to ${customer.customerName}: ${result.error}`);
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
        } else {
          console.log(`❌ Failed to send urgent reminder to ${customer.customerName}: ${result.error}`);
        }
        
        return result;
      } else {
        console.log(`ℹ️ Package for ${customer.customerName} does not expire tomorrow or today (Today: ${new Date().getDate()}, Customer Day: ${customer.billReceiveDate})`);
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

      if (!customer.phone) {
        throw new Error('Customer phone number not found');
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
      } else {
        console.log(`❌ Failed to send payment receipt to ${customer.customerName}: ${result.error}`);
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

      if (!customer.phone) {
        throw new Error('Customer phone number not found');
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
        } else {
          console.log(`❌ Failed to send bill reminder to ${customer.customerName}: ${result.error}`);
        }
        
        return result;
      } else {
        console.log(`ℹ️ Today is not the bill due date for ${customer.customerName} (Today: ${new Date().getDate()}, Customer Day: ${customer.billReceiveDate})`);
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
      isConnected: this.isReady,
      hasQR: !!this.currentQR
    };
  }

  // Get current QR code
  getCurrentQR() {
    return this.currentQR;
  }

  // Force QR code regeneration
  async regenerateQR() {
    try {
      console.log('🔄 Regenerating QR code...');
      
      if (this.client) {
        await this.destroyClient();
      }
      
      this.isReady = false;
      this.currentQR = null;
      
      // Reinitialize after a short delay
      setTimeout(() => {
        this.init();
      }, 2000);
      
      return { success: true, message: 'QR code regeneration initiated' };
    } catch (error) {
      console.error('❌ Error regenerating QR:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export factory function with proper singleton pattern
let whatsappServiceInstance = null;

module.exports = (mainWindow) => {
  if (!whatsappServiceInstance) {
    whatsappServiceInstance = new WhatsAppService(mainWindow);
  } else if (mainWindow && !whatsappServiceInstance.mainWindowRef) {
    // Update main window reference if needed
    whatsappServiceInstance.mainWindowRef = mainWindow;
  }
  return whatsappServiceInstance;
};