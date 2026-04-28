const { app, BrowserWindow } = require("electron");

console.log("SIMPLE ELECTRON STARTING");

let mainWindow;

function createWindow() {
  console.log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("Loading URL...");
  mainWindow.loadURL("http://localhost:5173");

  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    console.log("Window closed");
    mainWindow = null;
  });

  console.log("Window created!");
}

console.log("Setting up app ready handler...");

app.whenReady().then(() => {
  console.log("APP IS READY!");
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("All windows closed - quitting");
  app.quit();
});

console.log("Script loaded successfully!");
