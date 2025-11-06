const Customer = require('../models/Customer');

class ExpiryChecker {
  constructor() {
    this.isRunning = false;
    this.whatsappService = null;
  }

  // Set WhatsApp service instance
  setWhatsAppService(service) {
    this.whatsappService = service;
  }

  // Check for packages expiring tomorrow (based on billReceiveDate)
  async checkExpiringPackages() {
    try {
      if (!this.whatsappService) {
        throw new Error('WhatsApp service not available');
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tomorrowDay = tomorrow.getDate();
      console.log(`🔍 Checking packages expiring tomorrow (Day ${tomorrowDay})`);

      // Find all customers whose billReceiveDate matches tomorrow's day
      const expiringCustomers = await Customer.find({
        billReceiveDate: tomorrowDay
      });

      console.log(`📊 Found ${expiringCustomers.length} packages expiring tomorrow (Day ${tomorrowDay})`);

      const results = [];
      for (const customer of expiringCustomers) {
        try {
          console.log(`📤 Processing expiry reminder for: ${customer.customerName} (${customer.phone})`);
          const result = await this.whatsappService.sendExpiryReminder(customer._id);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            package: customer.packageName,
            expiryDay: customer.billReceiveDate,
            amount: customer.amount,
            success: result.success,
            error: result.error
          });

          // Add delay between messages to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`❌ Error processing customer ${customer.customerName}:`, error);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error checking expiring packages:', error);
      throw error;
    }
  }

  // Check for packages due today (bill reminder)
  async checkDueTodayPackages() {
    try {
      if (!this.whatsappService) {
        throw new Error('WhatsApp service not available');
      }

      const today = new Date();
      const todayDay = today.getDate();
      console.log(`🔍 Checking packages due today (Day ${todayDay})`);

      // Find all customers whose billReceiveDate matches today's day
      const dueCustomers = await Customer.find({
        billReceiveDate: todayDay
      });

      console.log(`📊 Found ${dueCustomers.length} packages due today (Day ${todayDay})`);

      const results = [];
      for (const customer of dueCustomers) {
        try {
          console.log(`📤 Processing bill reminder for: ${customer.customerName} (${customer.phone})`);
          const result = await this.whatsappService.sendBillReminder(customer._id);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            package: customer.packageName,
            dueDay: customer.billReceiveDate,
            amount: customer.amount,
            success: result.success,
            error: result.error
          });

          // Add delay between messages to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`❌ Error processing customer ${customer.customerName}:`, error);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error checking due today packages:', error);
      throw error;
    }
  }

  // Get packages expiring in the next X days
  async getExpiringPackages(days = 3) {
    try {
      const today = new Date();
      const expiringPackages = [];

      for (let i = 1; i <= days; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const futureDay = futureDate.getDate();

        const customers = await Customer.find({
          billReceiveDate: futureDay
        });

        customers.forEach(customer => {
          expiringPackages.push({
            ...customer.toObject(),
            expiresInDays: i,
            expiryDate: `Day ${futureDay} (in ${i} day${i > 1 ? 's' : ''})`
          });
        });
      }

      return expiringPackages;
    } catch (error) {
      console.error('❌ Error fetching expiring packages:', error);
      throw error;
    }
  }

  // Get packages due today
  async getDueTodayPackages() {
    try {
      const today = new Date();
      const todayDay = today.getDate();

      const dueCustomers = await Customer.find({
        billReceiveDate: todayDay
      });

      return dueCustomers;
    } catch (error) {
      console.error('❌ Error fetching due today packages:', error);
      throw error;
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start automatic daily checks
  startDailyChecks() {
    if (this.isRunning) {
      console.log('⏰ Daily checks already running');
      return;
    }

    this.isRunning = true;
    
    // Calculate time until next 9:00 AM
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(9, 0, 0, 0);
    
    if (now > nextCheck) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    const timeUntilNext = nextCheck - now;

    console.log(`⏰ Daily checks scheduled to start at: ${nextCheck.toLocaleString()}`);

    setTimeout(() => {
      this.runDailyCheck();
      // Run every 24 hours
      setInterval(() => this.runDailyCheck(), 24 * 60 * 60 * 1000);
    }, timeUntilNext);
  }

  async runDailyCheck() {
    try {
      console.log('🔔 Running daily checks...');
      
      if (!this.whatsappService || !this.whatsappService.isReady) {
        console.log('⚠️ WhatsApp not ready, skipping daily checks');
        return;
      }
      
      // Check for packages expiring tomorrow
      const expiryResults = await this.checkExpiringPackages();
      
      // Check for packages due today
      const dueResults = await this.checkDueTodayPackages();
      
      // Log results
      const successfulExpiry = expiryResults.filter(r => r.success).length;
      const failedExpiry = expiryResults.filter(r => !r.success).length;
      
      const successfulDue = dueResults.filter(r => r.success).length;
      const failedDue = dueResults.filter(r => !r.success).length;
      
      console.log(`📊 Daily check completed:`);
      console.log(`   Expiry reminders: ${successfulExpiry} successful, ${failedExpiry} failed`);
      console.log(`   Due today reminders: ${successfulDue} successful, ${failedDue} failed`);
      
      return {
        expiryResults,
        dueResults,
        summary: {
          expiry: { successful: successfulExpiry, failed: failedExpiry },
          due: { successful: successfulDue, failed: failedDue }
        }
      };
    } catch (error) {
      console.error('❌ Daily check failed:', error);
    }
  }
}

// Create singleton instance
const expiryChecker = new ExpiryChecker();
module.exports = expiryChecker;