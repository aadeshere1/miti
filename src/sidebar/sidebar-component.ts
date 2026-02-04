// Notes sidebar component for displaying month overview

import { getNotesForMonth } from '../notes/notes-storage';
import type { Note } from '../notes/notes-types';
import type { NotesModal } from '../notes/notes-modal';
import { navigateToDate } from '../state/calendar-state';
import { getSettings } from '../settings/settings-storage';

/**
 * NotesSidebar class manages the monthly notes overview sidebar
 */
export class NotesSidebar {
  private currentYear: number = 0;
  private currentMonth: number = 0;
  private notesModalInstance: NotesModal | null = null;
  private renderCallback: (() => void) | null = null;

  /**
   * Set the notes modal instance for integration
   */
  setNotesModal(modal: NotesModal): void {
    this.notesModalInstance = modal;
  }

  /**
   * Set the render callback for triggering calendar re-render
   */
  setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  /**
   * Render the sidebar with notes for specified month (T033)
   * @param year Nepali year
   * @param month Nepali month (1-12)
   */
  render(year: number, month: number): void {
    this.currentYear = year;
    this.currentMonth = month;

    const sidebarElement = document.getElementById('notes-sidebar');
    if (!sidebarElement) return;

    const notesMap = getNotesForMonth(year, month);

    if (notesMap.size === 0) {
      this.renderEmptyState(sidebarElement);
    } else {
      this.renderNotesList(sidebarElement, notesMap);
    }
  }

  /**
   * Render the list of notes grouped by date (T034)
   * @param container Container element
   * @param notesMap Map of date to notes array
   */
  private renderNotesList(container: HTMLElement, notesMap: Map<string, Note[]>): void {
    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(notesMap.keys()).sort((a, b) => b.localeCompare(a));

    let html = '<div class="sidebar-header"><h3>Notes This Month</h3></div>';
    html += '<div class="sidebar-content">';

    sortedDates.forEach(date => {
      const notes = notesMap.get(date)!;
      const [year, month, day] = date.split('-');

      html += `<div class="sidebar-date-group" data-date="${date}">`;
      html += `<div class="sidebar-date-label">${year}-${month}-${day}</div>`;

      notes.forEach(note => {
        const previewText = this.truncateText(note.text, 80);
        const timestamp = new Date(note.timestamp).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });

        html += `<div class="sidebar-note-item" data-date="${date}" data-note-id="${note.id}">`;
        html += `<div class="sidebar-note-text">${this.escapeHtml(previewText)}</div>`;
        html += `<div class="sidebar-note-meta">${timestamp}</div>`;
        html += `</div>`;
      });

      html += `</div>`;
    });

    html += '</div>';
    container.innerHTML = html;

    // Add click handlers (T036)
    this.attachClickHandlers(container);
  }

  /**
   * Render empty state when no notes exist (T035)
   * @param container Container element
   */
  private renderEmptyState(container: HTMLElement): void {
    container.innerHTML = `
      <div class="sidebar-header"><h3>Notes This Month</h3></div>
      <div class="sidebar-content">
        <div class="sidebar-empty">
          <p>No notes for this month</p>
          <p class="sidebar-empty-hint">Click any date to add a note</p>
        </div>
      </div>
    `;
  }

  /**
   * Refresh the sidebar display (T037)
   */
  refresh(): void {
    if (this.currentYear && this.currentMonth) {
      this.render(this.currentYear, this.currentMonth);
    }
  }

  /**
   * Attach click handlers to sidebar notes (T036)
   * @param container Container element
   */
  private attachClickHandlers(container: HTMLElement): void {
    const noteItems = container.querySelectorAll('.sidebar-note-item');

    noteItems.forEach(item => {
      item.addEventListener('click', () => {
        const date = (item as HTMLElement).dataset.date;

        if (date && this.notesModalInstance) {
          // Jump to date and open modal
          const [year, month, day] = date.split('-').map(Number);
          navigateToDate(year, month, day);

          // Trigger calendar re-render
          if (this.renderCallback) {
            this.renderCallback();
          }

          // Open notes modal for this date
          this.notesModalInstance.openForDate(date);
        }
      });
    });
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Apply sidebar settings from storage (T052)
 * Updates sidebar position and visibility based on user settings
 */
export function applySidebarSettings(): void {
  const settings = getSettings();
  const appContainer = document.getElementById('app');
  const sidebar = document.getElementById('notes-sidebar');

  if (!appContainer || !sidebar) return;

  // Apply position class (T054)
  appContainer.classList.remove('position-left', 'position-right');
  appContainer.classList.add(`position-${settings.sidebarPosition}`);

  // Apply visibility (T055)
  if (settings.sidebarEnabled) {
    sidebar.classList.remove('sidebar-hidden');
  } else {
    sidebar.classList.add('sidebar-hidden');
  }
}
