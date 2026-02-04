# Quickstart Guide: Calendar Month View

**Feature**: 001-calendar-month-view
**Date**: 2026-02-04
**Branch**: `001-calendar-month-view`

## Overview

This guide provides step-by-step instructions to set up the development environment, build, and test the Nepali calendar month view feature.

## Prerequisites

- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)
- **Code Editor**: VS Code recommended (with TypeScript support)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# If starting fresh (new project)
npm init -y

# Install core dependencies
npm install @remotemerge/nepali-date-converter

# Install TypeScript and build tools
npm install --save-dev typescript vite

# Install type definitions (if needed)
npm install --save-dev @types/node
```

### 2. Initialize TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "importHelpers": true,
    "removeComments": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 4. Set Up Project Structure

```bash
# Create directory structure
mkdir -p src/calendar
mkdir -p src/components
mkdir -p src/state
mkdir -p src/styles

# Create entry files
touch src/index.html
touch src/main.ts
touch src/styles/global.css
touch src/styles/calendar.css
```

### 5. Create Entry HTML

Create `src/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Miti - Nepali Calendar</title>
  <link rel="stylesheet" href="/src/styles/global.css">
  <link rel="stylesheet" href="/src/styles/calendar.css">
</head>
<body>
  <div id="app">
    <div class="calendar-container">
      <div class="calendar-header">
        <button id="prev-month" class="nav-button">‹</button>
        <h1 id="month-year" class="month-title"></h1>
        <button id="next-month" class="nav-button">›</button>
      </div>
      <div class="weekday-headers" id="weekday-headers"></div>
      <div class="calendar-grid" id="calendar-grid"></div>
      <button id="today-button" class="today-button">Today</button>
    </div>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 6. Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

- Opens browser at http://localhost:3000
- Hot module replacement (HMR) enabled
- TypeScript errors shown in terminal

### Type Check

```bash
npm run typecheck
```

- Validates TypeScript without building
- Catches type errors early

### Build for Production

```bash
npm run build
```

- Compiles TypeScript to JavaScript
- Bundles with Vite
- Minifies output
- Output in `dist/` directory

**Expected bundle size**: ~10-15 KB gzipped (well under 200KB budget)

### Preview Production Build

```bash
npm run preview
```

- Serves production build locally
- Test final optimized version

## Implementation Order

Follow this sequence for implementing the feature:

### Phase 1: Core Calendar Logic

1. **Implement `src/calendar/conversions.ts`**:
   ```typescript
   import nepaliDateConverter from '@remotemerge/nepali-date-converter';

   export function convertGregorianToNepali(date: Date): NepaliDate {
     // Use library to convert
   }

   export function convertNepaliToGregorian(nepaliDate: NepaliDate): Date {
     // Use library to convert
   }
   ```

2. **Implement `src/calendar/calendar-data.ts`**:
   ```typescript
   export function getNepaliMonthName(month: number): string {
     // Return month name
   }

   export function getNepaliMonthDays(year: number, month: number): number {
     // Use library to get month length
   }
   ```

3. **Implement `src/calendar/date-utils.ts`**:
   ```typescript
   export function adjustMonth(date: Date, offset: number): Date {
     // Adjust month with year boundary handling
   }

   export function isSameDay(date1: Date, date2: Date): boolean {
     // Compare dates
   }
   ```

### Phase 2: State Management

4. **Implement `src/state/calendar-state.ts`**:
   ```typescript
   interface CalendarState {
     currentMonth: Date;
     today: Date;
     selectedDate: Date | null;
   }

   let state: CalendarState = {
     currentMonth: new Date(),
     today: new Date(),
     selectedDate: null
   };

   export function getState(): CalendarState {
     return state;
   }

   export function navigateToNextMonth(): void {
     // Update state and trigger render
   }
   ```

### Phase 3: Calendar Grid Generation

5. **Implement `src/components/CalendarGrid.ts`**:
   ```typescript
   export function generateCalendarGrid(currentMonth: Date): CalendarMonth {
     // Convert to Nepali date
     // Generate 35-42 DateCell objects
     // Mark today and current month
   }

   export function renderCalendarGrid(calendarMonth: CalendarMonth): void {
     // Update DOM with calendar cells
   }
   ```

### Phase 4: UI Components

6. **Implement `src/components/MonthHeader.ts`**:
   ```typescript
   export function renderMonthHeader(nepaliMonth: number, nepaliYear: number): void {
     // Update month/year display
   }
   ```

7. **Implement `src/components/WeekdayHeaders.ts`**:
   ```typescript
   export function renderWeekdayHeaders(): void {
     // Render Sun-Sat headers
   }
   ```

### Phase 5: Application Entry

8. **Implement `src/main.ts`**:
   ```typescript
   import { navigateToNextMonth, navigateToPreviousMonth, navigateToToday } from './state/calendar-state';
   import { renderCalendarGrid, generateCalendarGrid } from './components/CalendarGrid';

   function init() {
     // Set up event listeners
     // Render initial calendar
   }

   init();
   ```

### Phase 6: Styling

9. **Implement `src/styles/global.css`**:
   - Base styles and resets
   - Typography
   - Layout container

10. **Implement `src/styles/calendar.css`**:
    - CSS Grid layout (7 columns)
    - Date cell styling
    - Today highlighting
    - Navigation buttons

## Testing

### Manual Calendar Accuracy Testing

**Required per constitution**: Validate date conversions against official Nepali calendar.

#### Test Cases

1. **Current Date Accuracy**:
   - Open calendar on today's date
   - Compare Nepali date with https://www.hamropatro.com
   - Verify day of week matches

2. **Month Navigation**:
   - Navigate 6 months forward
   - Navigate 6 months backward
   - Verify all dates accurate at each step

3. **Year Boundary**:
   - Navigate from Chaitra (month 12) to Baishakh (month 1)
   - Verify year increments correctly
   - Navigate backward and verify year decrements

4. **Sample Date Conversions**:
   ```
   Test these known conversions:
   - 2026-02-04 AD = 2082-10-22 BS (Magh 22, 2082)
   - 2026-04-14 AD = 2083-01-01 BS (Baishakh 1, 2083)
   - 2025-01-01 AD = 2081-09-17 BS (Poush 17, 2081)
   ```

5. **Month Length Variations**:
   - Verify Magh 2082 has correct number of days
   - Check different months have 29-32 days as expected

### Cross-Browser Testing

Test in all target browsers:

| Browser | Version | Test Items |
|---------|---------|------------|
| Chrome | Latest 2 | Full functionality, CSS Grid, performance |
| Firefox | Latest 2 | Full functionality, date calculations |
| Safari | Latest 2 | Full functionality, iOS compatibility |
| Edge | Latest 2 | Full functionality, rendering |

**Test on mobile devices**:
- iOS Safari 14+
- Chrome Mobile (latest)
- Responsive layout at 320px, 768px, 1024px widths

### Performance Testing

Validate performance budgets:

```javascript
// In browser console
console.time('render');
// Trigger calendar render
console.timeEnd('render');
// Should be <100ms

console.time('navigation');
// Click next/previous month
console.timeEnd('navigation');
// Should be <16ms
```

**Bundle Size Check**:
```bash
npm run build
ls -lh dist/*.js | awk '{print $5}'
gzip -k dist/*.js && ls -lh dist/*.js.gz | awk '{print $5}'
# Should be ~10-15 KB gzipped
```

## Debugging

### TypeScript Errors

```bash
npm run typecheck
```

Common issues:
- Missing type definitions: `npm install --save-dev @types/[package]`
- Type mismatches in date conversions: check NepaliDate interface
- Import errors: verify module paths

### Runtime Errors

Use browser DevTools:
- **Console**: Check for JavaScript errors
- **Network**: Verify all files load (should be single bundle)
- **Performance**: Profile render performance
- **Elements**: Inspect calendar DOM structure

### Date Conversion Issues

If dates don't match official calendar:
1. Check library version: `npm list @remotemerge/nepali-date-converter`
2. Verify date is in supported range (1975-2099 BS)
3. Test bidirectional conversion: `convertNepaliToGregorian(convertGregorianToNepali(date))`
4. Report issue to library maintainers if persistent

## Common Issues

### Issue: Calendar Not Rendering

**Symptoms**: Blank screen, no calendar visible

**Solutions**:
- Check browser console for errors
- Verify `src/main.ts` is calling render functions
- Check CSS Grid is applied to `.calendar-grid`
- Ensure HTML elements have correct IDs

### Issue: Dates Don't Update on Navigation

**Symptoms**: Clicking next/previous month doesn't change calendar

**Solutions**:
- Verify event listeners are attached in `main.ts`
- Check state is updating in `calendar-state.ts`
- Ensure render function is called after state update
- Debug with console.log in navigation functions

### Issue: Performance is Slow

**Symptoms**: Render takes >100ms, navigation is laggy

**Solutions**:
- Profile in browser DevTools Performance tab
- Check date conversion loop (should be <42 iterations)
- Verify no accidental N² algorithms
- Minimize DOM manipulations (batch updates)

### Issue: Bundle Size Too Large

**Symptoms**: dist/*.js.gz >15 KB

**Solutions**:
- Check for accidental dependencies: `npm ls`
- Verify tree-shaking is enabled in vite.config.ts
- Remove unused imports
- Use production build: `npm run build` (not dev)

## Production Deployment

### Build Steps

```bash
# 1. Type check
npm run typecheck

# 2. Build production bundle
npm run build

# 3. Test production bundle locally
npm run preview

# 4. Deploy dist/ directory to hosting
# (Netlify, Vercel, GitHub Pages, etc.)
```

### Static Hosting

The app is pure static files - deploy `dist/` directory to:

- **Netlify**: Drag-and-drop `dist/` folder
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Push `dist/` to gh-pages branch
- **Any web server**: Serve `dist/` directory

No server-side configuration needed (offline-first architecture).

### Post-Deployment Validation

1. Open deployed URL
2. Run manual accuracy test suite (compare with hamropatro.com)
3. Test navigation in all directions
4. Check bundle loads quickly (<1 second)
5. Verify works offline (disable network in DevTools)

## Additional Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [@remotemerge/nepali-date-converter](https://www.npmjs.com/package/@remotemerge/nepali-date-converter)
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Nepali Calendar References

- [Hamro Patro](https://www.hamropatro.com) - Official calendar reference
- [Nepal Calendar](https://www.nepalicalendar.rat32.com) - Validation source
- [Wikipedia: Nepali Calendar](https://en.wikipedia.org/wiki/Nepali_calendar) - Background info

### VS Code Extensions (Recommended)

- **TypeScript**: Built-in
- **Vite**: Vite extension for better HMR
- **Prettier**: Code formatting
- **ESLint**: Linting (optional)

## Support

For issues specific to this feature:
- Check [specs/001-calendar-month-view/](.) for design docs
- Review constitution at [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

For library-specific issues:
- [@remotemerge/nepali-date-converter GitHub](https://github.com/remotemerge/nepali-date-converter)

## Next Steps

After completing this feature:
1. Run `/speckit.tasks` to generate implementation task list
2. Follow tasks in dependency order
3. Commit regularly after each completed task
4. Run manual testing checklist before marking feature complete
