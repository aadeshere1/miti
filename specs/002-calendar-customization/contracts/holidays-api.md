# Holidays API Contract

**Module**: `src/holidays/holidays-loader.ts` and `src/holidays/holidays-storage.ts`
**Purpose**: Load, store, and query holiday data

## TypeScript Interface

```typescript
/**
 * Holidays API
 * Provides loading and querying operations for holidays
 */
export interface HolidaysAPI {
  /**
   * Load holidays from JSON file
   * @param url - URL to holidays JSON file (default: '/holidays/holidays.json')
   * @returns Promise that resolves when holidays are loaded and stored
   * @throws Error if file not found or invalid format
   */
  loadHolidays(url?: string): Promise<void>;

  /**
   * Get holidays for a specific date
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns Array of holidays for that date (empty if none)
   */
  getHolidaysForDate(nepaliDate: string): Holiday[];

  /**
   * Get all holidays for a specific year
   * @param year - Nepali year (e.g., 2082)
   * @returns Array of holidays for that year (empty if none)
   */
  getHolidaysForYear(year: number): Holiday[];

  /**
   * Get all holidays for a specific month
   * @param year - Nepali year
   * @param month - Nepali month (1-12)
   * @returns Array of holidays for that month
   */
  getHolidaysForMonth(year: number, month: number): Holiday[];

  /**
   * Check if a date is a holiday
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns true if date has at least one holiday
   */
  isHoliday(nepaliDate: string): boolean;

  /**
   * Get cached holidays from localStorage
   * @returns All cached holidays organized by year
   */
  getCachedHolidays(): HolidayStorage;

  /**
   * Clear all cached holidays
   */
  clearHolidays(): void;
}

/**
 * Holiday entity
 */
export interface Holiday {
  name: string;             // Holiday name (Nepali or English)
  date: string;             // Format: YYYY-MM-DD (BS)
  description?: string;     // Optional additional details
}

/**
 * Holiday storage structure
 * Organized by year for efficient lookup
 */
export interface HolidayStorage {
  [year: string]: Holiday[];
}
```

## JSON File Format

### Schema

```json
{
  "holidays": {
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
    ],
    "2083": [
      // Holidays for 2083 BS
    ]
  }
}
```

### Validation

```typescript
interface HolidayJSON {
  holidays: {
    [year: string]: Array<{
      name: string;
      date: string;
      description?: string;
    }>;
  };
}

/**
 * Validate holiday JSON structure
 * @param data - Parsed JSON data
 * @throws ValidationError if structure is invalid
 */
function validateHolidayJSON(data: any): asserts data is HolidayJSON {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid JSON: Root must be object');
  }

  if (!data.holidays || typeof data.holidays !== 'object') {
    throw new ValidationError('Invalid JSON: Missing "holidays" object');
  }

  for (const [year, holidays] of Object.entries(data.holidays)) {
    // Validate year format
    if (!/^\d{4}$/.test(year)) {
      throw new ValidationError(`Invalid year format: ${year}`);
    }

    // Validate holidays array
    if (!Array.isArray(holidays)) {
      throw new ValidationError(`Holidays for year ${year} must be array`);
    }

    // Validate each holiday
    for (const holiday of holidays) {
      if (!holiday.name || typeof holiday.name !== 'string') {
        throw new ValidationError(`Missing or invalid name in year ${year}`);
      }

      if (!holiday.date || !/^\d{4}-\d{2}-\d{2}$/.test(holiday.date)) {
        throw new ValidationError(
          `Invalid date format for "${holiday.name}": ${holiday.date}`
        );
      }

      if (holiday.description && typeof holiday.description !== 'string') {
        throw new ValidationError(
          `Invalid description for "${holiday.name}"`
        );
      }
    }
  }
}
```

## Usage Examples

### Load holidays on app startup
```typescript
import { loadHolidays } from './holidays-loader';

async function initHolidays() {
  try {
    await loadHolidays('/holidays/holidays.json');
    console.log('Holidays loaded successfully');
  } catch (error) {
    console.warn('Failed to load holidays:', error.message);
    // App continues to function without holidays
  }
}

initHolidays();
```

### Check if a date is a holiday
```typescript
import { isHoliday, getHolidaysForDate } from './holidays-storage';

const date = '2082-01-01';
if (isHoliday(date)) {
  const holidays = getHolidaysForDate(date);
  console.log('Holiday:', holidays[0].name);
}
```

### Get all holidays for current month
```typescript
import { getHolidaysForMonth } from './holidays-storage';

const holidays = getHolidaysForMonth(2082, 9);  // Mangsir 2082
holidays.forEach(holiday => {
  console.log(`${holiday.date}: ${holiday.name}`);
});
```

### Display holiday in calendar cell
```typescript
import { getHolidaysForDate } from './holidays-storage';

function renderDateCell(nepaliDate: string) {
  const holidays = getHolidaysForDate(nepaliDate);

  if (holidays.length > 0) {
    const cell = document.createElement('div');
    cell.classList.add('date-cell', 'holiday');

    // Add holiday name
    const holidayLabel = document.createElement('div');
    holidayLabel.classList.add('holiday-name');
    holidayLabel.textContent = holidays[0].name;
    cell.appendChild(holidayLabel);

    // Add description on hover (if available)
    if (holidays[0].description) {
      cell.title = holidays[0].description;
    }

    return cell;
  }
}
```

## Error Handling

### File Not Found
```typescript
try {
  await loadHolidays('/holidays/holidays.json');
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.warn('Holidays file not found. Calendar will work without holidays.');
    // Continue without holidays
  }
}
```

### Invalid JSON Format
```typescript
try {
  await loadHolidays('/holidays/holidays.json');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid holidays file format:', error.message);
    alert('Holidays file is invalid. Please check the format.');
  }
}
```

### Network Error
```typescript
try {
  await loadHolidays('/holidays/holidays.json');
} catch (error) {
  if (error instanceof NetworkError) {
    console.warn('Failed to fetch holidays. Using cached data if available.');
    // Try to use cached holidays from localStorage
    const cached = getCachedHolidays();
    if (Object.keys(cached).length > 0) {
      console.log('Using cached holidays');
    }
  }
}
```

## Storage Format

```json
{
  "miti:holidays": {
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
    ],
    "2083": [
      // More holidays
    ]
  }
}
```

## Performance Characteristics

- **loadHolidays**: O(n) - Network request + parse + validate + store (n = number of holidays)
- **getHolidaysForDate**: O(m) - Filter holidays array for matching date (m = holidays in that year)
- **getHolidaysForYear**: O(1) - Direct year key lookup
- **getHolidaysForMonth**: O(n) - Filter holidays array for matching month (n = holidays in year)
- **isHoliday**: O(m) - Check if any holiday matches date
- **getCachedHolidays**: O(1) - Direct localStorage read

## Caching Strategy

1. **First Load**: Fetch from network, parse, validate, store in localStorage
2. **Subsequent Loads**: Read from localStorage (no network request)
3. **Update**: Replace holidays.json file, clear cache, reload app
4. **Fallback**: If network fails but cache exists, use cached data

```typescript
async function loadHolidays(url: string = '/holidays/holidays.json') {
  try {
    // Try network first
    const response = await fetch(url);
    if (!response.ok) throw new NetworkError('Failed to fetch holidays');

    const data = await response.json();
    validateHolidayJSON(data);

    // Store in localStorage
    localStorage.setItem('miti:holidays', JSON.stringify(data.holidays));

  } catch (error) {
    // If network fails, check for cached data
    const cached = localStorage.getItem('miti:holidays');
    if (cached) {
      console.log('Using cached holidays');
      return;
    }

    // No cache available, app continues without holidays
    console.warn('No holidays available');
  }
}
```
