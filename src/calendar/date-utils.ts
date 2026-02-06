// Date utility functions

/**
 * Adjusts a Date object by a number of months
 * @param date - Base date
 * @param offset - Number of months to add (negative for previous months)
 * @returns New Date object with adjusted month (immutable)
 */
export function adjustMonth(date: Date, offset: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + offset);
  return newDate;
}

/**
 * Checks if two dates represent the same calendar day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if same year/month/day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Returns a Date object for the first day of the month
 * @param date - Any date within a month
 * @returns Date object with day=1, time=00:00:00
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
