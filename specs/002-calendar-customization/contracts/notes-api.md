# Notes API Contract

**Module**: `src/notes/notes-storage.ts`
**Purpose**: CRUD operations for note management with localStorage persistence

## TypeScript Interface

```typescript
/**
 * Notes Storage API
 * Provides create, read, update, delete operations for notes
 */
export interface NotesAPI {
  /**
   * Get all notes for a specific date
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns Array of notes (empty if no notes exist)
   */
  getNotesForDate(nepaliDate: string): Note[];

  /**
   * Get all notes for a specific month
   * @param year - Nepali year (e.g., 2082)
   * @param month - Nepali month (1-12)
   * @returns Map of date to notes array
   */
  getNotesForMonth(year: number, month: number): Map<string, Note[]>;

  /**
   * Add a new note to a date
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @param text - Note content (max 5000 characters)
   * @returns Created note with generated ID and timestamps
   * @throws Error if text exceeds limit or localStorage quota exceeded
   */
  addNote(nepaliDate: string, text: string): Note;

  /**
   * Update an existing note
   * @param nepaliDate - Date the note belongs to
   * @param noteId - Note ID to update
   * @param text - New note content
   * @returns Updated note with new modified timestamp
   * @throws Error if note not found or text exceeds limit
   */
  updateNote(nepaliDate: string, noteId: string, text: string): Note;

  /**
   * Delete a note
   * @param nepaliDate - Date the note belongs to
   * @param noteId - Note ID to delete
   * @returns true if deleted, false if not found
   */
  deleteNote(nepaliDate: string, noteId: string): boolean;

  /**
   * Check if a date has any notes
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns true if date has notes, false otherwise
   */
  hasNotes(nepaliDate: string): boolean;

  /**
   * Get count of notes for a date
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns Number of notes (0 if none exist)
   */
  getNotesCount(nepaliDate: string): number;

  /**
   * Delete all notes for a specific date
   * @param nepaliDate - Date in format YYYY-MM-DD (BS)
   * @returns Number of notes deleted
   */
  deleteAllNotesForDate(nepaliDate: string): number;
}

/**
 * Note entity
 */
export interface Note {
  id: string;              // UUID v4
  text: string;            // Max 5000 characters
  timestamp: number;       // Last modified (Unix ms)
  created: number;         // Creation time (Unix ms)
  modified: number;        // Last modified (Unix ms)
}
```

## Usage Examples

### Get notes for a date
```typescript
import { getNotesForDate } from './notes-storage';

const notes = getNotesForDate('2082-09-15');
console.log(`Found ${notes.length} notes`);
```

### Add a new note
```typescript
import { addNote } from './notes-storage';

try {
  const note = addNote('2082-09-15', 'Doctor appointment at 3 PM');
  console.log('Note created:', note.id);
} catch (error) {
  console.error('Failed to create note:', error.message);
}
```

### Update a note
```typescript
import { updateNote } from './notes-storage';

const updated = updateNote('2082-09-15', noteId, 'Updated appointment time');
console.log('Note updated at:', new Date(updated.modified));
```

### Delete a note
```typescript
import { deleteNote } from './notes-storage';

const deleted = deleteNote('2082-09-15', noteId);
if (deleted) {
  console.log('Note deleted successfully');
}
```

### Get all notes for current month
```typescript
import { getNotesForMonth } from './notes-storage';

const monthNotes = getNotesForMonth(2082, 9);  // Mangsir 2082
monthNotes.forEach((notes, date) => {
  console.log(`${date}: ${notes.length} notes`);
});
```

## Error Handling

### QuotaExceededError
Thrown when localStorage is full:
```typescript
try {
  addNote(date, longText);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    alert('Storage full. Please delete old notes.');
  }
}
```

### ValidationError
Thrown when input validation fails:
```typescript
try {
  addNote(date, 'x'.repeat(6000));  // Exceeds 5000 char limit
} catch (error) {
  if (error instanceof ValidationError) {
    alert(error.message);  // "Text exceeds 5000 character limit"
  }
}
```

## Performance Characteristics

- **getNotesForDate**: O(1) - Direct localStorage key lookup
- **getNotesForMonth**: O(n) - Iterates over all localStorage keys with prefix
- **addNote**: O(n) - Read array, append, write (n = notes for that date)
- **updateNote**: O(n) - Read array, find by ID, update, write
- **deleteNote**: O(n) - Read array, filter by ID, write
- **hasNotes**: O(1) - Check key existence
- **getNotesCount**: O(1) - Parse array and return length

## Storage Format

```json
{
  "miti:notes:2082-09-15": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Doctor appointment",
      "timestamp": 1738665600000,
      "created": 1738665600000,
      "modified": 1738665900000
    }
  ]
}
```
