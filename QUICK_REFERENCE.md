# 🚀 Quick Reference - Desktop App Deployment

## One-Time Setup Commands

```bash
# 1. Install dependencies
cd client
npm install electron electron-is-dev electron-builder electron-updater concurrently wait-on cross-env --save-dev

# 2. Test locally
npm run electron-dev

# 3. Build desktop app
npm run dist
```

**Output:** `client/release/Inventory Management Setup 1.0.0.exe`

---

## Update & Release Workflow

Every time you want to push updates to client:

```bash
# 1. Update version in client/package.json
# Change: "version": "1.0.0" → "1.0.1"

# 2. Set GitHub token (Windows)
$env:GH_TOKEN="your-github-token-here"

# 3. Build and publish
cd client
npm run electron-build -- --publish always
```

**Result:** 
- New GitHub Release created
- Installer uploaded automatically
- Client app auto-updates next time they open it ✅

---

## Backend Deployment (Railway)

1. **Deploy:** Push to GitHub → Railway auto-deploys
2. **Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   NODE_ENV=production
   ```
3. **URL:** `https://your-app.up.railway.app`

---

## Environment Files

### `.env.production` (client)
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

### `.env` (server)
```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/inventory-management
NODE_ENV=production
```

---

## Build Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run dev server (Vite) |
| `npm run electron-dev` | Run desktop app in dev mode |
| `npm run build` | Build React app only |
| `npm run electron-build` | Build desktop app (no publish) |
| `npm run dist` | Build desktop app for Windows |
| `npm run electron-build -- --publish always` | Build + upload to GitHub |

---

## Version Numbering

Format: `MAJOR.MINOR.PATCH`

- **Major (1.x.x):** Breaking changes, big features
- **Minor (x.1.x):** New features, no breaking changes
- **Patch (x.x.1):** Bug fixes, small tweaks

Examples:
- `1.0.0` → Initial release
- `1.0.1` → Bug fix
- `1.1.0` → New feature added
- `2.0.0` → Major redesign

---

## Free Hosting Limits

| Service | Free Tier Limit |
|---------|----------------|
| **Railway** | $5 credit/month (~500 hours) |
| **MongoDB Atlas** | 512MB storage (M0) |
| **GitHub Releases** | Unlimited |
| **Bandwidth** | Unlimited (Railway) |

**Recommendation:** This is more than enough for 10-50 users!

---

## GitHub Release Process

### Manual Release (Alternative)

1. Go to GitHub → Releases → "Create new release"
2. Tag: `v1.0.1`
3. Title: "Version 1.0.1"
4. Description: List changes
5. Upload `.exe` file
6. Publish

### Automatic Release (Recommended)

```bash
npm run electron-build -- --publish always
```

Done! Release created automatically ✅

---

## Client Installation (First Time)

**Send to client:**
1. `Inventory Management Setup 1.0.0.exe` (from `client/release`)
2. Login credentials (username + password)

**Client does:**
1. Double-click installer
2. Follow wizard
3. Open app
4. Login
5. Go to Settings → Set local image folder path
6. Done!

---

## Client Updates (Automatic)

**You:** Build and publish new version  
**Client:** Opens app → Sees "Update available" → Clicks "Restart" → Updated! ✅

No manual download needed!

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **Build fails** | Delete `node_modules`, run `npm install` |
| **App won't start** | Check backend URL in `.env.production` |
| **Images not loading** | Client needs to set local path in Settings |
| **Updates not working** | Check GitHub token, verify version incremented |
| **Backend error** | Check Railway logs, verify MongoDB connection |

---

## Important URLs

- **Railway Dashboard:** https://railway.app/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Releases:** https://github.com/YOUR-USERNAME/YOUR-REPO/releases
- **Icon Converter:** https://convertio.co/png-ico/

---

## Default Credentials

After deployment, log in with:
- **Username:** `owner`
- **Password:** `owner123`

**⚠️ Important:** Change password after first login!

---

## File Sizes

- **Installer (.exe):** ~100-150 MB
- **Backend API:** ~20 MB
- **MongoDB:** Starts at <1 MB, grows with data

---

## Support for Client

Create a simple guide for your client:

```
1. Install app (double-click setup file)
2. Open "Inventory Management" from desktop
3. Login with provided credentials
4. Go to Settings → General
5. Set "SKU Image Folder Path" to your images folder
6. Done! Start using the app
```

For updates:
```
When you see "Update available" notification:
1. Click "Restart Now"
2. App will update automatically
3. Reopens with new features
```

---

## Backup & Recovery

**Database Backups (MongoDB Atlas):**
- Free tier: No automatic backups
- Recommendation: Use Activity Log for audit trail
- Can export data manually if needed

**Code Backups:**
- GitHub automatically backs up all code
- All releases preserved forever
- Can roll back to any version

---

## Performance Tips

**For Better Performance:**
1. Use Railway Pro ($5/month) for more uptime
2. Index frequently queried fields in MongoDB
3. Enable compression on backend (already done)
4. Use CDN for static assets (optional)

**Current Setup Should Handle:**
- 10-20 concurrent users ✅
- 1000s of orders ✅
- 100s of images ✅

---

## Security Checklist

- [x] User authentication required
- [x] Password hashing (bcrypt)
- [x] HTTPS on backend (Railway provides)
- [x] Environment variables for secrets
- [x] CORS configured
- [x] Audit logging enabled
- [x] Version conflict detection

**Status: Production Ready** ✅

---

## Contact Info for Client

Provide your client with:
- Your email/phone for support
- Link to this guide
- Login credentials
- Backend URL (for reference)

---

## Summary

✅ **Desktop app** - Professional, installable software  
✅ **Auto-updates** - Client never manually downloads updates  
✅ **Free hosting** - $0/month for backend + database  
✅ **Easy maintenance** - Just increment version and publish  
✅ **Multi-user ready** - Data consistency protections in place  
✅ **Audit trail** - Complete activity logging  

**You're ready to ship!** 🚀

