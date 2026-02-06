# Data Model: Calendar Month View

**Feature**: 001-calendar-month-view
**Date**: 2026-02-04
**Status**: Complete

## Overview

This document defines the data structures and entities used in the Nepali calendar month view implementation. All entities are designed for client-side browser execution with no backend persistence.

## Core Entities

### 1. CalendarState

The root state object representing the current calendar view.

```typescript
interface CalendarState {
  // Current month being displayed (Gregorian Date object for calculation)
  currentMonth: Date;

  // Currently selected date (if any) - null for view-only initial implementation
  selectedDate: Date | null;

  // Current date (today) for highlighting - updated on app load
  today: Date;
}
```

**Relationships:**
- Root state object (no parent)
- Contains the Date values that drive calendar rendering

**Validation Rules:**
- `currentMonth` MUST be a valid JavaScript Date object
- `today` MUST be set to system date on initialization
- `selectedDate` is nullable (selection not implemented in this feature)

**State Transitions:**
- Month navigation: `currentMonth` updates to previous/next month
- Today navigation: `currentMonth` resets to month containing `today`
- No persistence: state resets on page reload

### 2. NepaliDate

Represents a specific date in the Bikram Sambat calendar.

```typescript
interface NepaliDate {
  // Nepali year (Bikram Sambat)
  year: number;        // e.g., 2082

  // Nepali month (1-12)
  month: number;       // 1=Baishakh, 2=Jestha, ..., 12=Chaitra

  // Nepali day of month (1-32, varies by month/year)
  day: number;         // 1-32

  // Day of week (0-6, 0=Sunday, 6=Saturday)
  dayOfWeek: number;   // 0-6
}
```

**Relationships:**
- Maps to exactly one `GregorianDate` (bidirectional conversion)
- Used by `DateCell` to display Nepali date

**Validation Rules:**
- `year` MUST be in supported range (1975-2099 BS per library)
- `month` MUST be 1-12
- `day` MUST be valid for the specific month/year (29-32 days)
- `dayOfWeek` MUST be 0-6

**Data Source:**
- Converted from Gregorian Date using @remotemerge/nepali-date-converter library

### 3. GregorianDate

Represents a date in the Gregorian (Western) calendar.

```typescript
interface GregorianDate {
  // Gregorian year
  year: number;        // e.g., 2026

  // Gregorian month (1-12)
  month: number;       // 1=January, 2=February, ..., 12=December

  // Gregorian day of month (1-31)
  day: number;         // 1-31

  // Day of week (0-6, 0=Sunday, 6=Saturday)
  dayOfWeek: number;   // 0-6
}
```

**Relationships:**
- Maps to exactly one `NepaliDate` (bidirectional conversion)
- Used by `DateCell` to display Gregorian date in bottom right

**Validation Rules:**
- Standard Gregorian calendar rules
- JavaScript Date object is the source of truth

**Data Source:**
- Native JavaScript Date API

### 4. DateCell

Represents a single cell in the calendar grid, containing both Nepali and Gregorian date information.

```typescript
interface DateCell {
  // Nepali date for this cell
  nepaliDate: NepaliDate;

  // Corresponding Gregorian date
  gregorianDate: GregorianDate;

  // Whether this cell is the current date (today)
  isToday: boolean;

  // Whether this date belongs to the currently displayed month
  isCurrentMonth: boolean;

  // Whether this cell is empty (leading/trailing days from other months)
  // For initial implementation, show dimmed dates from adjacent months
  isEmpty: boolean;
}
```

**Relationships:**
- Contains one `NepaliDate` and one `GregorianDate`
- Part of `CalendarMonth` grid

**Validation Rules:**
- `nepaliDate` and `gregorianDate` MUST be accurate conversions of each other
- `isToday` MUST be true for exactly one cell per grid (or zero if today is in different month)
- `isCurrentMonth` MUST be true for dates in the displayed Nepali month

**Rendering Rules:**
- Nepali date displayed prominently (larger font, center)
- Gregorian date displayed in bottom right (smaller font, gray)
- Today's cell has visual distinction (border, highlight, or background color)
- Cells with `isCurrentMonth=false` are dimmed or grayed out

### 5. CalendarMonth

Represents a complete calendar month grid with all date cells.

```typescript
interface CalendarMonth {
  // Nepali month being displayed
  nepaliMonth: number;      // 1-12

  // Nepali year being displayed
  nepaliYear: number;       // e.g., 2082

  // English month name for display
  monthName: string;        // "Magh", "Falgun", etc.

  // Grid of date cells (typically 35-42 cells for 5-6 weeks)
  cells: DateCell[];        // Array of 35-42 cells

  // Starting day of week for this month (0=Sunday)
  startDayOfWeek: number;   // 0-6

  // Number of days in this Nepali month
  daysInMonth: number;      // 29-32 (varies by year/month)
}
```

**Relationships:**
- Contains array of `DateCell` objects (35-42 cells for complete grid)
- Represents one month view in the calendar

**Validation Rules:**
- `cells` MUST contain exactly 35 or 42 elements (5 or 6 weeks × 7 days)
- `daysInMonth` MUST match actual Nepali calendar for that month/year
- `monthName` MUST be one of 12 Nepali month names
- First cell with `isCurrentMonth=true` MUST appear in column `startDayOfWeek`

**Generation Rules:**
1. Calculate first day of Nepali month and convert to Gregorian
2. Determine starting day of week
3. Fill leading days from previous month (dimmed)
4. Fill current month days (highlighted)
5. Fill trailing days from next month (dimmed) to complete grid

### 6. MonthNavigation

Represents navigation controls and current month display.

```typescript
interface MonthNavigation {
  // Display text for current month/year (e.g., "Magh 2082")
  displayText: string;

  // Whether previous month navigation is available
  canNavigatePrevious: boolean;

  // Whether next month navigation is available
  canNavigateNext: boolean;

  // Handler for previous month click
  onPreviousMonth: () => void;

  // Handler for next month click
  onNextMonth: () => void;

  // Handler for "Today" / "Current month" click
  onToday: () => void;
}
```

**Relationships:**
- Controls `CalendarState.currentMonth` updates
- Triggers calendar re-render on navigation

**Validation Rules:**
- `displayText` MUST reflect current Nepali month and year
- Navigation handlers MUST update `CalendarState` and trigger render

**Behavior:**
- Previous/Next buttons adjust month by ±1 Nepali month (handle year boundaries)
- Today button resets to current month

## Data Flow

### Initialization Flow

```
1. App starts
   ↓
2. Initialize CalendarState with:
   - currentMonth = new Date() (system date)
   - today = new Date()
   - selectedDate = null
   ↓
3. Generate CalendarMonth from currentMonth
   ↓
4. Render calendar grid with DateCells
```

### Navigation Flow

```
1. User clicks Previous/Next button
   ↓
2. Update CalendarState.currentMonth (±1 month)
   ↓
3. Re-generate CalendarMonth for new month
   ↓
4. Re-render calendar grid
   (Performance budget: complete in <16ms)
```

### Date Conversion Flow

```
1. For each day in month (29-32 days):
   ↓
2. Create Gregorian Date object
   ↓
3. Convert to NepaliDate using library:
   nepaliDateConverter.gregorianToNepali(date)
   ↓
4. Create DateCell with both dates
   ↓
5. Add to CalendarMonth.cells array
```

## Month Name Mapping

Nepali month numbers to English transliterated names:

```typescript
const NEPALI_MONTHS: Record<number, string> = {
  1: "Baishakh",   // बैशाख (mid-April to mid-May)
  2: "Jestha",     // जेष्ठ (mid-May to mid-June)
  3: "Ashadh",     // असार (mid-June to mid-July)
  4: "Shrawan",    // श्रावण (mid-July to mid-August)
  5: "Bhadra",     // भाद्र (mid-August to mid-September)
  6: "Ashwin",     // आश्विन (mid-September to mid-October)
  7: "Kartik",     // कार्तिक (mid-October to mid-November)
  8: "Mangsir",    // मंसिर (mid-November to mid-December)
  9: "Poush",      // पौष (mid-December to mid-January)
  10: "Magh",      // माघ (mid-January to mid-February)
  11: "Falgun",    // फाल्गुण (mid-February to mid-March)
  12: "Chaitra"    // चैत्र (mid-March to mid-April)
};
```

## Weekday Name Mapping

Day of week numbers to English abbreviations:

```typescript
const WEEKDAY_NAMES: string[] = [
  "Sun",  // 0
  "Mon",  // 1
  "Tue",  // 2
  "Wed",  // 3
  "Thu",  // 4
  "Fri",  // 5
  "Sat"   // 6
];
```

## Persistence

**No persistence required for this feature:**
- All state is ephemeral (resets on page reload)
- No user preferences saved
- No backend storage
- No localStorage/sessionStorage usage

Future features may add:
- Preferred language (English/Nepali)
- Week start day (Sunday/Monday)
- Theme/color preferences

## Performance Considerations

**Memory Usage:**
- CalendarState: ~100 bytes
- CalendarMonth with 42 DateCells: ~5-10 KB
- Total in-memory data: <50 KB (well under 50MB budget)

**Computation:**
- Date conversions: 35-42 per month render
- Library performance: <1ms per conversion (well under 10ms budget)
- Total render time: <50ms (well under 100ms budget)

## Type Safety

All entities defined as TypeScript interfaces ensure:
- Compile-time validation of date operations
- Prevention of invalid month/day values
- IntelliSense support in development
- Safe refactoring

## Summary

The data model is intentionally simple:
- Core state: one `CalendarState` object
- Display: one `CalendarMonth` with array of `DateCell`
- Navigation: handlers update state and trigger re-render
- No complex relationships or cascading updates
- Aligns with Simplicity & Maintainability principle
