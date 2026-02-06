// Notes UI utilities - Visual indicator for dates with notes

import { hasNotes, getNotesCount } from './notes-storage';

/**
 * Add notes indicator badge to a date cell
 * Per FR-006: Display visual indicator on date cells that have associated notes
 *
 * @param dateCell The date cell DOM element
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 */
export function addNotesIndicator(dateCell: HTMLElement, nepaliDate: string): void {
  // Remove existing indicator if present
  const existing = dateCell.querySelector('.notes-indicator');
  if (existing) {
    existing.remove();
  }

  // Check if date has notes
  if (hasNotes(nepaliDate)) {
    const count = getNotesCount(nepaliDate);

    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'notes-indicator';
    indicator.textContent = count.toString();
    indicator.title = `${count} note${count > 1 ? 's' : ''}`;

    // Add to date cell
    dateCell.appendChild(indicator);
  }
}

/**
 * Update notes indicator for a date cell
 * Call this after adding/editing/deleting notes
 *
 * @param dateCell The date cell DOM element
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 */
export function updateNotesIndicator(dateCell: HTMLElement, nepaliDate: string): void {
  addNotesIndicator(dateCell, nepaliDate);
}

/**
 * Remove notes indicator from a date cell
 *
 * @param dateCell The date cell DOM element
 */
export function removeNotesIndicator(dateCell: HTMLElement): void {
  const indicator = dateCell.querySelector('.notes-indicator');
  if (indicator) {
    indicator.remove();
  }
}
