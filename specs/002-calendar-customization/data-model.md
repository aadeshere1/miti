# Data Model: Calendar Customization and Note-Taking

**Feature**: 002-calendar-customization
**Date**: 2026-02-04
**Status**: Complete

## Overview

This document defines the data structures for notes, settings, holidays, and extended calendar date entities. All data is stored in browser localStorage with defined schemas.

## Core Entities

### 1. Note

Represents a user-created text memo associated with a specific calendar date.

**Attributes**:
- `id` (string, required): Unique identifier (UUID v4 format)
- `text` (string, required): Note content (max 5,000 characters)
- `timestamp` (number, required): Last modified time (Unix timestamp in milliseconds)
- `created` (number, required): Creation time (Unix timestamp in milliseconds)
- `modified` (number, required): Last modification time (Unix timestamp in milliseconds)

**Relationships**:
- Belongs to one CalendarDate (via date key in storage)
- Multiple notes can exist for the same date

**Storage**:
- Key: `miti:notes:{nepali-date}` (e.g., `miti:notes:2082-09-15`)
- Value: Array of Note objects (JSON serialized)

**Validation Rules**:
- `id` must be non-empty UUID format
- `text` must not exceed 5,000 characters
- `timestamp`, `created`, `modified` must be valid Unix timestamps
- `created` ≤ `modified` (modified cannot be before creation)

**TypeScript Definition**:
```typescript
interface Note {
  id: string;
  text: string;
  timestamp: number;
  created: number;
  modified: number;
}
```

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Doctor appointment at 3 PM",
  "timestamp": 1738665600000,
  "created": 1738665600000,
  "modified": 1738665900000
}
```

---

### 2. Holiday

Represents a special occasion or public holiday loaded from external JSON file.

**Attributes**:
- `name` (string, required): Holiday name (in Nepali or English)
- `date` (string, required): Holiday date in Nepali calendar (YYYY-MM-DD BS format)
- `description` (string, optional): Additional details about the holiday
- `year` (number, derived): Extracted from date for indexing

**Relationships**:
- Displayed on CalendarDate when dates match
- Multiple holidays can exist on the same date

**Storage**:
- Key: `miti:holidays`
- Value: Object with year keys containing arrays of holidays (JSON serialized)

**Validation Rules**:
- `name` must be non-empty string
- `date` must match format YYYY-MM-DD (BS calendar)
- Year in date must be valid 4-digit number
- Month must be 1-12, day must be 1-32 (validated against Nepali calendar)

**TypeScript Definition**:
```typescript
interface Holiday {
  name: string;
  date: string;  // Format: YYYY-MM-DD (BS)
  description?: string;
}

interface HolidayStorage {
  [year: string]: Holiday[];
}
```

**Example**:
```json
{
  "2082": [
    {
      "name": "नयाँ वर्ष (New Year)",
      "date": "2082-01-01",
      "description": "Nepali New Year - Baishakh 1"
    },
    {
      "name": "Dashain",
      "date": "2082-06-23"
    }
  ]
}
```

---

### 3. Settings

Represents user preferences for calendar customization.

**Attributes**:
- `weekend` (string, required): Weekend configuration - one of: `"sunday"`, `"saturday"`, `"both"`
- `sidebarPosition` (string, required): Sidebar location - one of: `"left"`, `"right"`
- `sidebarEnabled` (boolean, required): Whether sidebar is visible
- `themeType` (string, required): Theme mode - one of: `"color"`, `"image"`, `"none"`
- `backgroundColor` (string, optional): Hex color code (e.g., `"#ffffff"`)
- `backgroundImage` (string, optional): Data URL or external URL for background image

**Relationships**:
- Singleton (only one Settings object exists per user)
- Affects rendering of all CalendarDate entities

**Storage**:
- Key: `miti:settings`
- Value: Single Settings object (JSON serialized)

**Validation Rules**:
- `weekend` must be one of: `"sunday"`, `"saturday"`, `"both"`
- `sidebarPosition` must be one of: `"left"`, `"right"`
- `sidebarEnabled` must be boolean
- `themeType` must be one of: `"color"`, `"image"`, `"none"`
- `backgroundColor` must be valid hex color if provided (regex: `^#[0-9A-Fa-f]{6}$`)
- `backgroundImage` must be valid data URL or HTTP(S) URL if provided

**TypeScript Definition**:
```typescript
type WeekendConfig = 'sunday' | 'saturday' | 'both';
type SidebarPosition = 'left' | 'right';
type ThemeType = 'color' | 'image' | 'none';

interface Settings {
  weekend: WeekendConfig;
  sidebarPosition: SidebarPosition;
  sidebarEnabled: boolean;
  themeType: ThemeType;
  backgroundColor?: string;
  backgroundImage?: string;
}
```

**Default Values**:
```json
{
  "weekend": "both",
  "sidebarPosition": "right",
  "sidebarEnabled": true,
  "themeType": "none",
  "backgroundColor": "#ffffff",
  "backgroundImage": null
}
```

---

### 4. CalendarDate (Extended)

Extends the existing CalendarDate entity with new attributes for notes, weekends, and holidays.

**New Attributes**:
- `hasNotes` (boolean, computed): Whether this date has any notes
- `notesCount` (number, computed): Number of notes for this date
- `isWeekend` (boolean, computed): Whether this date is a weekend (based on Settings)
- `isHoliday` (boolean, computed): Whether this date has a holiday
- `holidayName` (string, computed): Name of holiday if `isHoliday` is true
- `holidayDescription` (string, computed): Description of holiday if available

**Existing Attributes** (from feature 001):
- `nepaliDate` (NepaliDate): Nepali calendar date
- `gregorianDate` (Date): Corresponding Gregorian date
- `isCurrentMonth` (boolean): Whether date belongs to displayed month
- `isToday` (boolean): Whether date is today

**Relationships**:
- Has many Notes (0 to N)
- Has many Holidays (0 to N)
- Reflects Settings for weekend determination

**Computation Logic**:
- `hasNotes`: Check if `miti:notes:{date}` key exists in localStorage
- `notesCount`: Length of notes array for this date
- `isWeekend`: Compare `dayOfWeek` against Settings.weekend configuration
- `isHoliday`: Check if Holiday exists for this Nepali date
- `holidayName`: First holiday name if multiple holidays on same date

**TypeScript Definition**:
```typescript
interface CalendarDateExtended extends CalendarDate {
  // Computed properties
  hasNotes: boolean;
  notesCount: number;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  holidayDescription?: string;
}
```

---

## State Transitions

### Note Lifecycle

```
[Created] --> [Modified] --> [Deleted]
    |                            ^
    |                            |
    +----------------------------+
         (Modified again)
```

1. **Created**: User clicks date, opens modal, enters text, saves
   - Generate UUID
   - Set `created` and `modified` to current timestamp
   - Store in localStorage

2. **Modified**: User opens existing note, edits text, saves
   - Keep same `id` and `created`
   - Update `text` and `modified` timestamp
   - Update in localStorage

3. **Deleted**: User opens note, clicks delete, confirms
   - Remove from localStorage array
   - Update CalendarDate computed properties

### Settings Lifecycle

```
[Default] --> [Modified] --> [Modified] --> ...
```

1. **Default**: First app load, no settings in localStorage
   - Apply default values
   - Render with default configuration

2. **Modified**: User opens settings modal, changes values, saves
   - Update localStorage
   - Apply changes immediately to UI
   - Fire storage event for other tabs

### Holiday Lifecycle

```
[Empty] --> [Loaded] --> [Cached]
              |
              v
          [Error: Graceful Fallback]
```

1. **Empty**: App starts, no holidays in localStorage
   - Attempt to fetch holidays.json

2. **Loaded**: JSON file fetched and parsed successfully
   - Validate schema
   - Store in localStorage
   - Apply to calendar

3. **Cached**: Subsequent app loads
   - Read from localStorage
   - No network request needed

4. **Error**: JSON file missing, invalid, or network error
   - Log warning to console
   - Calendar functions normally without holidays
   - User can manually add holidays.json later

---

## Data Integrity

### localStorage Schema Versioning

To support future schema changes without breaking existing data:

**Version Key**: `miti:schema-version`
**Current Version**: `1`

**Migration Strategy**:
- Check version on app load
- If version mismatch, run migration functions
- Migrate data to new schema
- Update version key

### Backup and Export

For future consideration (not in current spec):
- Export all notes to JSON file
- Import notes from JSON file
- Clear all data (factory reset)

### Cross-Tab Consistency

- All write operations trigger storage events
- Other tabs listen and update their UI
- Race conditions handled by timestamp (last write wins)

---

## Storage Size Estimates

Based on defined schemas and limits:

**Single Note**:
- UUID: 36 bytes
- Text (avg 200 chars): 400 bytes
- Timestamps (3 × 8 bytes): 24 bytes
- JSON overhead: ~50 bytes
- **Total**: ~510 bytes per note

**Single Holiday**:
- Name (avg 20 chars): 40 bytes
- Date: 20 bytes
- Description (optional, avg 50 chars): 100 bytes
- **Total**: ~160 bytes per holiday

**Settings**:
- All fields: ~200 bytes (without image)
- With 2MB image: ~2.66MB (base64 encoded)

**Example Storage Usage**:
- 100 notes: ~51 KB
- 50 holidays/year × 3 years: ~24 KB
- Settings with image: ~2.66 MB
- **Total**: ~2.73 MB (well under 5MB limit)

---

## Summary

Four core entities with clear relationships and validation rules:
1. **Note**: User memos with timestamps and character limits
2. **Holiday**: External data with date-based lookup
3. **Settings**: Singleton configuration object
4. **CalendarDate**: Extended with computed note/holiday flags

All entities use localStorage with prefixed keys. Schema supports validation, versioning, and multi-tab synchronization.
