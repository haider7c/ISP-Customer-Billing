// ========================
// Electron App Entrypoint
// ========================
const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const os = require("os");

// Backend API Routes
const billRoutes = require("./src/routes/billRoutes");
const packageRoutes = require("./src/routes/packageRoutes.js");
const manualBill = require('./src/routes/manualBill.js');
const serialNumberRoute = require("./src/routes/SerialNumber.js");
const customerRoutes = require("./src/routes/customerRoutes.js");

// Models for sync logic
const Customer = require("./src/models/Customer");
const Bill = require("./src/models/Bill");

// ========================
// Logging Setup
// ========================
const logFile = path.join(os.homedir(), "Desktop", "sync-log.txt");
function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
}

// ========================
// Backend Server
// ========================
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/ispos';
const PORT = 5000;
let mainWindow;

function startBackendServer() {
  const backendApp = express();

  mongoose.connect(LOCAL_MONGO_URI)
    .then(() => {
      console.log("✅ Connected to local MongoDB (ispos)");
      logToFile("✅ Connected to local MongoDB (ispos)");
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err);
      logToFile(`❌ MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    });

  backendApp.use(cors());
  backendApp.use(bodyParser.json());
  backendApp.use(bodyParser.urlencoded({ extended: true }));

  // ✅ Log every request
  backendApp.use((req, res, next) => {
    logToFile(`📥 ${req.method} ${req.url}`);
    next();
  });

  backendApp.use('/api/customers', customerRoutes);
  backendApp.use("/api/serialNumber", serialNumberRoute);
  backendApp.use("/api/bills", billRoutes);
  backendApp.use("/api/packages", packageRoutes);
  backendApp.use("/api/manualBill", manualBill);

  backendApp.get("/api/date", (req, res) => {
    res.json({ date: new Date().toISOString() });
  });

  backendApp.get("/api/test-log", (req, res) => {
    logToFile("✅ /api/test-log hit successfully");
    res.json({ success: true });
  });

  backendApp.get("/", (req, res) => {
    res.send("API is running...");
  });

  backendApp.use((err, req, res, next) => {
    console.error(err.stack);
    logToFile(`❌ Backend Error: ${err.stack}`);
    res.status(500).json({ error: "An unexpected error occurred" });
  });

  backendApp.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    logToFile(`🚀 Backend server running at http://localhost:${PORT}`);
  });
}

// ========================
// Cloud Sync Embedded Logic
// ========================
async function runCloudSync() {
  try {
    logToFile("🚀 Cloud sync started");

    await mongoose.connect(LOCAL_MONGO_URI);
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

    logToFile("✅ Monthly bills ensured");

    const localCustomers = await Customer.find();
    const cloudConn = await mongoose.createConnection(
      'mongodb+srv://ali777:9F1aGSgE1Qdl5OXs@cluster0.hxvs0cu.mongodb.net/ispos?retryWrites=true&w=majority&appName=Cluster0'
    );
    logToFile("✅ Connected to MongoDB Atlas");

    const cloudCustomerSchema = new mongoose.Schema({
      serialNumber: String,
      customerName: String,
      phone: String,
      address: String,
      cnic: String,
      expiryDate: Date,
      billReceiveDate: Date,
      customerId: String,
      email: String,
      billStatus: Boolean,
      billDate: Date,
      synced: Boolean,
      packageName: String,
      amount: Number,
      paymentMethod: String,
      paymentNote: String,
    });

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
          const shouldUpdate = (
            cloudDoc.billStatus !== customerData.billStatus ||
            cloudDoc.paymentMethod !== customerData.paymentMethod ||
            cloudDoc.paymentNote !== customerData.paymentNote
          );

          if (shouldUpdate) {
            cloudDoc.set(customerData);
            await cloudDoc.save();
            logToFile(`🔄 Updated cloud customer: ${cloudDoc.serialNumber}`);
          }
        } else {
          const newCloudDoc = new CloudCustomer({ ...customerData, synced: true });
          await newCloudDoc.save();
          logToFile(`☁️ Created cloud customer: ${customerData.serialNumber}`);
        }

        if (!localDoc.synced) {
          localDoc.synced = true;
          await localDoc.save();
        }

        syncedCount++;
      } catch (err) {
        logToFile(`❌ Error syncing customer ${customerData.serialNumber}: ${err.message}`);
      }
    }

    logToFile(`✅ Synced ${syncedCount} customer(s) to MongoDB Atlas`);
    await cloudConn.close();
  } catch (err) {
    logToFile(`❌ Sync Error: ${err.message}`);
  }
}

// ========================
// Background Sync Interval
// ========================
function startSyncInterval() {
  const intervalMinutes = 1;
  setInterval(() => {
    logToFile("🔁 Starting background sync...");
    runCloudSync();
  }, intervalMinutes * 60 * 1000);
}

// ========================
// Electron Window Setup
// ========================
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    show: false,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const indexPath = isDev && process.argv.indexOf('--noDevServer') === -1
    ? 'http://localhost:8080'
    : url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, 'dist', 'index.html'),
        slashes: true,
      });

  mainWindow.loadURL(indexPath);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
      installExtension(REACT_DEVELOPER_TOOLS).catch((err) => {
        console.error('DevTools error:', err);
      });
      mainWindow.webContents.openDevTools();
    }
    // Optional: log renderer messages to file
    mainWindow.webContents.on('console-message', (event, level, message) => {
      logToFile(`💬 Renderer log: ${message}`);
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ========================
// App Events
// ========================
app.whenReady().then(() => {
  startBackendServer();
  createMainWindow();
  startSyncInterval();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createMainWindow();
});