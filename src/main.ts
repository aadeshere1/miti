// Main application entry point

import { initializeState, getState, navigateToNextMonth, navigateToPreviousMonth, navigateToToday } from './state/calendar-state';
import { generateCalendarGrid, renderCalendarGrid } from './components/CalendarGrid';
import { renderWeekdayHeaders } from './components/WeekdayHeaders';
import { renderMonthHeader } from './components/MonthHeader';

/**
 * Main render function that orchestrates all rendering
 */
export function render(): void {
  const state = getState();

  // Generate calendar grid for current month
  const calendarMonth = generateCalendarGrid(state.currentMonth);

  // Render all components
  renderWeekdayHeaders();
  renderMonthHeader(calendarMonth.nepaliMonth, calendarMonth.nepaliYear, calendarMonth.monthName);
  renderCalendarGrid(calendarMonth);
}

/**
 * Initialize the application
 */
function init(): void {
  // Initialize state
  initializeState();

  // Set up navigation event listeners
  const prevButton = document.getElementById('prev-month');
  const nextButton = document.getElementById('next-month');
  const todayButton = document.getElementById('today-button');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      navigateToPreviousMonth();
      render();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      navigateToNextMonth();
      render();
    });
  }

  if (todayButton) {
    todayButton.addEventListener('click', () => {
      navigateToToday();
      render();
    });
  }

  // Render initial calendar
  render();
}

// Start the application when DOM is ready
init();
