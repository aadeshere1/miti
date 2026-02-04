// Holiday JSON loading and validation

import type { Holiday, HolidayStorage } from './holidays-types';
import { importHolidays } from './holidays-storage';

/**
 * Validate holiday JSON schema (T092)
 * @param data Parsed JSON data
 * @returns true if valid, error message if invalid
 */
export function validateHolidayJSON(data: any): { valid: boolean; error?: string } {
  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Holiday data must be an object with year keys' };
  }

  // Validate each year
  for (const [year, holidays] of Object.entries(data)) {
    // Check year format (4 digits)
    if (!/^\d{4}$/.test(year)) {
      return { valid: false, error: `Invalid year format: ${year}. Must be 4 digits (e.g., 2082)` };
    }

    // Check holidays is an array
    if (!Array.isArray(holidays)) {
      return { valid: false, error: `Holidays for year ${year} must be an array` };
    }

    // Validate each holiday
    for (const holiday of holidays) {
      const validation = validateHolidayEntry(holiday, year);
      if (!validation.valid) {
        return validation;
      }
    }
  }

  return { valid: true };
}

/**
 * Validate a single holiday entry (T094)
 * @param holiday Holiday object to validate
 * @param year Year context for better error messages
 * @returns Validation result
 */
function validateHolidayEntry(holiday: any, year: string): { valid: boolean; error?: string } {
  // Check required fields
  if (!holiday.name || typeof holiday.name !== 'string') {
    return { valid: false, error: `Holiday in year ${year} missing valid name field` };
  }

  if (!holiday.date || typeof holiday.date !== 'string') {
    return { valid: false, error: `Holiday "${holiday.name}" in year ${year} missing valid date field` };
  }

  // Validate date format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(holiday.date)) {
    return {
      valid: false,
      error: `Holiday "${holiday.name}" has invalid date format: ${holiday.date}. Must be YYYY-MM-DD`,
    };
  }

  // Check date belongs to the year
  const [holidayYear] = holiday.date.split('-');
  if (holidayYear !== year) {
    return {
      valid: false,
      error: `Holiday "${holiday.name}" date ${holiday.date} doesn't match year ${year}`,
    };
  }

  // Validate optional description
  if (holiday.description !== undefined && typeof holiday.description !== 'string') {
    return {
      valid: false,
      error: `Holiday "${holiday.name}" has invalid description (must be string)`,
    };
  }

  return { valid: true };
}

/**
 * Load holidays from JSON file (T093)
 * @param url URL to holidays JSON file
 * @returns Promise that resolves when holidays are loaded
 */
export async function loadHolidays(url: string = '/holidays/holidays.json'): Promise<void> {
  try {
    // Fetch JSON file
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status} ${response.statusText}`);
    }

    // Parse JSON (T094)
    const data = await response.json();

    // Validate schema (T092)
    const validation = validateHolidayJSON(data);
    if (!validation.valid) {
      throw new Error(`Invalid holiday data: ${validation.error}`);
    }

    // Store in localStorage (T095)
    importHolidays(data as HolidayStorage);

    console.log('Holidays loaded successfully');
  } catch (error) {
    // Re-throw with context for caller to handle
    if (error instanceof Error) {
      throw new Error(`Holiday loading failed: ${error.message}`);
    }
    throw error;
  }
}
