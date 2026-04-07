# Desktop App Deployment Guide

## Overview
This guide shows how to package your inventory management app as a desktop application with automatic updates.

## Architecture

### Frontend: Electron Desktop App
- Installed on client's computer
- Auto-updates when new version available
- Connects to backend API over internet

### Backend: Cloud-Hosted Server
- Free tier cloud hosting (Railway/Render/Fly.io)
- MongoDB Atlas (free tier) for database
- Always accessible via HTTPS API

## Step 1: Install Electron Dependencies

```bash
cd client
npm install --save-dev electron electron-builder electron-updater
npm install --save-dev concurrently wait-on cross-env
```

## Step 2: Create Electron Configuration

Create `client/electron.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public/icon.png'),
  });

  // Load app
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, 'dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Check for updates (only in production)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Auto-updater events
autoUpdater.on('update-available', () => {
  console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
  // Show notification to user
  const { dialog } = require('electron');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart to apply update.',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

## Step 3: Update package.json

Add to `client/package.json`:

```json
{
  "main": "electron.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron-build": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --win --mac --linux"
  },
  "build": {
    "appId": "com.yourcompany.inventory-management",
    "productName": "Inventory Management",
    "files": [
      "dist/**/*",
      "electron.js",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "public"
    },
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "public/icon.icns"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "public/icon.png"
    },
    "publish": {
      "provider": "github",
      "owner": "your-github-username",
      "repo": "your-repo-name"
    }
  }
}
```

## Step 4: Deploy Backend to Cloud

### Option A: Railway (Easiest) ⭐ Recommended

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add MongoDB database
6. Set environment variables:
   ```
   PORT=5000
   MONGODB_URI=<mongodb-connection-string>
   NODE_ENV=production
   ```
7. Deploy! You get a URL like: `https://your-app.up.railway.app`

**Free Tier:** $5 credit/month (enough for small usage)

### Option B: Render

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect repository
5. Set build command: `cd server && npm install`
6. Set start command: `cd server && npm start`
7. Add MongoDB Atlas connection string
8. Deploy!

**Free Tier:** 750 hours/month (always on)

### Option C: Fly.io

1. Install fly CLI: `npm install -g flyctl`
2. Login: `fly auth login`
3. Create app: `fly launch`
4. Deploy: `fly deploy`

**Free Tier:** 3 shared VMs

## Step 5: Update Frontend to Use Production API

Update `client/.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

## Step 6: Build Desktop App

```bash
cd client

# Build for Windows
npm run electron-build -- --win

# Build for Mac
npm run electron-build -- --mac

# Build for Linux
npm run electron-build -- --linux

# Build for all platforms
npm run dist
```

Output will be in `client/dist/`:
- Windows: `Inventory Management Setup.exe`
- Mac: `Inventory Management.dmg`
- Linux: `Inventory Management.AppImage`

## Step 7: Setup Auto-Updates with GitHub Releases

1. Create GitHub repository (if not already)
2. Push your code
3. Create new release:
   - Go to GitHub → Releases → Create new release
   - Tag: `v1.0.0`
   - Upload installer files (exe, dmg, AppImage)
   - Publish release

4. Update `package.json` with GitHub info:
   ```json
   "build": {
     "publish": {
       "provider": "github",
       "owner": "your-username",
       "repo": "inventory-management-app"
     }
   }
   ```

## Step 8: Distribute to Client

### First-Time Installation:
1. Send installer to client (exe/dmg/AppImage)
2. Client installs once
3. Done!

### Future Updates:
1. You make changes to code
2. Build new version: `npm run dist`
3. Create new GitHub release (v1.0.1, v1.0.2, etc.)
4. Upload new installers
5. Client opens app → Auto-updates! ✅

## Update Workflow

```
Developer Side:
1. Make code changes
2. Test locally
3. Update version in package.json (1.0.0 → 1.0.1)
4. Build: npm run dist
5. Create GitHub release with new version
6. Upload installers

Client Side:
1. Opens app
2. App checks GitHub for updates
3. Finds new version
4. Downloads automatically in background
5. Shows notification: "Update ready"
6. Client clicks "Restart"
7. App updates and reopens ✅
```

## MongoDB Setup (Database)

### Use MongoDB Atlas (Free Forever):

1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0 tier)
4. Create database user
5. Whitelist all IPs: 0.0.0.0/0
6. Get connection string
7. Use in backend environment variables

**Free Tier:** 512MB storage (plenty for this app)

## Cost Summary

| Component | Service | Cost |
|-----------|---------|------|
| Backend Hosting | Railway/Render/Fly.io | FREE |
| Database | MongoDB Atlas | FREE |
| Auto-Updates | GitHub Releases | FREE |
| Desktop App | Client's computer | FREE |
| **Total** | | **$0/month** ✅ |

## Benefits of This Approach

✅ **Zero recurring costs** - All free tiers  
✅ **Automatic updates** - Client doesn't do anything  
✅ **Professional** - Looks like real software  
✅ **Offline-capable** - App works without internet (just can't sync)  
✅ **Cross-platform** - Windows, Mac, Linux  
✅ **Easy deployment** - Push to GitHub, done  
✅ **Version control** - Track all releases  
✅ **Rollback** - Can revert to old version if needed  

## Alternative: Web App (Simpler but Less Professional)

If you want even simpler:

1. Deploy full stack to Render/Railway
2. Client accesses via browser: `https://yourapp.com`
3. Updates are instant (just refresh)
4. No desktop app needed

**Pros:** Simpler, instant updates  
**Cons:** Requires internet, less professional, browser-based

## Recommended for Your Use Case

Since you want a professional desktop app with updates:

**Use Electron + GitHub Releases + Railway Backend**

This gives you:
- Professional desktop application
- Automatic updates
- Free hosting
- Easy maintenance
- Looks like commercial software

