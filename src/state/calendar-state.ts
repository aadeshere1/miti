// Calendar state management

import { convertGregorianToNepali, convertNepaliToGregorian } from '../calendar/conversions';
import type { CalendarState } from '../types';

// Global state
let state: CalendarState = {
  currentMonth: new Date(),
  today: new Date(),
  selectedDate: null
};

/**
 * Returns the current calendar state
 * @returns CalendarState object
 */
export function getState(): CalendarState {
  return state;
}

/**
 * Initializes the calendar state with current date
 */
export function initializeState(): void {
  const now = new Date();
  state = {
    currentMonth: now,
    today: now,
    selectedDate: null
  };
}

/**
 * Navigates to the next Nepali month
 */
export function navigateToNextMonth(): void {
  const nepali = convertGregorianToNepali(state.currentMonth);
  let nextMonth = nepali.month + 1;
  let nextYear = nepali.year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  state.currentMonth = convertNepaliToGregorian({ year: nextYear, month: nextMonth, day: 1, dayOfWeek: 0 });
}

/**
 * Navigates to the previous Nepali month
 */
export function navigateToPreviousMonth(): void {
  const nepali = convertGregorianToNepali(state.currentMonth);
  let prevMonth = nepali.month - 1;
  let prevYear = nepali.year;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  state.currentMonth = convertNepaliToGregorian({ year: prevYear, month: prevMonth, day: 1, dayOfWeek: 0 });
}

/**
 * Resets the calendar to the current month
 */
export function navigateToToday(): void {
  state.currentMonth = new Date(state.today);
}

/**
 * Navigates to a specific Nepali date
 * @param year Nepali year
 * @param month Nepali month (1-12)
 * @param day Nepali day
 */
export function navigateToDate(year: number, month: number, day: number): void {
  // Convert Nepali date to Gregorian to set the current month
  const gregorianDate = convertNepaliToGregorian({ year, month, day, dayOfWeek: 0 });
  state.currentMonth = gregorianDate;

  // Trigger re-render by importing and calling render from main
  // This will be handled by the caller
}
