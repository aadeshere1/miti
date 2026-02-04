// Weekday headers component

const WEEKDAY_NAMES: string[] = [
  "Sun",  // 0
  "Mon",  // 1
  "Tue",  // 2
  "Wed",  // 3
  "Thu",  // 4
  "Fri",  // 5
  "Sat"   // 6
];

/**
 * Renders the weekday headers (Sun-Sat) to the DOM
 */
export function renderWeekdayHeaders(): void {
  const headersElement = document.getElementById('weekday-headers');
  if (!headersElement) return;

  // Clear existing content
  headersElement.innerHTML = '';

  // Create header for each weekday
  WEEKDAY_NAMES.forEach(day => {
    const headerElement = document.createElement('div');
    headerElement.className = 'weekday-header';
    headerElement.textContent = day;
    headersElement.appendChild(headerElement);
  });
}
