// Notes storage layer - localStorage CRUD operations
// Per FR-001 through FR-006: Notes management with persistence

import { Note, MAX_NOTE_LENGTH } from './notes-types';
import { generateUUID } from '../utils/uuid';
import { setItem, getItem, removeItem } from '../utils/storage';

/**
 * Get all notes for a specific date
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns Array of notes (empty if no notes exist)
 */
export function getNotesForDate(nepaliDate: string): Note[] {
  const key = `miti:notes:${nepaliDate}`;
  return getItem<Note[]>(key, [])!;
}

/**
 * Get all notes for a specific month
 * @param year Nepali year (e.g., 2082)
 * @param month Nepali month (1-12)
 * @returns Map of date to notes array
 */
export function getNotesForMonth(year: number, month: number): Map<string, Note[]> {
  const monthNotes = new Map<string, Note[]>();
  const prefix = `miti:notes:${year}-${String(month).padStart(2, '0')}`;

  // Iterate through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const notes = getItem<Note[]>(key, [])!;
      if (notes.length > 0) {
        // Extract date from key: "miti:notes:YYYY-MM-DD" -> "YYYY-MM-DD"
        const date = key.replace('miti:notes:', '');
        monthNotes.set(date, notes);
      }
    }
  }

  return monthNotes;
}

/**
 * Add a new note to a date
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @param text Note content (max 5000 characters)
 * @returns Created note with generated ID and timestamps
 * @throws Error if text exceeds limit or localStorage quota exceeded
 */
export function addNote(nepaliDate: string, text: string): Note {
  // Validate text length
  if (text.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note exceeds ${MAX_NOTE_LENGTH} character limit`);
  }

  if (text.trim().length === 0) {
    throw new Error('Note text cannot be empty');
  }

  // Get existing notes
  const notes = getNotesForDate(nepaliDate);

  // Create new note
  const now = Date.now();
  const note: Note = {
    id: generateUUID(),
    text: text.trim(),
    timestamp: now,
    created: now,
    modified: now,
  };

  // Add to array
  notes.push(note);

  // Save to localStorage
  const key = `miti:notes:${nepaliDate}`;
  setItem(key, notes);

  return note;
}

/**
 * Update an existing note
 * @param nepaliDate Date the note belongs to
 * @param noteId Note ID to update
 * @param text New note content
 * @returns Updated note with new modified timestamp
 * @throws Error if note not found or text exceeds limit
 */
export function updateNote(nepaliDate: string, noteId: string, text: string): Note {
  // Validate text length
  if (text.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note exceeds ${MAX_NOTE_LENGTH} character limit`);
  }

  if (text.trim().length === 0) {
    throw new Error('Note text cannot be empty');
  }

  // Get existing notes
  const notes = getNotesForDate(nepaliDate);

  // Find note by ID
  const note = notes.find(n => n.id === noteId);
  if (!note) {
    throw new Error(`Note with ID ${noteId} not found`);
  }

  // Update note
  note.text = text.trim();
  note.modified = Date.now();
  note.timestamp = note.modified;

  // Save to localStorage
  const key = `miti:notes:${nepaliDate}`;
  setItem(key, notes);

  return note;
}

/**
 * Delete a note
 * @param nepaliDate Date the note belongs to
 * @param noteId Note ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteNote(nepaliDate: string, noteId: string): boolean {
  // Get existing notes
  const notes = getNotesForDate(nepaliDate);

  // Find note index
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) {
    return false;
  }

  // Remove note
  notes.splice(index, 1);

  // Save or remove key if empty
  const key = `miti:notes:${nepaliDate}`;
  if (notes.length === 0) {
    removeItem(key);
  } else {
    setItem(key, notes);
  }

  return true;
}

/**
 * Check if a date has any notes
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns true if date has notes, false otherwise
 */
export function hasNotes(nepaliDate: string): boolean {
  const key = `miti:notes:${nepaliDate}`;
  const value = localStorage.getItem(key);
  return value !== null && value !== '[]';
}

/**
 * Get count of notes for a date
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns Number of notes (0 if none exist)
 */
export function getNotesCount(nepaliDate: string): number {
  const notes = getNotesForDate(nepaliDate);
  return notes.length;
}

/**
 * Delete all notes for a specific date
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 * @returns Number of notes deleted
 */
export function deleteAllNotesForDate(nepaliDate: string): number {
  const notes = getNotesForDate(nepaliDate);
  const count = notes.length;

  if (count > 0) {
    const key = `miti:notes:${nepaliDate}`;
    removeItem(key);
  }

  return count;
}
