// Main application entry point

import { initializeState, getState, navigateToNextMonth, navigateToPreviousMonth, navigateToToday } from './state/calendar-state';
import { generateCalendarGrid, renderCalendarGrid, setNotesModal, refreshCalendar } from './components/CalendarGrid';
import { renderWeekdayHeaders } from './components/WeekdayHeaders';
import { renderMonthHeader } from './components/MonthHeader';
import { NotesModal } from './notes/notes-modal';
import { NotesSidebar, applySidebarSettings } from './sidebar/sidebar-component';
import { SettingsModal } from './settings/settings-modal';
import { themeManager } from './theme/theme-manager';
import { onNotesChange, onSettingsChange } from './utils/storage-sync';
import { convertGregorianToNepali } from './calendar/conversions';

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

// Start the application when DOM is ready
init();
