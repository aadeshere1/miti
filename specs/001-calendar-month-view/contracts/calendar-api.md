# Internal API Contracts: Calendar Month View

**Feature**: 001-calendar-month-view
**Date**: 2026-02-04
**Purpose**: Define interfaces between calendar calculation logic and UI rendering

## Overview

This document defines the contracts (interfaces) between internal modules. The architecture separates:
- **Calendar Logic** (`src/calendar/`): Pure functions for date conversions and calculations
- **UI Components** (`src/components/`): Rendering and user interaction
- **State Management** (`src/state/`): Application state and updates

All contracts are TypeScript interfaces compiled away at build time (zero runtime overhead).

## Module: calendar/conversions

### convertGregorianToNepali()

Converts a Gregorian date to Nepali (Bikram Sambat) date.

**Contract:**
```typescript
function convertGregorianToNepali(gregorianDate: Date): NepaliDate
```

**Input:**
- `gregorianDate`: JavaScript Date object (any valid Gregorian date)

**Output:**
- `NepaliDate` object with { year, month, day, dayOfWeek }

**Behavior:**
- Uses @remotemerge/nepali-date-converter library internally
- Throws error if date is outside supported range (1975-2099 BS)
- MUST complete in <10ms (performance budget)
- MUST produce 100% accurate conversions (validated against official calendar)

**Error Cases:**
```typescript
// Out of range date
throw new Error("Date outside supported range (1975-2099 BS)");

// Invalid date
throw new Error("Invalid Gregorian date");
```

**Example:**
```typescript
const gregorianDate = new Date(2026, 1, 4); // Feb 4, 2026
const nepaliDate = convertGregorianToNepali(gregorianDate);
// Returns: { year: 2082, month: 10, day: 22, dayOfWeek: 3 }
```

### convertNepaliToGregorian()

Converts a Nepali (Bikram Sambat) date to Gregorian date.

**Contract:**
```typescript
function convertNepaliToGregorian(nepaliDate: NepaliDate): Date
```

**Input:**
- `nepaliDate`: NepaliDate object with { year, month, day }

**Output:**
- JavaScript Date object

**Behavior:**
- Uses @remotemerge/nepali-date-converter library internally
- Throws error if Nepali date is invalid (e.g., day 33 in a 30-day month)
- MUST complete in <10ms (performance budget)
- Bidirectional consistency: `convertNepaliToGregorian(convertGregorianToNepali(date)) === date`

**Error Cases:**
```typescript
// Invalid Nepali date (day exceeds month length)
throw new Error("Invalid day for month: month 10 has 29 days in year 2082");

// Out of range
throw new Error("Nepali year outside supported range (1975-2099 BS)");
```

**Example:**
```typescript
const nepaliDate = { year: 2082, month: 10, day: 22 };
const gregorianDate = convertNepaliToGregorian(nepaliDate);
// Returns: Date object for Feb 4, 2026
```

### getNepaliMonthName()

Returns English transliterated name for a Nepali month number.

**Contract:**
```typescript
function getNepaliMonthName(month: number): string
```

**Input:**
- `month`: Nepali month number (1-12)

**Output:**
- English month name string ("Baishakh", "Jestha", etc.)

**Behavior:**
- Simple lookup from NEPALI_MONTHS mapping
- MUST complete in <1ms (O(1) lookup)

**Error Cases:**
```typescript
// Invalid month number
throw new Error("Month must be between 1 and 12");
```

**Example:**
```typescript
getNepaliMonthName(10); // Returns "Magh"
getNepaliMonthName(1);  // Returns "Baishakh"
```

## Module: calendar/calendar-data

### getNepaliMonthDays()

Returns the number of days in a specific Nepali month/year.

**Contract:**
```typescript
function getNepaliMonthDays(year: number, month: number): number
```

**Input:**
- `year`: Nepali year (1975-2099 BS)
- `month`: Nepali month (1-12)

**Output:**
- Number of days (29-32)

**Behavior:**
- Queries @remotemerge/nepali-date-converter library's internal data
- Month lengths vary by year (unlike Gregorian calendar)
- MUST be 100% accurate per official Nepali calendar

**Error Cases:**
```typescript
// Out of range
throw new Error("Year/month outside supported range");
```

**Example:**
```typescript
getNepaliMonthDays(2082, 10);  // Returns 29 (Magh has 29 days in 2082)
getNepaliMonthDays(2082, 1);   // Returns 31 (Baishakh has 31 days in 2082)
```

### getFirstDayOfNepaliMonth()

Returns the day of week for the first day of a Nepali month.

**Contract:**
```typescript
function getFirstDayOfNepaliMonth(year: number, month: number): number
```

**Input:**
- `year`: Nepali year
- `month`: Nepali month (1-12)

**Output:**
- Day of week (0-6, 0=Sunday)

**Behavior:**
- Converts Nepali date (year, month, 1) to Gregorian
- Extracts day of week from Gregorian Date object
- Used to determine grid alignment

**Example:**
```typescript
getFirstDayOfNepaliMonth(2082, 10);  // Returns 0 (if Magh 1 falls on Sunday)
```

## Module: calendar/date-utils

### adjustMonth()

Adjusts a Date object by a number of months.

**Contract:**
```typescript
function adjustMonth(date: Date, offset: number): Date
```

**Input:**
- `date`: Base date
- `offset`: Number of months to add (negative for previous months)

**Output:**
- New Date object with adjusted month

**Behavior:**
- Handles year boundaries (December → January, January → December)
- Returns new Date (immutable - does not modify input)
- MUST complete in <1ms

**Example:**
```typescript
const date = new Date(2026, 1, 4);  // Feb 4, 2026
adjustMonth(date, 1);   // Returns Mar 4, 2026
adjustMonth(date, -1);  // Returns Jan 4, 2026
adjustMonth(date, 12);  // Returns Feb 4, 2027
```

### isSameDay()

Checks if two dates represent the same calendar day.

**Contract:**
```typescript
function isSameDay(date1: Date, date2: Date): boolean
```

**Input:**
- `date1`: First date
- `date2`: Second date

**Output:**
- `true` if same year/month/day, `false` otherwise

**Behavior:**
- Compares only date portion (ignores time)
- Used to identify "today" in calendar grid

**Example:**
```typescript
const date1 = new Date(2026, 1, 4, 10, 0, 0);
const date2 = new Date(2026, 1, 4, 15, 30, 0);
isSameDay(date1, date2);  // Returns true (same day, different time)
```

### getStartOfMonth()

Returns a Date object for the first day of the month.

**Contract:**
```typescript
function getStartOfMonth(date: Date): Date
```

**Input:**
- `date`: Any date within a month

**Output:**
- Date object with day=1, time=00:00:00

**Behavior:**
- Sets day to 1, preserves month and year
- Resets time to midnight

**Example:**
```typescript
const date = new Date(2026, 1, 15);  // Feb 15, 2026
getStartOfMonth(date);  // Returns Feb 1, 2026 00:00:00
```

## Module: state/calendar-state

### getState()

Returns the current calendar state.

**Contract:**
```typescript
function getState(): CalendarState
```

**Output:**
- Current `CalendarState` object

**Behavior:**
- Returns reference to state (not a copy)
- State updates trigger re-render

### updateCurrentMonth()

Updates the current month being displayed.

**Contract:**
```typescript
function updateCurrentMonth(newMonth: Date): void
```

**Input:**
- `newMonth`: Date representing the new month to display

**Behavior:**
- Updates `CalendarState.currentMonth`
- Triggers calendar re-render
- MUST complete transition in <16ms (performance budget)

### navigateToPreviousMonth()

Navigates to the previous Nepali month.

**Contract:**
```typescript
function navigateToPreviousMonth(): void
```

**Behavior:**
- Decrements current Nepali month by 1
- Handles year boundaries (Baishakh → previous year's Chaitra)
- Triggers re-render

### navigateToNextMonth()

Navigates to the next Nepali month.

**Contract:**
```typescript
function navigateToNextMonth(): void
```

**Behavior:**
- Increments current Nepali month by 1
- Handles year boundaries (Chaitra → next year's Baishakh)
- Triggers re-render

### navigateToToday()

Resets the calendar to the current month.

**Contract:**
```typescript
function navigateToToday(): void
```

**Behavior:**
- Sets `CalendarState.currentMonth` to month containing today
- Triggers re-render

## Module: components/CalendarGrid

### generateCalendarGrid()

Generates a complete calendar month grid with date cells.

**Contract:**
```typescript
function generateCalendarGrid(currentMonth: Date): CalendarMonth
```

**Input:**
- `currentMonth`: Date representing the month to display

**Output:**
- `CalendarMonth` object with array of 35-42 `DateCell` objects

**Behavior:**
- Converts `currentMonth` to Nepali date
- Determines first day of Nepali month
- Generates date cells for:
  - Leading days from previous month (dimmed)
  - Current month days (highlighted)
  - Trailing days from next month (dimmed)
- Marks today's cell with `isToday=true`
- MUST complete in <50ms (part of <100ms render budget)

**Grid Size:**
- Returns 35 cells (5 weeks) if month + leading/trailing days fit in 5 weeks
- Returns 42 cells (6 weeks) if month spans 6 weeks

**Example:**
```typescript
const currentMonth = new Date(2026, 1, 1);  // Feb 2026
const calendarMonth = generateCalendarGrid(currentMonth);
// Returns CalendarMonth with:
// - nepaliMonth: 10 (Magh)
// - nepaliYear: 2082
// - monthName: "Magh"
// - cells: array of 35-42 DateCell objects
```

### renderCalendarGrid()

Renders the calendar grid to the DOM.

**Contract:**
```typescript
function renderCalendarGrid(calendarMonth: CalendarMonth): void
```

**Input:**
- `calendarMonth`: CalendarMonth object to render

**Behavior:**
- Updates DOM with calendar grid
- Uses CSS Grid for layout (7 columns)
- Applies styling for today, current month, adjacent months
- MUST complete in <50ms (part of <100ms render budget)

**DOM Structure:**
```html
<div class="calendar-grid">
  <div class="date-cell [today|current-month|other-month]">
    <span class="nepali-date">22</span>
    <span class="gregorian-date">4</span>
  </div>
  <!-- ...35-42 cells total -->
</div>
```

## Performance Contracts

All functions MUST meet these performance budgets:

| Function | Budget | Rationale |
|----------|--------|-----------|
| Date conversions | <10ms each | Constitution requirement |
| Grid generation | <50ms | Half of 100ms render budget |
| DOM rendering | <50ms | Half of 100ms render budget |
| Month navigation | <16ms total | 60fps constitution requirement |
| Utility functions | <1ms | Should be near-instant |

## Error Handling Contract

All functions follow consistent error handling:

**Validation:**
- Validate inputs before processing
- Throw descriptive errors for invalid inputs
- No silent failures

**Error Messages:**
```typescript
// Good: Descriptive
throw new Error("Invalid day for month: month 10 has 29 days in year 2082");

// Bad: Vague
throw new Error("Invalid date");
```

**Recovery:**
- Date conversion errors: display error message, prevent navigation
- Out-of-range errors: disable navigation buttons at boundaries
- Rendering errors: fallback to error state, preserve app functionality

## Testing Contract

Each function MUST be testable with:

**Unit Tests** (optional but recommended):
- Test known date conversions (e.g., 2026-02-04 = 2082-10-22 BS)
- Test edge cases (year boundaries, month lengths)
- Test error cases (invalid dates, out of range)

**Manual Testing** (required per constitution):
- Validate conversions against official Nepali calendar websites
- Test navigation across year boundaries
- Verify visual accuracy of rendered calendar

## Immutability Contract

All data transformations are immutable:

```typescript
// Good: Returns new object
function adjustMonth(date: Date, offset: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + offset);
  return newDate;
}

// Bad: Mutates input
function adjustMonth(date: Date, offset: number): Date {
  date.setMonth(date.getMonth() + offset);  // ❌ Mutates input
  return date;
}
```

**Rationale:**
- Prevents unexpected side effects
- Makes code easier to reason about
- Aligns with functional programming patterns
- Supports potential future features (undo/redo)

## Summary

Internal API contracts ensure:
- Clear boundaries between modules
- Type safety through TypeScript interfaces
- Performance guarantees for all operations
- Consistent error handling
- Immutable data transformations
- Testability of calendar logic

All contracts compile away at build time with zero runtime overhead.
