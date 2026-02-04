// Nepali calendar data and month information

import { convertNepaliToGregorian } from './conversions';

/**
 * Nepali month names (English transliteration)
 * Index 1-12 corresponds to months Baishakh-Chaitra
 */
export const NEPALI_MONTHS: Record<number, string> = {
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

/**
 * Returns English transliterated name for a Nepali month number
 * @param month - Nepali month number (1-12)
 * @returns English month name
 * @throws Error if month is not between 1 and 12
 */
export function getNepaliMonthName(month: number): string {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  return NEPALI_MONTHS[month];
}

/**
 * Returns the number of days in a specific Nepali month/year
 * Note: Nepali months have varying lengths (29-32 days) depending on year
 * @param year - Nepali year (BS)
 * @param month - Nepali month (1-12)
 * @returns Number of days in the month
 */
export function getNepaliMonthDays(year: number, month: number): number {
  // Calculate by finding the difference between first day of this month
  // and first day of next month
  const firstDayOfMonth = convertNepaliToGregorian({ year, month, day: 1, dayOfWeek: 0 });

  // Calculate next month
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = year + 1;
  }

  const firstDayOfNextMonth = convertNepaliToGregorian({ year: nextYear, month: nextMonth, day: 1, dayOfWeek: 0 });

  // Calculate difference in days
  const diffTime = firstDayOfNextMonth.getTime() - firstDayOfMonth.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Returns the day of week for the first day of a Nepali month
 * @param year - Nepali year
 * @param month - Nepali month (1-12)
 * @returns Day of week (0-6, 0=Sunday)
 */
export function getFirstDayOfNepaliMonth(year: number, month: number): number {
  const firstDay = convertNepaliToGregorian({ year, month, day: 1, dayOfWeek: 0 });
  return firstDay.getDay(); // 0=Sunday, 6=Saturday
}
