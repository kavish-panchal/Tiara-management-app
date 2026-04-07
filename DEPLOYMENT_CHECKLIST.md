# 🚀 Deployment Checklist - Step by Step

## Quick Summary

**What we're building:**
- Desktop app (Windows/Mac/Linux) for your client
- Backend hosted on Railway (free)
- Database on MongoDB Atlas (free)
- Auto-updates via GitHub Releases (free)

**Total Cost: $0/month** ✅

---

## Part 1: Setup Desktop App (30 minutes)

### Step 1: Install Electron Dependencies

```bash
cd client
npm install electron electron-is-dev --save-dev
npm install electron-builder electron-updater --save-dev
npm install concurrently wait-on cross-env --save-dev
```

### Step 2: Update client/package.json

Add these scripts and configuration:

```json
{
  "name": "inventory-management-app",
  "version": "1.0.0",
  "main": "electron.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron .",
    "electron-dev": "concurrently \"cross-env BROWSER=none npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron-build": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --win --publish never"
  },
  "build": {
    "appId": "com.yourcompany.inventory-management",
    "productName": "Inventory Management",
    "files": [
      "dist/**/*",
      "electron.js",
      "public/**/*"
    ],
    "directories": {
      "buildResources": "public",
      "output": "release"
    },
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "publish": {
      "provider": "github",
      "owner": "YOUR-GITHUB-USERNAME",
      "repo": "inventory-management-app"
    }
  }
}
```

### Step 3: Create Icon (Optional but Recommended)

Create a 512x512 PNG icon and convert to .ico:
1. Use an online converter: https://convertio.co/png-ico/
2. Save as `client/public/icon.ico`
3. Also keep PNG version: `client/public/icon.png`

### Step 4: Test Locally

```bash
cd client
npm run electron-dev
```

Desktop app should open! ✅

---

## Part 2: Deploy Backend to Railway (20 minutes)

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (easiest)
3. Verify email

### Step 2: Setup MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create new project: "Inventory Management"
4. Build a Database → FREE (M0) → AWS → Select region
5. Create database user:
   - Username: `admin`
   - Password: (auto-generate and save it!)
6. Network Access → Add IP Address → 0.0.0.0/0 (Allow from anywhere)
7. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Save it! You'll need it soon

**Example connection string:**
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/inventory-management?retryWrites=true&w=majority
```

### Step 3: Deploy Backend to Railway

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize GitHub access
4. Select your repository
5. Railway auto-detects Node.js ✅

### Step 4: Configure Backend on Railway

1. Click on your deployed service
2. Go to "Variables" tab
3. Add these environment variables:
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   NODE_ENV=production
   ```
4. Go to "Settings" tab
5. Set "Root Directory": `server`
6. Set "Start Command": `npm start`
7. Deploy!

### Step 5: Get Your Backend URL

1. Go to "Settings" tab
2. Under "Domains", click "Generate Domain"
3. You'll get a URL like: `https://your-app.up.railway.app`
4. Copy this URL!

### Step 6: Test Backend

Visit: `https://your-app.up.railway.app/api/orders`

Should see: `{"message": "Not authorized, no user session"}` ✅

This is correct! It means backend is working, just needs authentication.

---

## Part 3: Update Frontend to Use Production Backend (5 minutes)

### Create client/.env.production

```env
VITE_API_URL=https://your-app.up.railway.app/api
```

Replace with your actual Railway URL!

### Test Build

```bash
cd client
npm run build
```

Check `client/dist` folder - should have built files ✅

---

## Part 4: Build Desktop App (10 minutes)

### Build for Windows

```bash
cd client
npm run dist
```

This will:
1. Build your React app (production mode)
2. Package it as Electron app
3. Create installer

**Output:** `client/release/Inventory Management Setup 1.0.0.exe`

### Build for Other Platforms (Optional)

```bash
# Mac (requires Mac computer)
npm run electron-build -- --mac

# Linux
npm run electron-build -- --linux

# All platforms
npm run electron-build -- --win --mac --linux
```

---

## Part 5: Distribute to Client (First Time)

### Step 1: Test the Installer

1. Double-click the `.exe` file
2. Install the app
3. Open it
4. Login with owner credentials
5. Test creating an order
6. Verify images load (set local path in Settings)

Everything working? Great! ✅

### Step 2: Send to Client

**Option A: Direct Transfer**
- Send the `.exe` file via email/USB/cloud
- File size: ~100-150MB

**Option B: Cloud Storage**
- Upload to Google Drive / Dropbox
- Share link with client
- Client downloads and installs

### Step 3: Client Installation

Client should:
1. Download the installer
2. Double-click to install
3. Follow installation wizard
4. Open the app
5. Login with credentials you provide
6. Set their local SKU image folder path

Done! ✅

---

## Part 6: Setup Auto-Updates (For Future Updates)

### Step 1: Create GitHub Repository (if not already)

```bash
# In project root
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/inventory-management-app.git
git push -u origin main
```

### Step 2: Update package.json with GitHub Info

In `client/package.json`, update the "publish" section:

```json
"publish": {
  "provider": "github",
  "owner": "YOUR-GITHUB-USERNAME",
  "repo": "inventory-management-app"
}
```

### Step 3: Generate GitHub Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scope: `repo` (all)
4. Copy token (save it somewhere safe!)

### Step 4: Build and Publish First Release

```bash
cd client

# Set GitHub token (Windows PowerShell)
$env:GH_TOKEN="your-github-token"

# Build and publish
npm run electron-build -- --publish always
```

This will:
1. Build the app
2. Create GitHub Release (v1.0.0)
3. Upload installer automatically

### Step 5: Verify Release

1. Go to your GitHub repository
2. Click "Releases"
3. Should see v1.0.0 with installer file ✅

---

## Part 7: Update Workflow (For Future Updates)

When you need to push updates to client:

### Step 1: Make Your Changes

Edit code, test locally, etc.

### Step 2: Update Version Number

In `client/package.json`:

```json
{
  "version": "1.0.1"  // Increment: 1.0.0 → 1.0.1 → 1.0.2
}
```

### Step 3: Build and Publish

```bash
cd client
$env:GH_TOKEN="your-github-token"
npm run electron-build -- --publish always
```

### Step 4: Client Gets Update Automatically

1. Client opens app
2. App checks GitHub for updates (every startup + hourly)
3. Finds new version (1.0.1)
4. Downloads in background
5. Shows notification: "Update ready"
6. Client clicks "Restart Now"
7. App updates and reopens
8. Done! ✅

Client doesn't need to download anything manually!

---

## Troubleshooting

### Issue: "App won't start"
**Solution:** Check if backend URL is correct in `.env.production`

### Issue: "Images not loading"
**Solution:** Client needs to set local SKU image folder path in Settings

### Issue: "Updates not working"
**Solution:** 
1. Check GitHub token is valid
2. Verify GitHub repo URL in package.json
3. Make sure version number was incremented

### Issue: "MongoDB connection error"
**Solution:**
1. Check connection string is correct
2. Verify password doesn't have special characters
3. Ensure IP whitelist includes 0.0.0.0/0

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Railway (Backend) | Free tier | $0 ($5 credit/month) |
| MongoDB Atlas | M0 Free | $0 (512MB) |
| GitHub | Free | $0 |
| Electron | Open source | $0 |
| **TOTAL** | | **$0/month** ✅ |

---

## Success Checklist

- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas connected
- [ ] Backend API accessible
- [ ] Frontend built successfully
- [ ] Desktop app created (.exe file)
- [ ] App tested locally
- [ ] App sent to client
- [ ] Client installed successfully
- [ ] Client can login
- [ ] Client can create orders
- [ ] GitHub releases setup (for updates)
- [ ] Auto-update tested

---

## Next Steps

1. Follow this checklist step by step
2. Test everything thoroughly
3. Send installer to client
4. Provide them with login credentials
5. Walk them through initial setup (setting image path)
6. You're done! ✅

For updates: Just increment version → build → publish → client gets it automatically!

