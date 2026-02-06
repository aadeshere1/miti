// Holiday storage and management

import type { Holiday, HolidayStorage } from './holidays-types';
import { getItem, setItem } from '../utils/storage';

const HOLIDAYS_KEY = 'miti:holidays';

/**
 * Get all holidays for a specific date
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns Holiday object if exists, null otherwise
 */
export function getHolidayForDate(nepaliDate: string): Holiday | null {
  const [year] = nepaliDate.split('-');
  const holidayStorage = getItem<HolidayStorage>(HOLIDAYS_KEY);

  if (!holidayStorage || !holidayStorage[year]) {
    return null;
  }

  const holiday = holidayStorage[year].find(h => h.date === nepaliDate);
  return holiday || null;
}

/**
 * Get all holidays for a specific year
 * @param year Nepali year
 * @returns Array of holidays for the year
 */
export function getHolidaysForYear(year: number): Holiday[] {
  const holidayStorage = getItem<HolidayStorage>(HOLIDAYS_KEY);

  if (!holidayStorage || !holidayStorage[year.toString()]) {
    return [];
  }

  return holidayStorage[year.toString()];
}

/**
 * Check if a specific date is a holiday
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns true if the date is a holiday
 */
export function isHoliday(nepaliDate: string): boolean {
  return getHolidayForDate(nepaliDate) !== null;
}

/**
 * Add or update holidays for a specific year
 * @param year Nepali year
 * @param holidays Array of holidays
 */
export function saveHolidaysForYear(year: number, holidays: Holiday[]): void {
  const holidayStorage = getItem<HolidayStorage>(HOLIDAYS_KEY) || {};
  holidayStorage[year.toString()] = holidays;
  setItem(HOLIDAYS_KEY, holidayStorage);
}

/**
 * Import holidays from JSON data
 * @param data Holiday storage object
 */
export function importHolidays(data: HolidayStorage): void {
  setItem(HOLIDAYS_KEY, data);
}

/**
 * Clear all holidays
 */
export function clearHolidays(): void {
  setItem(HOLIDAYS_KEY, {});
}
