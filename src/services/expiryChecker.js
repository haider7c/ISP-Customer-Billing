const Customer = require('../models/Customer');
const whatsappService = require('./whatsappService');

class ExpiryChecker {
  constructor() {
    this.isRunning = false;
  }

  // Check for packages expiring tomorrow (based on billReceiveDate)
  async checkExpiringPackages() {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tomorrowDay = tomorrow.getDate();

      // Find all customers whose billReceiveDate matches tomorrow's day
      const expiringCustomers = await Customer.find({
        billReceiveDate: tomorrowDay
      });

      console.log(`📊 Found ${expiringCustomers.length} packages expiring tomorrow (Day ${tomorrowDay})`);

      const results = [];
      for (const customer of expiringCustomers) {
        try {
          const result = await whatsappService.sendExpiryReminder(customer._id);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            package: customer.packageName,
            expiryDay: customer.billReceiveDate,
            amount: customer.amount,
            success: result.success,
            error: result.error
          });
        } catch (error) {
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
      const today = new Date();
      const todayDay = today.getDate();

      // Find all customers whose billReceiveDate matches today's day
      const dueCustomers = await Customer.find({
        billReceiveDate: todayDay
      });

      console.log(`📊 Found ${dueCustomers.length} packages due today (Day ${todayDay})`);

      const results = [];
      for (const customer of dueCustomers) {
        try {
          const result = await whatsappService.sendBillReminder(customer._id);
          results.push({
            customer: customer.customerName,
            phone: customer.phone,
            package: customer.packageName,
            dueDay: customer.billReceiveDate,
            amount: customer.amount,
            success: result.success,
            error: result.error
          });
        } catch (error) {
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

    setTimeout(() => {
      this.runDailyCheck();
      // Run every 24 hours
      setInterval(() => this.runDailyCheck(), 24 * 60 * 60 * 1000);
    }, timeUntilNext);

    console.log(`⏰ Daily checks scheduled to start at: ${nextCheck.toLocaleString()}`);
  }

  async runDailyCheck() {
    try {
      console.log('🔔 Running daily checks...');
      
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