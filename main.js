const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const billRoutes = require("./src/routes/billRoutes");
const packageRoutes = require("./src/routes/packageRoutes.js");
const manualBill = require('./src/routes/manualBill.js')

// ✅ Dev-only auto-reloader
try {
  require('electron-reloader')(module);
} catch (_) {}

// Express and backend imports
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const serialNumberRoute = require("./src/routes/SerialNumber.js");
const customerRoutes = require("./src/routes/customerRoutes.js");

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';
const MONGO_URI_LOCAL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ispos';
const MONGO_URI_CLOUD = process.env.MONGO_URI || 'mongodb+srv://ali777:9F1aGSgE1Qdl5OXs@cluster0.hxvs0cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGO_URI = isDev ? MONGO_URI_LOCAL : MONGO_URI_CLOUD;

const PORT = process.env.PORT || 5000;

// ---- Script To Sync Data every 10 minutes -----

const { exec } = require("child_process");

function startSyncInterval() {
  const intervalMinutes = 1;

  setInterval(() => {
    console.log("🔁 Running background sync...");
    exec("node syncToCloud.js", (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Sync error:", err.message);
        return;
      }
      if (stderr) {
        console.error("⚠️ Sync stderr:", stderr);
        return;
      }
      console.log(stdout.trim());
    });
  }, intervalMinutes * 60 * 1000);
}

//// ---------********  End Here Script Code ******---------

// --- BACKEND SERVER ---
function startBackendServer() {
  const backendApp = express();

  mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ Connected to ${isDev ? 'Local MongoDB' : 'MongoDB Atlas'}`))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });


  backendApp.use(cors());
  backendApp.use(bodyParser.json());
  backendApp.use(bodyParser.urlencoded({ extended: true }));

  backendApp.use('/api/customers', customerRoutes);
  backendApp.use("/api/serialNumber", serialNumberRoute);
  backendApp.use("/api/bills", billRoutes);
  backendApp.use("/api/packages", packageRoutes);
  backendApp.use("/api/manualBill", manualBill);


  backendApp.get("/api/date", (req, res) => {
    res.json({ date: new Date().toISOString() });
  });

  backendApp.get("/", (req, res) => {
    res.send("API is running...");
  });

  backendApp.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "An unexpected error occurred" });
  });

  backendApp.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
  });
}

// --- MAIN WINDOW ---
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

  let indexPath;

  // ✅ Updated to correct Webpack Dev Server port (8080)
  if (isDev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = 'http://localhost:8080';
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (isDev) {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
      installExtension(REACT_DEVELOPER_TOOLS).catch((err) => {
        console.error('Error loading React DevTools:', err);
      });

      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- APP EVENTS ---
app.whenReady().then(() => {
  startBackendServer();
  createMainWindow();
  startSyncInterval(); // ✅ auto sync every few minutes
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
