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
const billStatusRoutes = require("./src/routes/billStatusRoutes.js")

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

function startBackendServer() {
  const backendApp = express();

  // Connect to cloud MongoDB
  mongoose.connect(CLOUD_MONGO_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB Atlas");
      logToFile("✅ Connected to MongoDB Atlas");
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
  backendApp.use("/api/billStatus", billStatusRoutes);

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
// Monthly Bill Creation
// ========================
async function createMonthlyBills() {
  try {
    logToFile("🚀 Monthly bill creation started");

    // Models
    const Customer = require("./src/models/Customer");
    const Bill = require("./src/models/Bill");

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
          amount: customer.packagePrice || 1500, // Use package price if available
        });
        logToFile(`✅ Created bill for customer: ${customer.customerName}`);
      }
    }

    logToFile("✅ Monthly bills ensured");
  } catch (err) {
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
  
  // Run monthly bill creation on startup
  createMonthlyBills();
  
  // Schedule monthly bill creation to run on the 1st of each month
  scheduleMonthlyBills();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createMainWindow();
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
  
  setTimeout(() => {
    createMonthlyBills();
    // Schedule recurring monthly execution
    setInterval(createMonthlyBills, 30 * 24 * 60 * 60 * 1000); // ~30 days
  }, timeUntilNext);
  
  logToFile(`⏰ Next bill creation scheduled for: ${nextMonth.toISOString()}`);
}