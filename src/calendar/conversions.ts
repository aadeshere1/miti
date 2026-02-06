// Date conversion functions using @remotemerge/nepali-date-converter

import DateConverter from '@remotemerge/nepali-date-converter';
import type { NepaliDate, GregorianDate } from '../types';

/**
 * Converts a Gregorian date to Nepali (Bikram Sambat) date
 * @param gregorianDate - JavaScript Date object
 * @returns NepaliDate object
 * @throws Error if date is outside supported range (1975-2099 BS)
 */
export function convertGregorianToNepali(gregorianDate: Date): NepaliDate {
  try {
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth() + 1; // JS months are 0-indexed
    const day = gregorianDate.getDate();

    // Format as YYYY-MM-DD for the library
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Use library for conversion
    const result = new DateConverter(dateString).toBs();

    return {
      year: result.year,
      month: result.month,
      day: result.date,
      dayOfWeek: gregorianDate.getDay() // 0=Sunday, 6=Saturday
    };
  } catch (error) {
    throw new Error(`Failed to convert Gregorian date: ${error}`);
  }
}

/**
 * Converts a Nepali (Bikram Sambat) date to Gregorian date
 * @param nepaliDate - NepaliDate object
 * @returns JavaScript Date object
 * @throws Error if Nepali date is invalid
 */
export function convertNepaliToGregorian(nepaliDate: NepaliDate): Date {
  try {
    // Format as YYYY-MM-DD for the library
    const dateString = `${nepaliDate.year}-${String(nepaliDate.month).padStart(2, '0')}-${String(nepaliDate.day).padStart(2, '0')}`;

    // Use library for conversion
    const result = new DateConverter(dateString).toAd();

    return new Date(result.year, result.month - 1, result.date); // JS months are 0-indexed
  } catch (error) {
    throw new Error(`Failed to convert Nepali date: ${error}`);
  }
}
