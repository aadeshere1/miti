# Storage API Contracts: Note Completion & Today Highlight

**Feature**: 001-note-complete-today
**Date**: 2026-04-12
**Note**: This is a browser-only app with no network API. Contracts are expressed as TypeScript function signatures.

---

## New Function: toggleNoteCompletion

**File**: `src/notes/notes-storage.ts`

```typescript
/**
 * Toggle the completed status of a specific note.
 * Updates the note's `completed` field and `modified` timestamp.
 *
 * @param nepaliDate  Date in format YYYY-MM-DD (BS)
 * @param noteId      ID of the note to toggle
 * @returns           Updated note with new completed state
 * @throws            Error if note not found
 */
function toggleNoteCompletion(nepaliDate: string, noteId: string): Note
```

**Behaviour**:
- Reads existing notes array for `nepaliDate`
- Finds note by `noteId`; throws `Error('Note with ID {noteId} not found')` if missing
- Flips `note.completed` (`true → false`, `false/undefined → true`)
- Sets `note.modified = Date.now()`
- Persists updated array to `miti:notes:{nepaliDate}`
- Returns updated Note object

---

## New Function: hasCompletedNotes

**File**: `src/notes/notes-storage.ts`

```typescript
/**
 * Check if a date has at least one completed note.
 *
 * @param nepaliDate  Date in format YYYY-MM-DD (BS)
 * @returns           true if any note has completed: true
 */
function hasCompletedNotes(nepaliDate: string): boolean
```

---

## New Function: allNotesCompleted

**File**: `src/notes/notes-storage.ts`

```typescript
/**
 * Check if ALL notes for a date are completed.
 * Returns false if the date has no notes.
 *
 * @param nepaliDate  Date in format YYYY-MM-DD (BS)
 * @returns           true only if notes.length > 0 AND every note has completed: true
 */
function allNotesCompleted(nepaliDate: string): boolean
```

---

## Modified Function: addNote

**File**: `src/notes/notes-storage.ts`

No signature change. The returned `Note` object will now include `completed: false` as its initial state.

---

## Modified Function: updateNote

**File**: `src/notes/notes-storage.ts`

No signature change. `completed` field is preserved unchanged when text is updated.

---

## Modified Function: deleteNote

**File**: `src/notes/notes-storage.ts`

No signature change. Existing behaviour: when the last note is deleted the key is removed from localStorage, which implicitly clears all completion state for that date.

---

## Modified Function: addNotesIndicator (notes-ui.ts)

**File**: `src/notes/notes-ui.ts`

```typescript
/**
 * Add notes indicator badge to a date cell.
 * Badge reflects completion state (partial or full).
 *
 * @param dateCell   The date cell DOM element
 * @param nepaliDate Date in format YYYY-MM-DD (BS)
 */
function addNotesIndicator(dateCell: HTMLElement, nepaliDate: string): void
```

**Behaviour change**: In addition to showing the note count, the function now:
1. Reads completion state via `hasCompletedNotes()` and `allNotesCompleted()`
2. Adds `has-completed-notes` class to `dateCell` when any note is completed
3. Adds `all-notes-completed` class (replacing the above) when all are completed
4. Removes both classes before re-evaluating (for refresh correctness)

---

## UI Contract: Completion Toggle in NotesModal

**File**: `src/notes/notes-modal.ts`

Each note item rendered in the notes list gains a toggle button:

```html
<button class="note-complete-btn" data-note-id="{noteId}" aria-label="Mark as complete">
  ✓
</button>
```

- When clicked: calls `toggleNoteCompletion(currentDate, noteId)`, then fires `onNotesChangeCallback` and re-renders the notes list.
- When `note.completed === true`: button gets class `note-complete-btn--active`; note item gets class `note-item--completed`
