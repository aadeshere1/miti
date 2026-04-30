# Quickstart: Note Completion & Today Highlight

**Feature**: 001-note-complete-today
**Branch**: `001-note-complete-today`

---

## Prerequisites

Node.js 20.19+ or 22.12+ (Vite requirement). Run `node --version` to check.

## Development Setup

```bash
# Install dependencies (already done if working on the project)
npm install

# Start dev server (http://localhost:3000)
npm run dev
```

## Files to Change

| File | Change Type | What |
|------|-------------|------|
| `src/notes/notes-types.ts` | Modify | Add `completed?: boolean` to `Note` interface |
| `src/notes/notes-storage.ts` | Modify | Add `toggleNoteCompletion`, `hasCompletedNotes`, `allNotesCompleted` functions |
| `src/notes/notes-ui.ts` | Modify | Update `addNotesIndicator` to apply completion CSS classes to date cell |
| `src/notes/notes-modal.ts` | Modify | Add completion toggle button per note item in the rendered list |
| `src/styles/calendar.css` | Modify | Add styles for `.date-cell.today .notes-indicator`, `.all-notes-completed .notes-indicator`, `.has-completed-notes .notes-indicator` |
| `src/styles/modal.css` | Modify | Add styles for `.note-item--completed`, `.note-complete-btn`, `.note-complete-btn--active` |

## Build & Verify

```bash
# Type-check only (fast)
npm run typecheck

# Build extension for manual browser testing
npm run build:extension
# Then load dist/ as unpacked Chrome extension and verify visually
```

## Manual Test Checklist

1. Open the calendar. Confirm today's date cell is highlighted in blue.
2. Open today's date, add a note. Confirm the notes indicator is visible on the blue today cell (white badge).
3. In the notes modal, click the completion toggle on a note. Confirm:
   - The note item shows a completed visual state (strikethrough or greyed text).
   - The toggle button appears active/checked.
4. Close the modal. Confirm the date cell shows the completed indicator.
5. Reload the page. Confirm the completed state is preserved.
6. Reopen the modal and un-complete the note. Confirm the cell reverts to normal note state.
7. Delete all notes for a date. Confirm no completion indicator remains.
8. Add multiple notes to one date, complete only some. Confirm `has-completed-notes` (partial) state is shown.
9. Complete all notes for a date. Confirm `all-notes-completed` state is shown.
