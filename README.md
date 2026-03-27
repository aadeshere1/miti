> [!CAUTION]
> This app is created only for educational purpose using Claude Code and SDD. No part of the code has been audited for security issues. You may try this experimental software, but do so at your own risk. 


# Miti - Nepali Calendar

A beautiful, feature-rich Bikram Sambat (Nepali) calendar application with personal notes, customization, and holiday highlighting. Built with vanilla TypeScript and designed to be lightweight and fast.

## Features

### 📅 Calendar View
- **Nepali Calendar Display**: Full Bikram Sambat calendar with accurate date conversions
- **Month Navigation**: Navigate between months with intuitive controls
- **Today Button**: Quickly return to the current month
- **Dual Date Display**: Shows both Nepali (BS) and English (AD) dates

### 📝 Personal Notes
- **Date-based Notes**: Add, edit, and delete notes for any date
- **Multiple Notes per Date**: Unlimited notes per day with timestamps
- **Note Indicators**: Visual dots on calendar dates with notes
- **Quick Access**: Click any date to view and manage notes
- **Auto-save**: Notes are automatically saved to browser localStorage

### 📊 Month Notes Sidebar
- **Overview**: See all notes for the current month at a glance
- **Quick Navigation**: Click any note to jump to that date
- **Configurable Position**: Place sidebar on left or right side
- **Hide/Show**: Toggle sidebar visibility as needed

### ⚙️ Customization Settings
- **Weekend Configuration**: Set custom weekend days (default: Saturday only)
- **Weekend Highlighting**: Visual indication of weekend dates
- **Holiday Highlighting**: Automatic highlighting of Nepali festivals and holidays
- **Sidebar Configuration**: Control sidebar position and visibility

### 🎨 Theme Customization
- **Color Themes**: Choose custom background colors for your calendar
- **Image Backgrounds**: Set custom background images (URL or file upload)
- **Smart Text Contrast**: Automatic text color adjustment for legibility
- **Smooth Transitions**: Beautiful animations when changing themes

### 🎉 Holiday Management
- **Built-in Holidays**: Pre-loaded with major Nepali festivals
- **JSON Import**: Load custom holiday data from JSON files
- **Holiday Badges**: Visual indication of holidays on the calendar
- **Holiday Info**: See holiday names and descriptions

### 🌐 Chrome Extension
- **New Tab Page**: Replace your new tab with Miti calendar
- **Offline Ready**: Works without internet connection
- **Local Storage**: All data stored securely in your browser

## Installation

### Development Mode

1. Clone the repository:
```bash
git clone <repository-url>
cd miti
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

### Chrome Extension

1. Build the extension:
```bash
npm run build:extension
```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` directory

## Usage

### Adding Notes

1. Click any date on the calendar
2. In the modal, enter your note text
3. Click "Save Note" or press Ctrl/Cmd + Enter
4. Notes are saved automatically

### Editing Notes

1. Click a date with notes
2. Click the edit icon (✏️) next to any note
3. Modify the text
4. Click "Save" to update

### Deleting Notes

1. Click a date with notes
2. Click the delete icon (🗑️) next to any note
3. Note is removed immediately

### Configuring Settings

1. Click the settings icon (⚙️) in the top right
2. Configure your preferences:
   - **Theme**: Choose colors or upload background image
   - **Weekend Days**: Select which days are weekends
   - **Sidebar**: Set position (left/right) and visibility
3. Settings are applied immediately

### Custom Holidays

Create a JSON file following this format:

```json
{
  "2082": [
    {
      "name": "नयाँ वर्ष (New Year)",
      "date": "2082-01-01",
      "description": "Nepali New Year"
    }
  ]
}
```

Place the file in `public/holidays/` and rebuild the application.

## Holiday JSON Format

The holidays JSON file should contain an object with Nepali years as keys. Each year contains an array of holiday objects:

- **name**: Holiday name (preferably in both Nepali and English)
- **date**: Date in YYYY-MM-DD format (Nepali calendar)
- **description**: Brief description of the holiday

See `public/holidays/holidays.json` for a complete example.

## Technical Details

### Technologies Used
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **@remotemerge/nepali-date-converter**: Accurate BS/AD conversion
- **Vanilla JavaScript**: No framework overhead
- **localStorage**: Client-side data persistence

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Minimum: ES2020+ support required

### Storage

All data is stored in browser localStorage:
- `miti:notes:{date}`: Notes for specific dates
- `miti:settings`: User preferences
- `miti:holidays`: Holiday data

Storage limit: ~5-10MB (varies by browser)

### Performance

- Bundle size: ~15KB gzipped (total)
- First load: < 100ms
- Modal open: < 50ms
- Note save: < 10ms

## Project Structure

```
miti/
├── src/
│   ├── calendar/          # Date conversion and calendar logic
│   ├── components/        # UI components (Modal, Grid, etc.)
│   ├── notes/             # Notes storage and modal
│   ├── sidebar/           # Month notes sidebar
│   ├── settings/          # Settings storage and modal
│   ├── theme/             # Theme manager
│   ├── holidays/          # Holiday loader and storage
│   ├── state/             # Application state
│   ├── styles/            # CSS stylesheets
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── main.ts            # Application entry point
├── public/
│   └── holidays/          # Holiday JSON files
├── extension/             # Chrome extension files
│   ├── manifest.json
│   └── icons/
└── index.html             # HTML template
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run build:extension`: Build Chrome extension
- `npm run preview`: Preview production build
- `npm run typecheck`: Run TypeScript type checking

### Adding Features

1. Create new components in `src/components/`
2. Add types in `src/types/`
3. Update main.ts to integrate new features
4. Add tests for new functionality

## Automated Deployment

This project uses **GitHub Actions** to automatically build and deploy to **GitHub Pages** on every push to the `main` branch.

### How Deployment Works

1. **Push to main branch**: Commit and push your changes
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **Automatic build**: GitHub Actions runs the workflow
   - Checks out your code
   - Sets up Node.js environment
   - Installs dependencies
   - Compiles TypeScript and builds with Vite
   - Validates the build succeeds

3. **Automatic deployment**: If build succeeds
   - Uploads the dist/ folder to GitHub Pages
   - Your site updates live within 5 minutes

### Monitoring Deployment

- View deployment status: **GitHub repo → Actions tab**
- Check workflow logs: Click on the workflow run to see detailed logs
- View your live site: https://[username].github.io/[repository]/

### Build Failures

If the build fails:
- The workflow stops automatically
- GitHub Pages is NOT updated (previous version remains live)
- Check the Actions tab logs to see what failed
- Common issues: TypeScript errors, missing dependencies
- Fix the issue and push again

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

## Acknowledgments

- [@remotemerge/nepali-date-converter](https://www.npmjs.com/package/@remotemerge/nepali-date-converter) for accurate date conversions
- Nepali calendar community for holiday data

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

Built with ❤️ for the Nepali community
