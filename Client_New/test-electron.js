const { app, BrowserWindow } = require("electron");

console.log("TEST ELECTRON FILE LOADED");

function createWindow() {
  console.log("Creating test window...");
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadURL("http://localhost:5173");
  
  win.webContents.openDevTools();
  
  console.log("Window created and loaded!");
}

app.whenReady().then(() => {
  console.log("App is ready!");
  createWindow();
});

app.on("window-all-closed", () => {
  console.log("All windows closed");
  app.quit();
});

console.log("Script finished executing");
