// Main application entry point

import { initializeState, getState, navigateToNextMonth, navigateToPreviousMonth, navigateToToday } from './state/calendar-state';
import { generateCalendarGrid, renderCalendarGrid, setNotesModal, refreshCalendar } from './components/CalendarGrid';
import { renderWeekdayHeaders } from './components/WeekdayHeaders';
import { renderMonthHeader } from './components/MonthHeader';
import { NotesModal } from './notes/notes-modal';
import { NotesSidebar, applySidebarSettings } from './sidebar/sidebar-component';
import { SettingsModal } from './settings/settings-modal';
import { themeManager } from './theme/theme-manager';
import { loadHolidays } from './holidays/holidays-loader';
import { showErrorNotification, showLoadingIndicator, hideLoadingIndicator } from './utils/notifications';
import { onNotesChange, onSettingsChange } from './utils/storage-sync';
import { convertGregorianToNepali } from './calendar/conversions';
import { checkStorageUsage } from './utils/storage';

// Global sidebar instance
let sidebarInstance: NotesSidebar | null = null;

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

  // T041: Update sidebar when month changes
  if (sidebarInstance) {
    const nepaliDate = convertGregorianToNepali(state.currentMonth);
    sidebarInstance.render(nepaliDate.year, nepaliDate.month);
  }
}

/**
 * Initialize the application
 */
function init(): void {
  // Initialize state
  initializeState();

  // T118: Check localStorage usage on startup and warn if over 80%
  checkStorageUsage();

  // Initialize notes modal
  const notesModal = new NotesModal();
  setNotesModal(notesModal);

  // T040: Initialize notes sidebar
  sidebarInstance = new NotesSidebar();
  sidebarInstance.setNotesModal(notesModal);
  sidebarInstance.setRenderCallback(render);

  // T042: Register sidebar refresh when notes change in modal
  notesModal.onNotesChange(() => {
    if (sidebarInstance) {
      sidebarInstance.refresh();
    }
  });

  // T058: Initialize settings modal
  const settingsModal = new SettingsModal();

  // T056: Apply sidebar settings on initialization
  applySidebarSettings();

  // T088: Apply theme on initialization
  themeManager.applyTheme();

  // T117: Show loading indicator for holiday data
  showLoadingIndicator('Loading holidays...');

  // T103: Load holidays from JSON with error handling
  loadHolidays('/holidays/holidays.json')
    .then(() => {
      // T117: Hide loading indicator
      hideLoadingIndicator();
      // Holidays loaded successfully, re-render to show holiday highlighting
      render();
    })
    .catch((error) => {
      // T117: Hide loading indicator
      hideLoadingIndicator();
      // T107: Show user-friendly error message
      console.error('Failed to load holidays:', error);
      showErrorNotification(
        'Unable to load holiday data. Calendar will function normally without holiday highlighting.',
        8000
      );
    });

  // Register settings change handler
  settingsModal.onSettingsChange(() => {
    applySidebarSettings();
    // T089: Apply theme immediately for visual feedback
    themeManager.applyTheme();
    // T070: Re-render calendar to apply weekend highlighting changes
    render();
  });

  // Register notes change handler for multi-tab sync
  onNotesChange(() => {
    refreshCalendar();
    // T043: Refresh sidebar on notes change
    if (sidebarInstance) {
      sidebarInstance.refresh();
    }
  });

  // T059 & T071: Register settings change handler for multi-tab sync
  onSettingsChange(() => {
    applySidebarSettings();
    // T090: Apply theme on multi-tab sync
    themeManager.applyTheme();
    // Re-render calendar for weekend highlighting changes
    render();
  });

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

  // T057: Set up settings button event listener
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      settingsModal.open();
    });
  }

  // Render initial calendar
  render();
}

// T124: Global error handler for unhandled exceptions
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  showErrorNotification(
    'An unexpected error occurred. The calendar will continue to function normally.',
    5000
  );
  // Prevent default error handling
  event.preventDefault();
});

// T124: Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorNotification(
    'An unexpected error occurred. The calendar will continue to function normally.',
    5000
  );
  // Prevent default rejection handling
  event.preventDefault();
});

// Start the application when DOM is ready
init();
