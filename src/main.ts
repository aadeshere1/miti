// Main application entry point

import { initializeState, getState, navigateToNextMonth, navigateToPreviousMonth, navigateToToday } from './state/calendar-state';
import { generateCalendarGrid, renderCalendarGrid, setNotesModal, refreshCalendar } from './components/CalendarGrid';
import { renderWeekdayHeaders } from './components/WeekdayHeaders';
import { renderMonthHeader } from './components/MonthHeader';
import { NotesModal } from './notes/notes-modal';
import { NotesSidebar } from './sidebar/sidebar-component';
import { onNotesChange } from './utils/storage-sync';
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

  // Register notes change handler for multi-tab sync
  onNotesChange(() => {
    refreshCalendar();
    // T043: Refresh sidebar on notes change
    if (sidebarInstance) {
      sidebarInstance.refresh();
    }
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

  // Render initial calendar
  render();
}

// Start the application when DOM is ready
init();
