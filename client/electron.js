const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

// Configure auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "public/icon.png"),
    show: false, // Don't show until ready
  });

  // Load the app
  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "dist/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Setup menu
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            mainWindow.reload();
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            const { dialog } = require("electron");
            dialog.showMessageBox({
              type: "info",
              title: "About Inventory Management",
              message: "Inventory Management System",
              detail: `Version: ${app.getVersion()}\n\nA professional inventory and order management system.`,
            });
          },
        },
        {
          label: "Check for Updates",
          click: () => {
            autoUpdater.checkForUpdates();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Check for updates (only in production)
  if (!isDev) {
    // Check for updates on startup
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000); // Wait 5 seconds after startup

    // Check for updates every hour
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3600000);
  }
}

// Auto-updater events
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info.version);
});

autoUpdater.on("update-not-available", (info) => {
  console.log("Update not available:", info.version);
});

autoUpdater.on("error", (err) => {
  console.error("Error in auto-updater:", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`
  );
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded:", info.version);

  // Show dialog to user
  const { dialog } = require("electron");
  dialog
    .showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: "A new version has been downloaded.",
      detail: `Version ${info.version} is ready to install. The application will restart to apply the update.`,
      buttons: ["Restart Now", "Later"],
      defaultId: 0,
      cancelId: 1,
    })
    .then((result) => {
      if (result.response === 0) {
        // User clicked "Restart Now"
        autoUpdater.quitAndInstall();
      }
    });
});

// App lifecycle events
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
