// Calendar grid generation and rendering

import { convertGregorianToNepali, convertNepaliToGregorian } from '../calendar/conversions';
import { getNepaliMonthName, getNepaliMonthDays, getFirstDayOfNepaliMonth } from '../calendar/calendar-data';
import { isSameDay } from '../calendar/date-utils';
import type { CalendarMonth, DateCell, NepaliDate } from '../types';
import { renderDateCell } from './DateCell';
import { addNotesIndicator } from '../notes/notes-ui';
import type { NotesModal } from '../notes/notes-modal';
import { isWeekendDay } from '../settings/settings-storage';
import { getHolidayForDate } from '../holidays/holidays-storage';

// Global reference to notes modal (set from main.ts)
let notesModalInstance: NotesModal | null = null;

/**
 * Set the notes modal instance for calendar integration
 */
export function setNotesModal(modal: NotesModal): void {
  notesModalInstance = modal;
}

/**
 * Format Nepali date as YYYY-MM-DD string
 */
function formatNepaliDate(nepaliDate: NepaliDate): string {
  const year = nepaliDate.year;
  const month = String(nepaliDate.month).padStart(2, '0');
  const day = String(nepaliDate.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a complete calendar month grid with date cells
 * @param currentMonth - Date representing the month to display
 * @returns CalendarMonth object with array of DateCell objects
 */
export function generateCalendarGrid(currentMonth: Date): CalendarMonth {
  // Convert current month to Nepali date
  const nepaliDate = convertGregorianToNepali(currentMonth);
  const { year: nepaliYear, month: nepaliMonth } = nepaliDate;

  // Get month information
  const monthName = getNepaliMonthName(nepaliMonth);
  const daysInMonth = getNepaliMonthDays(nepaliYear, nepaliMonth);
  const startDayOfWeek = getFirstDayOfNepaliMonth(nepaliYear, nepaliMonth);

  // Calculate cells needed (35 for 5 weeks, 42 for 6 weeks)
  const cells: DateCell[] = [];
  const today = new Date();

  // Calculate how many leading days from previous month
  const leadingDays = startDayOfWeek;

  // Calculate how many trailing days needed to complete the grid
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const trailingDays = totalCells - leadingDays - daysInMonth;

  // Previous month days (dimmed)
  let prevMonth = nepaliMonth - 1;
  let prevYear = nepaliYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = nepaliYear - 1;
  }
  const prevMonthDays = getNepaliMonthDays(prevYear, prevMonth);

  for (let i = 0; i < leadingDays; i++) {
    const day = prevMonthDays - leadingDays + i + 1;
    const nepali: NepaliDate = { year: prevYear, month: prevMonth, day, dayOfWeek: i };
    const gregorian = convertNepaliToGregorian(nepali);

    cells.push({
      nepaliDate: nepali,
      gregorianDate: {
        year: gregorian.getFullYear(),
        month: gregorian.getMonth() + 1,
        day: gregorian.getDate(),
        dayOfWeek: gregorian.getDay()
      },
      isToday: isSameDay(gregorian, today),
      isCurrentMonth: false,
      isEmpty: false
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const nepali: NepaliDate = { year: nepaliYear, month: nepaliMonth, day, dayOfWeek: 0 };
    const gregorian = convertNepaliToGregorian(nepali);

    cells.push({
      nepaliDate: nepali,
      gregorianDate: {
        year: gregorian.getFullYear(),
        month: gregorian.getMonth() + 1,
        day: gregorian.getDate(),
        dayOfWeek: gregorian.getDay()
      },
      isToday: isSameDay(gregorian, today),
      isCurrentMonth: true,
      isEmpty: false
    });
  }

  // Next month days (dimmed)
  let nextMonth = nepaliMonth + 1;
  let nextYear = nepaliYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = nepaliYear + 1;
  }

  for (let day = 1; day <= trailingDays; day++) {
    const nepali: NepaliDate = { year: nextYear, month: nextMonth, day, dayOfWeek: 0 };
    const gregorian = convertNepaliToGregorian(nepali);

    cells.push({
      nepaliDate: nepali,
      gregorianDate: {
        year: gregorian.getFullYear(),
        month: gregorian.getMonth() + 1,
        day: gregorian.getDate(),
        dayOfWeek: gregorian.getDay()
      },
      isToday: isSameDay(gregorian, today),
      isCurrentMonth: false,
      isEmpty: false
    });
  }

  return {
    nepaliMonth,
    nepaliYear,
    monthName,
    cells,
    startDayOfWeek,
    daysInMonth
  };
}

/**
 * Renders the calendar grid to the DOM
 * @param calendarMonth - CalendarMonth object to render
 */
export function renderCalendarGrid(calendarMonth: CalendarMonth): void {
  const gridElement = document.getElementById('calendar-grid');
  if (!gridElement) return;

  // Clear existing content
  gridElement.innerHTML = '';

  // Render each date cell
  calendarMonth.cells.forEach(cell => {
    const cellElement = renderDateCell(cell);
    const nepaliDateString = formatNepaliDate(cell.nepaliDate);

    // T061: Add weekend class if date is a weekend
    if (isWeekendDay(cell.gregorianDate.dayOfWeek)) {
      cellElement.classList.add('weekend');
    }

    // T063-T064: Add holiday class and name if date is a holiday
    const holiday = getHolidayForDate(nepaliDateString);
    if (holiday) {
      cellElement.classList.add('holiday');

      // Add holiday name display
      const holidayNameElement = document.createElement('div');
      holidayNameElement.className = 'holiday-name';
      holidayNameElement.textContent = holiday.name;
      holidayNameElement.title = holiday.description || holiday.name;
      cellElement.appendChild(holidayNameElement);
    }

    // T028: Add notes indicator if date has notes
    addNotesIndicator(cellElement, nepaliDateString);

    // T029: Add click handler to open notes modal
    cellElement.addEventListener('click', () => {
      if (notesModalInstance) {
        notesModalInstance.openForDate(nepaliDateString);
      }
    });

    // Add pointer cursor to indicate clickability
    cellElement.style.cursor = 'pointer';

    gridElement.appendChild(cellElement);
  });
}

/**
 * Refresh notes indicators for the current calendar
 * Call this after notes are added/edited/deleted (T031)
 */
export function refreshCalendar(): void {
  const gridElement = document.getElementById('calendar-grid');
  if (!gridElement) return;

  // Get all date cells
  const dateCells = gridElement.querySelectorAll('.date-cell');

  dateCells.forEach(cell => {
    const cellElement = cell as HTMLElement;
    const nepaliDateString = cellElement.dataset.nepaliDate;

    if (nepaliDateString) {
      // Remove existing indicator
      const existingIndicator = cellElement.querySelector('.notes-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }

      // Re-add indicator if date still has notes
      addNotesIndicator(cellElement, nepaliDateString);
    }
  });
}
