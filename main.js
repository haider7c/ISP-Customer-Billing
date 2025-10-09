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
const billStatusRoutes = require("./src/routes/billStatusRoutes.js");

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
const CLOUD_MONGO_URI = 'mongodb+srv://ali777:LsocA2ih5dDHa7av@cluster0.hxvs0cu.mongodb.net/ispos?retryWrites=true&w=majority&appName=Cluster0';
const PORT = 5000;
let mainWindow;

async function connectToDatabase() {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    logToFile("🔄 Attempting to connect to MongoDB...");
    
    // Add connection options for better stability
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(CLOUD_MONGO_URI, connectionOptions);
    
    console.log("✅ Connected to MongoDB Atlas");
    logToFile("✅ Connected to MongoDB Atlas");
    return true;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    logToFile(`❌ MongoDB Connection Error: ${err.message}`);
    
    // Try alternative connection method
    console.log("🔄 Trying alternative connection method...");
    logToFile("🔄 Trying alternative connection method...");
    try {
      // Sometimes removing the appName helps
      const altUri = 'mongodb+srv://ali777:LsocA2ih5dDHa7av@cluster0.hxvs0cu.mongodb.net/ispos?retryWrites=true&w=majority';
      await mongoose.connect(altUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      });
      console.log("✅ Connected to MongoDB via alternative method");
      logToFile("✅ Connected to MongoDB via alternative method");
      return true;
    } catch (altErr) {
      console.error("❌ Alternative connection also failed:", altErr.message);
      logToFile(`❌ Alternative connection failed: ${altErr.message}`);
      return false;
    }
  }
}

function startBackendServer() {
  const backendApp = express();

  // Connect to cloud MongoDB with retry logic
  const connectWithRetry = async () => {
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("🔄 Retrying connection in 5 seconds...");
      logToFile("🔄 Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    } else {
      // Start monthly bill creation after successful connection
      createMonthlyBills();
    }
  };

  connectWithRetry();

  backendApp.use(cors());
  backendApp.use(bodyParser.json());
  backendApp.use(bodyParser.urlencoded({ extended: true }));

  // ✅ Log every request
  backendApp.use((req, res, next) => {
    logToFile(`📥 ${req.method} ${req.url}`);
    next();
  });

  // Load WhatsApp routes only if files exist
  try {
    const whatsappRoutes = require("./src/routes/whatsappRoutes");
    backendApp.use("/api/whatsapp", whatsappRoutes);
    console.log("✅ WhatsApp routes loaded");
    logToFile("✅ WhatsApp routes loaded");
  } catch (error) {
    console.log("⚠️ WhatsApp routes not found, continuing without WhatsApp features");
    logToFile("⚠️ WhatsApp routes not found");
  }

  backendApp.use('/api/customers', customerRoutes);
  backendApp.use("/api/serialNumber", serialNumberRoute);
  backendApp.use("/api/bills", billRoutes);
  backendApp.use("/api/packages", packageRoutes);
  backendApp.use("/api/manualBill", manualBill);
  backendApp.use("/api/billStatus", billStatusRoutes);

  // Health check endpoint
  backendApp.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      status: 'ok', 
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  });

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

  // Handle undefined routes
  backendApp.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
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

  // Start WhatsApp service after a delay
  setTimeout(() => {
    try {
      const expiryChecker = require("./src/services/expiryChecker");
      console.log("🔔 Starting WhatsApp service and daily checks...");
      logToFile("🔔 Starting WhatsApp service and daily checks...");
      expiryChecker.startDailyChecks();
    } catch (error) {
      console.log("⚠️ WhatsApp services not available");
      logToFile("⚠️ WhatsApp services not available");
    }
  }, 15000);
}

// ========================
// Monthly Bill Creation
// ========================
async function createMonthlyBills() {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️ MongoDB not connected, skipping bill creation");
      logToFile("⚠️ MongoDB not connected, skipping bill creation");
      return;
    }

    logToFile("🚀 Monthly bill creation started");

    // Models
    const Customer = require("./src/models/Customer");
    const Bill = require("./src/models/Bill");

    const customers = await Customer.find();
    const currentMonth = new Date().toISOString().slice(0, 7);

    let billsCreated = 0;
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
          amount: customer.amount || 1500,
        });
        billsCreated++;
        logToFile(`✅ Created bill for customer: ${customer.customerName}`);
      }
    }

    console.log(`✅ Monthly bills ensured - ${billsCreated} new bills created`);
    logToFile(`✅ Monthly bills ensured - ${billsCreated} new bills created`);
  } catch (err) {
    console.error("❌ Bill Creation Error:", err.message);
    logToFile(`❌ Bill Creation Error: ${err.message}`);
  }
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
      try {
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
        installExtension(REACT_DEVELOPER_TOOLS).catch((err) => {
          console.error('DevTools error:', err);
        });
        mainWindow.webContents.openDevTools();
      } catch (error) {
        console.log('DevTools not available in production');
      }
    }
    
    // Optional: log renderer messages to file
    mainWindow.webContents.on('console-message', (event, level, message) => {
      logToFile(`💬 Renderer log: ${message}`);
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Window failed to load:', errorDescription);
    logToFile(`❌ Window failed to load: ${errorDescription}`);
  });
}

// ========================
// App Events
// ========================
app.whenReady().then(() => {
  console.log("🚀 Starting ISP Customer Billing System...");
  logToFile("🚀 Starting ISP Customer Billing System...");
  
  startBackendServer();
  createMainWindow();
  
  // Schedule monthly bill creation to run on the 1st of each month
  scheduleMonthlyBills();
});

app.on('window-all-closed', () => {
  console.log("👋 All windows closed, quitting app...");
  logToFile("👋 All windows closed, quitting app...");
  
  if (process.platform !== 'darwin') {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
      console.log("📦 MongoDB connection closed");
      logToFile("📦 MongoDB connection closed");
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createMainWindow();
});

app.on('before-quit', () => {
  console.log("🛑 App is quitting...");
  logToFile("🛑 App is quitting...");
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logToFile(`❌ Uncaught Exception: ${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  logToFile(`❌ Unhandled Rejection: ${reason}`);
});

// ========================
// Monthly Bill Scheduling
// ========================
function scheduleMonthlyBills() {
  // Calculate time until next 1st of the month at 00:05 AM
  const now = new Date();
  let nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0);
  
  // If we're already past the 1st, run next month
  if (now.getDate() >= 1) {
    nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0);
  }
  
  const timeUntilNext = nextMonth - now;
  
  console.log(`⏰ Next bill creation scheduled for: ${nextMonth.toLocaleString()}`);
  logToFile(`⏰ Next bill creation scheduled for: ${nextMonth.toISOString()}`);
  
  setTimeout(() => {
    createMonthlyBills();
    // Schedule recurring monthly execution
    setInterval(createMonthlyBills, 30 * 24 * 60 * 60 * 1000); // ~30 days
  }, timeUntilNext);
}