// Date cell component

import type { DateCell } from '../types';

/**
 * Renders a single date cell with dual dates
 * @param cell - DateCell object
 * @returns HTML element for the date cell
 */
export function renderDateCell(cell: DateCell): HTMLElement {
  const cellElement = document.createElement('div');
  cellElement.className = 'date-cell';

  // Add classes for styling
  if (cell.isToday) {
    cellElement.classList.add('today');
  }
  if (!cell.isCurrentMonth) {
    cellElement.classList.add('other-month');
  }

  // Nepali date (prominent)
  const nepaliDateElement = document.createElement('span');
  nepaliDateElement.className = 'nepali-date';
  nepaliDateElement.textContent = cell.nepaliDate.day.toString();

  // Gregorian date (bottom right, smaller)
  const gregorianDateElement = document.createElement('span');
  gregorianDateElement.className = 'gregorian-date';
  gregorianDateElement.textContent = cell.gregorianDate.day.toString();

  cellElement.appendChild(nepaliDateElement);
  cellElement.appendChild(gregorianDateElement);

  return cellElement;
}
