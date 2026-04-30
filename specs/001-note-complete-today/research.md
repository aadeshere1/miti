# Research: Note Completion & Today Highlight

**Feature**: 001-note-complete-today
**Date**: 2026-04-12
**Status**: Complete — all decisions resolved

---

## Decision 1: Today's Note Visibility Gap

**Decision**: Fix the `.notes-indicator` color collision on today's cell, then add a distinct `.notes-indicator` style for today via `.date-cell.today .notes-indicator`.

**Rationale**: The existing `.notes-indicator` badge uses `background: #0066cc` — the exact same blue as the `.today` cell background — making it invisible when a note exists on today's date. The fix is a CSS override that inverts the colors (white background, blue text) when the indicator is inside a today cell. No new HTML structure or JS logic needed.

**Alternatives considered**:
- Adding a separate today-note badge element: Rejected — unnecessary DOM complexity when a single CSS override suffices.
- Changing the base notes-indicator color globally: Rejected — would break visual consistency on non-today cells.

---

## Decision 2: Completion State Storage Strategy

**Decision**: Add `completed?: boolean` to the existing `Note` interface in `notes-types.ts` and persist it within the existing `miti:notes:YYYY-MM-DD` localStorage entries. No new storage key is needed.

**Rationale**: Completion is a property of a note, not a separate entity. Storing it inside the Note object keeps reads/writes atomic (one localStorage operation), avoids key proliferation, and is fully backwards-compatible (old notes without the field default to `completed: false`).

**Alternatives considered**:
- Separate key `miti:notes-completed:YYYY-MM-DD`: Rejected — two-key reads for every render, risk of orphaned keys.
- Completion at date level (not per note): Rejected — the spec requires per-note completion since each date can have multiple notes.

---

## Decision 3: Calendar Cell Completion Indicator

**Decision**: Add a CSS class `has-completed-notes` to the date cell when ANY note for that date is completed, and `all-notes-completed` when ALL notes are completed. The `notes-indicator` badge gets a visual modifier (checkmark prefix or strikethrough style) when all notes are done.

**Rationale**: Showing partial vs full completion gives the user richer at-a-glance information (some done vs everything done). Using CSS classes rather than separate DOM elements keeps `notes-ui.ts` changes minimal — just read completion state when building the indicator.

**Alternatives considered**:
- Only showing completion when ALL notes are done: Rejected — hides partial progress.
- A separate completion badge element: Rejected — overcrowds small date cells.

---

## Decision 4: Completion Toggle UI in Notes Modal

**Decision**: Add a checkbox/toggle button per note item in the notes list inside `NotesModal`. Clicking it calls a new `toggleNoteCompletion(nepaliDate, noteId)` storage function, then fires `onNotesChangeCallback` to refresh the calendar.

**Rationale**: The notes modal is already the interaction point for individual notes (edit/delete per note). Adding a toggle there is consistent with existing UX patterns. Re-using the `onNotesChangeCallback` hook means the calendar updates automatically with zero extra wiring.

**Alternatives considered**:
- Toggle directly on the date cell (without opening modal): Rejected — date cells are small; a toggle on the cell itself is error-prone and requires knowing which of multiple notes to toggle.

---

## No New Dependencies

All work uses existing TypeScript, localStorage, and CSS. No new libraries or build changes required.
