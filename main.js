// ========================
// Electron App Entrypoint
// ========================
const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
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
let whatsappService;
let isDatabaseConnected = false;

// ========================
// QR Code Window Setup
// ========================
let qrWindow = null;

function createQRWindow() {
  if (qrWindow && !qrWindow.isDestroyed()) {
    qrWindow.focus();
    return;
  }

  qrWindow = new BrowserWindow({
    width: 450,
    height: 600,
    show: false,
    title: 'WhatsApp QR Code',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  const qrHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp QR Code</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            margin: 0;
        }
        .container {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
            margin: 0 auto;
        }
        #qrcode {
            margin: 20px auto;
            padding: 15px;
            background: white;
            border-radius: 5px;
            border: 1px solid #ddd;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .instructions {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background: #e3f2fd;
            border-radius: 5px;
            font-size: 14px;
        }
        .status {
            margin: 10px 0;
            padding: 12px;
            border-radius: 5px;
            font-weight: bold;
        }
        .connected { background: #e8f5e8; color: #2e7d32; }
        .disconnected { background: #ffebee; color: #c62828; }
        .scanning { background: #fff3e0; color: #ef6c00; }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #005a9e;
        }
        img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
        .qr-text {
            font-family: monospace;
            font-size: 8px;
            word-break: break-all;
            background: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .error {
            color: #d32f2f;
            background: #ffebee;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>📱 WhatsApp Authentication</h2>
        
        <div id="status" class="status scanning">
            ⏳ Waiting for QR Code...
        </div>

        <div id="qrcode">
            <div class="loading">QR code will appear here...</div>
        </div>

        <div class="instructions">
            <h3 style="margin-top: 0;">How to connect:</h3>
            <ol>
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Menu</strong> → <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan the QR code above</li>
            </ol>
            <p><strong>Note:</strong> This window will close automatically once connected.</p>
        </div>

        <button id="closeBtn">Close Window</button>
    </div>

    <script>
        const { ipcRenderer } = require('electron');
        const QRCode = require('qrcode');
        
        console.log('QR Window script loaded with QRCode module');
        
        // Listen for QR code from main process
        ipcRenderer.on('whatsapp-qr', async (event, qrCode) => {
            console.log('QR Window: Received QR code data');
            const qrcodeElement = document.getElementById('qrcode');
            const statusElement = document.getElementById('status');
            
            statusElement.innerHTML = '📱 Scan this QR code with WhatsApp';
            statusElement.className = 'status scanning';
            
            try {
                console.log('Generating QR code image...');
                
                // Generate QR code as data URL
                const qrImage = await QRCode.toDataURL(qrCode, {
                    width: 280,
                    height: 280,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                console.log('QR code image generated successfully');
                qrcodeElement.innerHTML = '<img src="' + qrImage + '" alt="WhatsApp QR Code">';
                
            } catch (error) {
                console.error('QR Window: Failed to generate QR image:', error);
                
                // Fallback to text representation
                const qrText = qrCode.substring(0, 100) + '...';
                qrcodeElement.innerHTML = \`
                    <div style="text-align: center;">
                        <div class="error">
                            <strong>QR Image Generation Failed</strong>
                            <p>Using text representation instead</p>
                        </div>
                        <h4>WhatsApp QR Code Data</h4>
                        <div class="qr-text">
                            \${qrText}
                        </div>
                        <p><strong>Full QR code is available in terminal</strong></p>
                        <p>Scan the terminal QR code with WhatsApp → Linked Devices</p>
                    </div>
                \`;
            }
        });

        // Listen for connection status
        ipcRenderer.on('whatsapp-status', (event, status) => {
            console.log('QR Window: Status update received:', status);
            const statusElement = document.getElementById('status');
            
            if (status.isReady) {
                statusElement.innerHTML = '✅ Connected to WhatsApp!';
                statusElement.className = 'status connected';
                
                // Auto-close after 3 seconds
                setTimeout(() => {
                    window.close();
                }, 3000);
            } else if (status.error) {
                statusElement.innerHTML = '❌ Error: ' + status.error;
                statusElement.className = 'status disconnected';
            } else {
                statusElement.innerHTML = '❌ Disconnected from WhatsApp';
                statusElement.className = 'status disconnected';
            }
        });

        // Close button
        document.getElementById('closeBtn').addEventListener('click', () => {
            window.close();
        });

        // Request current status when window loads
        console.log('QR Window: Requesting initial status');
        ipcRenderer.send('qr-window-ready');
        
        console.log('QR Window: Setup complete');
    </script>
</body>
</html>`;

  qrWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(qrHTML)}`);

  qrWindow.once('ready-to-show', () => {
    qrWindow.show();
    console.log('QR Window shown');
    
    // Send current QR code if available
    if (whatsappService && whatsappService.currentQR) {
      console.log('Sending existing QR code to new window');
      qrWindow.webContents.send('whatsapp-qr', whatsappService.currentQR);
    }
  });

  qrWindow.on('closed', () => {
    console.log('QR Window closed');
    qrWindow = null;
  });

  // Handle window errors
  qrWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('QR Window failed to load:', errorDescription);
  });

  // Listen for messages from QR window
  qrWindow.webContents.on('ipc-message', (event, channel, data) => {
    if (channel === 'qr-window-ready') {
      console.log('QR Window is ready and requesting data');
      // Send current status and QR if available
      if (whatsappService) {
        const status = whatsappService.getStatus();
        qrWindow.webContents.send('whatsapp-status', status);
        
        if (whatsappService.currentQR) {
          setTimeout(() => {
            qrWindow.webContents.send('whatsapp-qr', whatsappService.currentQR);
          }, 500);
        }
      }
    }
  });
}

// ========================
// Fixed Database Connection
// ========================
async function connectToDatabase() {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    logToFile("🔄 Attempting to connect to MongoDB...");
    
    // Remove deprecated options and use modern connection settings
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      // Remove deprecated bufferMaxEntries
      connectTimeoutMS: 30000,
      family: 4 // Use IPv4
    };

    console.log("🌐 Connecting to MongoDB Atlas...");
    
    // Connect with proper error handling
    await mongoose.connect(CLOUD_MONGO_URI, connectionOptions);
    
    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log("✅ MongoDB connected successfully");
      logToFile("✅ MongoDB connected successfully");
      isDatabaseConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error:", err);
      logToFile(`❌ MongoDB connection error: ${err.message}`);
      isDatabaseConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log("⚠️ MongoDB disconnected");
      logToFile("⚠️ MongoDB disconnected");
      isDatabaseConnected = false;
    });

    console.log("✅ Connected to MongoDB Atlas");
    logToFile("✅ Connected to MongoDB Atlas");
    isDatabaseConnected = true;
    return true;
    
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    logToFile(`❌ MongoDB Connection Error: ${err.message}`);
    isDatabaseConnected = false;
    
    // Try alternative connection without appName
    console.log("🔄 Trying alternative connection method...");
    try {
      const altUri = 'mongodb+srv://ali777:LsocA2ih5dDHa7av@cluster0.hxvs0cu.mongodb.net/ispos?retryWrites=true&w=majority';
      await mongoose.connect(altUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });
      console.log("✅ Connected to MongoDB via alternative method");
      logToFile("✅ Connected to MongoDB via alternative method");
      isDatabaseConnected = true;
      return true;
    } catch (altErr) {
      console.error("❌ Alternative connection failed:", altErr.message);
      logToFile(`❌ Alternative connection failed: ${altErr.message}`);
      return false;
    }
  }
}

// ========================
// Enhanced Backend Server with Database Status
// ========================
function startBackendServer(mainWindow) {
  const backendApp = express();

  // Enhanced connection with better retry logic
  const connectWithRetry = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      const connected = await connectToDatabase();
      
      if (connected) {
        console.log("🎉 Database connection established!");
        logToFile("🎉 Database connection established!");
        createMonthlyBills();
        return;
      }
    } catch (error) {
      console.error(`Connection attempt ${retryCount + 1} failed:`, error.message);
    }

    if (retryCount < maxRetries) {
      const delay = Math.min(10000 * (retryCount + 1), 30000);
      console.log(`🔄 Retrying connection in ${delay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
      logToFile(`🔄 Retrying connection in ${delay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
      
      setTimeout(() => connectWithRetry(retryCount + 1), delay);
    } else {
      console.log("❌ Maximum connection retries reached. Running in limited mode.");
      logToFile("❌ Maximum connection retries reached. Running in limited mode.");
      // We'll continue without database connection but routes will handle errors
    }
  };

  // Start connection process
  connectWithRetry();

  // Middleware
  backendApp.use(cors());
  backendApp.use(bodyParser.json({ limit: '10mb' }));
  backendApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware with database status
  backendApp.use((req, res, next) => {
    const dbStatus = isDatabaseConnected ? '✅ DB Connected' : '❌ DB Disconnected';
    logToFile(`📥 ${req.method} ${req.url} - ${dbStatus}`);
    console.log(`📥 ${req.method} ${req.url} - ${dbStatus}`);
    
    // Add database status to request for routes to use
    req.isDatabaseConnected = isDatabaseConnected;
    next();
  });

  // Database connection check middleware
  const checkDB = (req, res, next) => {
    if (!isDatabaseConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected. Please check your internet connection and try again.",
        timestamp: new Date().toISOString()
      });
    }
    next();
  };

  // Load all routes with database check
  backendApp.use('/api/customers', checkDB, customerRoutes);
  backendApp.use("/api/serialNumber", checkDB, serialNumberRoute);
  backendApp.use("/api/bills", checkDB, billRoutes);
  backendApp.use("/api/packages", checkDB, packageRoutes);
  backendApp.use("/api/manualBill", checkDB, manualBill);
  backendApp.use("/api/billStatus", checkDB, billStatusRoutes);

  // Load WhatsApp routes with better error handling
  try {
    const whatsappRoutes = require("./src/routes/whatsappRoutes");
    backendApp.use("/api/whatsapp", whatsappRoutes);
    console.log("✅ WhatsApp routes loaded successfully");
    logToFile("✅ WhatsApp routes loaded successfully");
  } catch (error) {
    console.log("⚠️ WhatsApp routes not found, creating fallback routes");
    logToFile("⚠️ WhatsApp routes not found");
    
    // Create basic fallback routes
    backendApp.get("/api/whatsapp/status", (req, res) => {
      res.json({ isReady: false, isConnected: false });
    });
    
    backendApp.get("/api/whatsapp/expiring-packages", (req, res) => {
      res.json([]);
    });
    
    backendApp.get("/api/whatsapp/due-today", (req, res) => {
      res.json([]);
    });
    
    backendApp.post("/api/whatsapp/send-test", (req, res) => {
      res.json({ success: false, error: "WhatsApp service not available" });
    });
  }

  // Enhanced health check endpoint
  backendApp.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      status: 'ok', 
      database: dbStatus,
      isDatabaseConnected: isDatabaseConnected,
      whatsapp: whatsappService ? whatsappService.getStatus() : { isReady: false },
      timestamp: new Date().toISOString()
    });
  });

  // Database connection endpoint
  backendApp.post("/api/database/reconnect", async (req, res) => {
    try {
      console.log("🔄 Manual database reconnection requested");
      const result = await connectToDatabase();
      res.json({ 
        success: result, 
        message: result ? "Database reconnected successfully" : "Database reconnection failed",
        isDatabaseConnected 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        isDatabaseConnected: false
      });
    }
  });

  backendApp.get("/api/date", (req, res) => {
    res.json({ date: new Date().toISOString() });
  });

  backendApp.get("/api/test-log", (req, res) => {
    logToFile("✅ /api/test-log hit successfully");
    res.json({ success: true });
  });

  backendApp.get("/", (req, res) => {
    res.send(`
      <html>
        <head><title>ISP Billing System API</title></head>
        <body>
          <h1>ISP Billing System API</h1>
          <p>Status: <strong>Running</strong></p>
          <p>Database: <strong>${isDatabaseConnected ? 'Connected' : 'Disconnected'}</strong></p>
          <p>WhatsApp: <strong>${whatsappService && whatsappService.isReady ? 'Connected' : 'Disconnected'}</strong></p>
          <p><a href="/api/health">Health Check</a></p>
        </body>
      </html>
    `);
  });

  // Handle undefined routes
  backendApp.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Error handling middleware
  backendApp.use((err, req, res, next) => {
    console.error('❌ Backend Error:', err.stack);
    logToFile(`❌ Backend Error: ${err.stack}`);
    
    res.status(500).json({ 
      error: "An unexpected error occurred",
      message: err.message,
      timestamp: new Date().toISOString()
    });
  });

  // Start server
  backendApp.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    logToFile(`🚀 Backend server running at http://localhost:${PORT}`);
  });

  // Initialize WhatsApp service
  setTimeout(() => {
    try {
      console.log('🔄 Initializing WhatsApp service...');
      
      const createWhatsAppService = require("./src/services/whatsappService");
      whatsappService = createWhatsAppService(mainWindow);
      console.log("✅ WhatsApp service initialized with frontend integration");
      logToFile("✅ WhatsApp service initialized with frontend integration");
      
      // Setup QR code forwarding to any open QR windows
      if (whatsappService.client) {
        whatsappService.client.on('qr', (qr) => {
          console.log('📱 QR Code generated, forwarding to QR window...');
          if (qrWindow && !qrWindow.isDestroyed()) {
            setTimeout(() => {
              qrWindow.webContents.send('whatsapp-qr', qr);
              console.log('✅ QR code sent to QR window');
            }, 1000);
          }
        });
        
        whatsappService.client.on('ready', () => {
          console.log('✅ WhatsApp ready, notifying QR window...');
          if (qrWindow && !qrWindow.isDestroyed()) {
            qrWindow.webContents.send('whatsapp-status', {
              isReady: true,
              isConnected: true
            });
          }
        });
      }

      // Initialize expiry checker with WhatsApp service
      const expiryChecker = require("./src/services/expiryChecker");
      if (whatsappService) {
        expiryChecker.setWhatsAppService(whatsappService);
        console.log("✅ Expiry checker initialized with WhatsApp service");
      }
      
    } catch (error) {
      console.log("⚠️ WhatsApp service not available: " + error.message);
      logToFile("⚠️ WhatsApp service not available: " + error.message);
    }
  }, 3000);

  // Add IPC handlers for WhatsApp
  ipcMain.handle('get-whatsapp-status', () => {
    return whatsappService ? whatsappService.getStatus() : { isReady: false, isConnected: false };
  });

  ipcMain.handle('open-qr-window', () => {
    createQRWindow();
  });

  ipcMain.handle('restart-whatsapp', () => {
    if (whatsappService) {
      whatsappService.init();
      return { success: true };
    }
    return { success: false, error: 'WhatsApp service not available' };
  });

  // Handle QR window ready event
  ipcMain.on('qr-window-ready', (event) => {
    console.log('QR window is ready, sending current data...');
    
    // Send current status
    if (whatsappService) {
      const status = whatsappService.getStatus();
      event.reply('whatsapp-status', status);
      
      // Send current QR code if available
      if (whatsappService.currentQR) {
        setTimeout(() => {
          event.reply('whatsapp-qr', whatsappService.currentQR);
        }, 500);
      }
    }
  });

  ipcMain.handle('regenerate-qr', async () => {
    if (whatsappService) {
      const result = await whatsappService.regenerateQR();
      return result;
    }
    return { success: false, error: 'WhatsApp service not available' };
  });

  // Database reconnection handler
  ipcMain.handle('reconnect-database', async () => {
    try {
      const result = await connectToDatabase();
      return { 
        success: result, 
        isDatabaseConnected,
        message: result ? 'Database reconnected successfully' : 'Database reconnection failed'
      };
    } catch (error) {
      return { 
        success: false, 
        isDatabaseConnected: false,
        error: error.message 
      };
    }
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
  }, 5000);
}

// Debug: Check service status every 10 seconds
setInterval(() => {
  if (whatsappService) {
    console.log('🔍 Service Status:', {
      whatsappReady: whatsappService.isReady,
      whatsappHasQR: !!whatsappService.currentQR,
      databaseConnected: isDatabaseConnected,
      mongooseState: mongoose.connection.readyState
    });
  }
}, 10000);

// ========================
// Monthly Bill Creation
// ========================
async function createMonthlyBills() {
  try {
    // Check if MongoDB is connected
    if (!isDatabaseConnected || mongoose.connection.readyState !== 1) {
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
      enableRemoteModule: true,
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
  
  createMainWindow();
  startBackendServer(mainWindow);
  
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