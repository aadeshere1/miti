// Month header component

/**
 * Renders the month/year header display
 * @param nepaliMonth - Nepali month number (1-12)
 * @param nepaliYear - Nepali year (e.g., 2082)
 * @param monthName - English month name (e.g., "Magh")
 */
export function renderMonthHeader(nepaliMonth: number, nepaliYear: number, monthName: string): void {
  const headerElement = document.getElementById('month-year');
  if (!headerElement) return;

  // Display format: "Magh 2082"
  headerElement.textContent = `${monthName} ${nepaliYear}`;
}
