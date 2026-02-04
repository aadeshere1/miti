# Miti Chrome Extension

This directory contains the Chrome extension files for Miti - Nepali Calendar.

## Installation Instructions

### From Source (Development)

1. **Build the extension:**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` directory from this project

3. **Open a new tab to see the calendar!**

### Required Icons (T110)

The extension requires icons at the following sizes:
- `icon-16.png` - 16x16 pixels (browser toolbar)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store)

#### Icon Design Notes:
- Should feature a calendar design with Nepali/Bikram Sambat theme
- Use colors: Primary blue (#0066cc), white, with red accents for holidays
- Should be recognizable at small sizes (16x16)
- PNG format with transparency

#### Generating Icons:
You can use any image editing tool to create these icons, or use online tools like:
- Figma
- Canva
- Adobe Illustrator
- GIMP (free)

Place the generated icons in `extension/icons/` directory before building.

## Permissions Explained

The extension requests the following permissions:

- **storage**: Required for localStorage API to save notes, settings, and holiday data. All data stays on your device.
- **newtab**: Replaces the new tab page with the Miti calendar.

## Features

All web app features work identically in the extension:
- ✅ Personal note taking with CRUD operations
- ✅ Month notes overview sidebar
- ✅ Customizable sidebar (position and visibility)
- ✅ Visual date highlighting (weekends and holidays)
- ✅ Theme customization (colors and images)
- ✅ Holiday management from JSON
- ✅ Multi-tab synchronization
- ✅ Data persistence in localStorage

## Privacy

- All data is stored locally in your browser's localStorage
- No data is sent to external servers
- No analytics or tracking
- No ads
- Open source

## Troubleshooting

### Extension doesn't load
- Ensure you've run `npm run build:extension` first
- Check that dist/ directory contains index.html and manifest.json
- Try reloading the extension in chrome://extensions/

### Features not working
- Check browser console for errors (F12)
- Verify localStorage is enabled in Chrome settings
- Try clearing extension storage and reloading

### Icons missing
- Generate or add icon files to extension/icons/
- Re-run `npm run build:extension`
- Reload the extension

## Development

To modify the extension:

1. Make changes to source code in `src/`
2. Run `npm run build:extension`
3. Reload extension in chrome://extensions/ (click reload icon)
4. Open new tab to see changes

## Publishing to Chrome Web Store

1. Create all required icon sizes
2. Run `npm run build:extension`
3. Zip the `dist/` directory
4. Upload to Chrome Web Store Developer Dashboard
5. Fill out store listing with screenshots and description
6. Submit for review

## License

Same as the main Miti project.
