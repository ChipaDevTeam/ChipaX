# EVEDEX Local Assets - Usage Guide

## Overview
This directory contains all downloaded assets from the EVEDEX cryptocurrency exchange website for local development and testing.

## Directory Structure
```
evedex_assets/
├── apple-touch-icon.png
├── favicon-16x16.png
├── favicon-32x32.png
├── evedex_local.html          # Ready-to-use local HTML file
├── assets/
│   ├── *.js                   # JavaScript bundles
│   ├── *.css                  # Stylesheets
│   ├── *.woff / *.woff2       # Font files
│   ├── *.png / *.jpg / *.webp # Images
│   └── fonts/                 # Font directories
└── trading_platform/
    └── charting_library/
        └── charting_library.js

```

## Files Downloaded

### Primary Assets (11 files)
- Core JavaScript bundles (React, Wagmi, charting library)
- Main CSS stylesheet
- Font stylesheets (Stapel, Digital Numbers)
- Favicon and app icons

### Secondary Assets (100+ files)
- JavaScript modules and dependencies
- Font files (IBM Plex Sans, Montserrat - multiple weights and languages)
- Images (PNG, JPG, WebP)
- UI assets (icons, illustrations, backgrounds)

## How to Use

### Method 1: Simple Local Server
```powershell
# Navigate to the assets directory
cd e:\chipa\ChipaX\tests\evedex_assets

# Start a simple HTTP server (Python required)
python -m http.server 8000

# Open in browser: http://localhost:8000/evedex_local.html
```

### Method 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Open `evedex_local.html`
3. Right-click and select "Open with Live Server"

### Method 3: Direct File Access
Simply open `evedex_local.html` in your browser (some features may not work due to CORS)

## Scripts Available

### 1. `download_evedex_complete.ps1` (Recommended)
**Master script** - Downloads everything in one go
```powershell
.\download_evedex_complete.ps1
```

Options:
- `-Force` - Re-download files even if they exist

### 2. `download_evedex_assets.ps1`
Original script for primary assets only

### 3. `download_all_evedex_assets.ps1`
Downloads primary + discovered dependencies

### 4. `download_recursive_assets.ps1`
Recursively discovers and downloads all dependencies

### 5. `download_missing_modules.ps1`
Downloads specific missing modules

## Known Limitations

### 1. Backend API Dependencies
The website requires backend API calls for:
- User authentication
- Live trading data
- Real-time price updates
- Wallet connections
- Transaction history

**These will NOT work locally** without backend access.

### 2. Missing Assets
Some font variants returned 404 errors (alternate versions exist):
- Specific woff file variants (fallback fonts will be used)
- `ethers.js` (loaded dynamically if needed)

### 3. Content Security Policy
Some features are blocked by CSP when running locally:
- External frame embedding (auth.evedex.com)
- Third-party scripts

### 4. Dynamic Imports
JavaScript may attempt to load additional modules at runtime based on:
- User actions
- Route changes
- Feature usage

## File Statistics

**Total Downloaded:**
- ~150+ files
- Size: ~7-10 MB
- Includes: JS, CSS, fonts, images

**Coverage:**
- ✓ Complete UI assets
- ✓ All fonts and styles
- ✓ JavaScript bundles
- ✓ Static images
- ✗ Backend APIs
- ✗ Real-time data

## Troubleshooting

### Issue: CSS/JS files not loading
**Solution:** Ensure you're using a proper web server (not file:// protocol)

### Issue: Fonts showing 404 errors
**Solution:** Normal - fallback fonts will be used. Missing variants don't exist on server.

### Issue: Blank page or errors
**Solution:** 
1. Check browser console for specific errors
2. Ensure all primary JS files downloaded successfully
3. Check network tab for failed requests

### Issue: "Unable to preload CSS" errors
**Solution:** Run the download script again to get any missing dynamic imports

## Re-downloading Assets

To refresh all assets:
```powershell
.\download_evedex_complete.ps1 -Force
```

To download only missing files:
```powershell
.\download_evedex_complete.ps1
```

## Integration Tips

### Using with ChipaX Trading Library
You can integrate these assets with your existing charting library:

```html
<!-- In your HTML -->
<script src="./evedex_assets/trading_platform/charting_library/charting_library.js"></script>
<link rel="stylesheet" href="./evedex_assets/assets/index-CbX4KGWS.css">
```

### Custom Modifications
To customize the local version:
1. Edit `evedex_local.html`
2. Modify asset paths as needed
3. Add your own scripts/styles

## Notes

- **Update Frequency:** Assets may change on the live site. Re-run download scripts periodically.
- **Version Control:** Consider adding `evedex_assets/` to `.gitignore` due to size.
- **License:** Assets belong to EVEDEX. Use only for local development/testing.

## Support

For issues with:
- **Download scripts:** Check PowerShell execution policy and internet connection
- **Asset loading:** Verify web server is running and paths are correct
- **Functionality:** Remember that backend-dependent features won't work offline

---

Last Updated: December 10, 2025
Generated by: EVEDEX Asset Downloader Scripts
