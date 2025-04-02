const mongoose = require("mongoose");
const Customer = require("./src/models/Customer");
const Bill = require("./src/models/Bill");

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ispos");

    // ✅ Step 1: Monthly bill creation
    const customers = await Customer.find();
    const currentMonth = new Date().toISOString().slice(0, 7);

    for (const customer of customers) {
      const existing = await Bill.findOne({
        customerId: customer._id,
        billMonth: currentMonth,
      });

      if (!existing) {
        await Bill.create({
          customerId: customer._id,
          billMonth: currentMonth,
          billReceiveDate: new Date(),
          billStatus: false,
          amount: 1500,
        });
      }
    }

    console.log("✅ Monthly bills ensured");

    // ✅ Step 2: Sync all customers (not just unsynced)
    const localCustomers = await Customer.find();

    // ✅ Setup cloud DB and schema (fully independent)
    const cloudConn = await mongoose.createConnection(
      'mongodb+srv://ali777:9F1aGSgE1Qdl5OXs@cluster0.hxvs0cu.mongodb.net/ispos?retryWrites=true&w=majority&appName=Cluster0'
    );

    const cloudCustomerSchema = new mongoose.Schema({
      serialNumber: { type: String, required: true, unique: true },
      customerName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      cnic: { type: String, required: true },
      expiryDate: { type: Date, required: true },
      billReceiveDate: { type: Date, required: true },
      customerId: { type: String, required: true },
      email: { type: String, required: true },
      billStatus: { type: Boolean, default: false },
      billDate: { type: Date, default: Date.now },
      synced: { type: Boolean, default: false },
      packageName: { type: String, required: true },
      amount:{type:Number},
      paymentMethod: { type: String },
      paymentNote: { type: String }
    }, { strict: true });

    const CloudCustomer = cloudConn.model("CloudCustomer", cloudCustomerSchema, "customers");

    let syncedCount = 0;

    for (const localDoc of localCustomers) {
      const customerData = { ...localDoc.toObject() };
      delete customerData._id;

      if (!customerData.packageName) {
        customerData.packageName = "Basic";
      }

      try {
        let cloudDoc = await CloudCustomer.findOne({ serialNumber: customerData.serialNumber });

        if (cloudDoc) {
          // Only update if data is different
          const shouldUpdate = (
            cloudDoc.billStatus !== customerData.billStatus ||
            cloudDoc.paymentMethod !== customerData.paymentMethod ||
            cloudDoc.paymentNote !== customerData.paymentNote
          );

          if (shouldUpdate) {
            cloudDoc.set(customerData);
            await cloudDoc.save();
            console.log(`🔄 Updated cloud customer: ${cloudDoc.serialNumber}`);
          }
        } else {
          const newCloudDoc = new CloudCustomer({ ...customerData, synced: true });
          await newCloudDoc.save();
          console.log(`☁️ Created cloud customer: ${customerData.serialNumber}`);
        }

        if (!localDoc.synced) {
          localDoc.synced = true;
          await localDoc.save();
        }

        syncedCount++;

      } catch (err) {
        console.error(`❌ Error syncing customer ${customerData.serialNumber}:`, err.message);
      }
    }

    console.log(`✅ Synced ${syncedCount} customer(s) to MongoDB Atlas`);
    process.exit();
  } catch (err) {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
  }
})();