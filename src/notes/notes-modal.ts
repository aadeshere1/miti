// Notes Modal component - UI for viewing/editing/deleting notes
// Extends Modal base class with notes-specific functionality

import { Modal } from '../components/Modal';
import { Note, MAX_NOTE_LENGTH } from './notes-types';
import {
  getNotesForDate,
  addNote,
  updateNote,
  deleteNote,
} from './notes-storage';

export class NotesModal extends Modal {
  private currentDate: string | null = null;
  private editingNoteId: string | null = null;
  private onNotesChangeCallback?: () => void;

  constructor() {
    super('notes-modal');
    this.setupModalContent();
  }

  /**
   * Open modal for a specific date
   * @param nepaliDate Date in format YYYY-MM-DD (BS)
   */
  public openForDate(nepaliDate: string): void {
    this.currentDate = nepaliDate;
    this.editingNoteId = null;
    this.loadNotes();
    this.open();
  }

  /**
   * Register callback for notes changes
   * @param callback Function to call when notes are added/edited/deleted
   */
  public onNotesChange(callback: () => void): void {
    this.onNotesChangeCallback = callback;
  }

  /**
   * Setup modal content structure
   */
  private setupModalContent(): void {
    const content = this.getContentElement();
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title" id="notes-modal-title">Notes</h2>
        <button class="modal-close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <div id="notes-list"></div>
        <div class="modal-form-group">
          <label class="modal-label" for="note-text">
            <span id="form-label">Add Note</span>
          </label>
          <textarea
            id="note-text"
            class="modal-textarea"
            placeholder="Enter your note here..."
            maxlength="${MAX_NOTE_LENGTH}"
          ></textarea>
          <div class="modal-char-counter">
            <span id="char-count">0</span> / ${MAX_NOTE_LENGTH}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-button modal-button-secondary" id="cancel-btn">
          Cancel
        </button>
        <button class="modal-button modal-button-primary" id="save-btn">
          Save Note
        </button>
      </div>
    `;

    // Attach event listeners
    content.querySelector('.modal-close')?.addEventListener('click', () => this.handleCancel());
    content.querySelector('#cancel-btn')?.addEventListener('click', () => this.handleCancel());
    content.querySelector('#save-btn')?.addEventListener('click', () => this.handleSave());

    const textarea = content.querySelector('#note-text') as HTMLTextAreaElement;
    textarea?.addEventListener('input', () => this.updateCharCount());
  }

  /**
   * Load and render notes for current date
   */
  private loadNotes(): void {
    if (!this.currentDate) return;

    const notes = getNotesForDate(this.currentDate);
    this.renderNotesList(notes);

    // Update modal title with date
    const titleEl = this.getContentElement().querySelector('#notes-modal-title');
    if (titleEl) {
      titleEl.textContent = `Notes for ${this.currentDate}`;
    }
  }

  /**
   * Render list of notes
   * @param notes Array of notes to display
   */
  private renderNotesList(notes: Note[]): void {
    const listContainer = this.getContentElement().querySelector('#notes-list');
    if (!listContainer) return;

    if (notes.length === 0) {
      listContainer.innerHTML = '<p class="notes-empty">No notes for this date</p>';
      return;
    }

    // Sort by timestamp (newest first)
    const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);

    listContainer.innerHTML = sortedNotes.map(note => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-content">${this.escapeHtml(note.text)}</div>
        <div class="note-meta">
          <span class="note-time">${this.formatTimestamp(note.timestamp)}</span>
          <div class="note-actions">
            <button class="note-action-btn" data-action="edit" data-note-id="${note.id}">
              Edit
            </button>
            <button class="note-action-btn note-delete-btn" data-action="delete" data-note-id="${note.id}">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach action listeners
    listContainer.querySelectorAll('.note-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleNoteAction(e));
    });
  }

  /**
   * Handle note action (edit/delete)
   */
  private handleNoteAction(event: Event): void {
    const btn = event.target as HTMLElement;
    const action = btn.dataset.action;
    const noteId = btn.dataset.noteId;

    if (!noteId) return;

    if (action === 'edit') {
      this.handleEditNote(noteId);
    } else if (action === 'delete') {
      this.handleDeleteNote(noteId);
    }
  }

  /**
   * Handle editing a note
   */
  private handleEditNote(noteId: string): void {
    if (!this.currentDate) return;

    const notes = getNotesForDate(this.currentDate);
    const note = notes.find(n => n.id === noteId);

    if (!note) return;

    // Load note into form
    const textarea = this.getContentElement().querySelector('#note-text') as HTMLTextAreaElement;
    const formLabel = this.getContentElement().querySelector('#form-label');
    const saveBtn = this.getContentElement().querySelector('#save-btn');

    if (textarea && formLabel && saveBtn) {
      textarea.value = note.text;
      formLabel.textContent = 'Edit Note';
      saveBtn.textContent = 'Update Note';
      this.editingNoteId = noteId;
      this.updateCharCount();
      textarea.focus();
    }
  }

  /**
   * Handle deleting a note
   */
  private handleDeleteNote(noteId: string): void {
    if (!this.currentDate) return;

    if (confirm('Are you sure you want to delete this note?')) {
      const success = deleteNote(this.currentDate, noteId);

      if (success) {
        this.loadNotes();
        this.notifyChange();
      }
    }
  }

  /**
   * Handle save button click
   */
  private handleSave(): void {
    if (!this.currentDate) return;

    const textarea = this.getContentElement().querySelector('#note-text') as HTMLTextAreaElement;
    const text = textarea.value.trim();

    if (!text) {
      alert('Please enter some text for the note');
      return;
    }

    try {
      if (this.editingNoteId) {
        // Update existing note
        updateNote(this.currentDate, this.editingNoteId, text);
      } else {
        // Add new note
        addNote(this.currentDate, text);
      }

      // Reset form and reload
      textarea.value = '';
      this.editingNoteId = null;
      const formLabel = this.getContentElement().querySelector('#form-label');
      const saveBtn = this.getContentElement().querySelector('#save-btn');
      if (formLabel) formLabel.textContent = 'Add Note';
      if (saveBtn) saveBtn.textContent = 'Save Note';

      this.loadNotes();
      this.updateCharCount();
      this.notifyChange();
    } catch (error: any) {
      alert(error.message || 'Failed to save note');
    }
  }

  /**
   * Handle cancel button click
   */
  private handleCancel(): void {
    // Reset form
    const textarea = this.getContentElement().querySelector('#note-text') as HTMLTextAreaElement;
    if (textarea) textarea.value = '';

    this.editingNoteId = null;
    const formLabel = this.getContentElement().querySelector('#form-label');
    const saveBtn = this.getContentElement().querySelector('#save-btn');
    if (formLabel) formLabel.textContent = 'Add Note';
    if (saveBtn) saveBtn.textContent = 'Save Note';

    this.close();
  }

  /**
   * Update character count display
   */
  private updateCharCount(): void {
    const textarea = this.getContentElement().querySelector('#note-text') as HTMLTextAreaElement;
    const counter = this.getContentElement().querySelector('#char-count');

    if (textarea && counter) {
      const length = textarea.value.length;
      counter.textContent = length.toString();

      // Update counter styling based on length
      const counterParent = counter.parentElement;
      if (counterParent) {
        counterParent.classList.remove('warning', 'error');
        if (length > MAX_NOTE_LENGTH * 0.9) {
          counterParent.classList.add('error');
        } else if (length > MAX_NOTE_LENGTH * 0.75) {
          counterParent.classList.add('warning');
        }
      }
    }
  }

  /**
   * Notify that notes have changed
   */
  private notifyChange(): void {
    if (this.onNotesChangeCallback) {
      this.onNotesChangeCallback();
    }
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
