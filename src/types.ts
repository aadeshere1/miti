// TypeScript interfaces for Calendar Month View

export interface CalendarState {
  // Current month being displayed (Gregorian Date object for calculation)
  currentMonth: Date;

  // Currently selected date (if any) - null for view-only initial implementation
  selectedDate: Date | null;

  // Current date (today) for highlighting - updated on app load
  today: Date;
}

export interface NepaliDate {
  // Nepali year (Bikram Sambat)
  year: number;        // e.g., 2082

  // Nepali month (1-12)
  month: number;       // 1=Baishakh, 2=Jestha, ..., 12=Chaitra

  // Nepali day of month (1-32, varies by month/year)
  day: number;         // 1-32

  // Day of week (0-6, 0=Sunday, 6=Saturday)
  dayOfWeek: number;   // 0-6
}

export interface GregorianDate {
  // Gregorian year
  year: number;        // e.g., 2026

  // Gregorian month (1-12)
  month: number;       // 1=January, 2=February, ..., 12=December

  // Gregorian day of month (1-31)
  day: number;         // 1-31

  // Day of week (0-6, 0=Sunday, 6=Saturday)
  dayOfWeek: number;   // 0-6
}

export interface DateCell {
  // Nepali date for this cell
  nepaliDate: NepaliDate;

  // Corresponding Gregorian date
  gregorianDate: GregorianDate;

  // Whether this cell is the current date (today)
  isToday: boolean;

  // Whether this date belongs to the currently displayed month
  isCurrentMonth: boolean;

  // Whether this cell is empty (leading/trailing days from other months)
  isEmpty: boolean;
}

export interface CalendarMonth {
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
