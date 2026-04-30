# Implementation Plan: Note Completion & Today Highlight

**Branch**: `001-note-complete-today` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-note-complete-today/spec.md`

## Summary

Add per-note completion toggling to the notes modal, reflect completion state with visual indicators on calendar date cells, and fix the invisible notes badge on today's highlighted cell. All changes are purely client-side, using the existing localStorage note storage extended with a `completed` field on the `Note` type.

## Technical Context

**Language/Version**: TypeScript 5.9 → ES2020+ JavaScript
**Primary Dependencies**: @remotemerge/nepali-date-converter (already installed), Vite (build only)
**Storage**: Browser localStorage — existing `miti:notes:YYYY-MM-DD` keys, no new keys
**Testing**: Manual cross-browser (Chrome, Firefox, Safari) per constitution
**Target Platform**: Chrome Extension (new tab page) + modern browsers
**Project Type**: Single web application (vanilla TS, no framework)
**Performance Goals**: Calendar render < 100ms; note toggle < 10ms (localStorage read/write)
**Constraints**: No backend, no network requests, offline-first; bundle size increase < 1KB gzipped
**Scale/Scope**: Single-user local app; all data in localStorage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post-design below.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Calendar Accuracy (NON-NEGOTIABLE) | PASS | No date conversion logic changed |
| II. Browser Compatibility | PASS | Only CSS classes and localStorage — universal APIs |
| III. Offline-First Architecture | PASS | No network requests added |
| IV. Performance & Responsiveness | PASS | Two extra localStorage reads per indicator render; well under 10ms budget |
| V. Simplicity & Maintainability | PASS | No new abstractions; changes are additive to existing files |

**Post-design re-check**: All gates still pass. Bundle size increase is negligible (< 500 bytes minified). No new dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/001-note-complete-today/
├── plan.md              # This file
├── research.md          # Phase 0 — all decisions resolved
├── data-model.md        # Phase 1 — Note entity + derived state
├── quickstart.md        # Phase 1 — dev setup and manual test guide
├── contracts/
│   └── storage-api.md   # Phase 1 — function signatures and UI contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (files to modify)

```text
src/
├── notes/
│   ├── notes-types.ts       # Add completed?: boolean to Note interface
│   ├── notes-storage.ts     # Add toggleNoteCompletion, hasCompletedNotes, allNotesCompleted
│   ├── notes-ui.ts          # Update addNotesIndicator to apply completion CSS classes
│   └── notes-modal.ts       # Add completion toggle button per note in the list
└── styles/
    ├── calendar.css         # today+notes indicator visibility fix; completion cell styles
    └── modal.css            # Completed note item styles; toggle button styles
```

**Structure Decision**: Single-project layout. All changes are within existing files in `src/notes/` and `src/styles/`. No new files need to be created.

## Implementation Phases

### Phase A — Data Layer

1. **Extend Note type** (`notes-types.ts`)
   - Add `completed?: boolean` to the `Note` interface
   - No migration needed: absence of field treated as `false`

2. **Add storage functions** (`notes-storage.ts`)
   - `toggleNoteCompletion(nepaliDate, noteId): Note` — flips `completed`, updates `modified`
   - `hasCompletedNotes(nepaliDate): boolean` — true if any note has `completed: true`
   - `allNotesCompleted(nepaliDate): boolean` — true only if all notes are completed

### Phase B — Calendar Cell Visual

3. **Update notes indicator** (`notes-ui.ts`)
   - In `addNotesIndicator`, after building the indicator badge, call `hasCompletedNotes` and `allNotesCompleted`
   - Remove `has-completed-notes` and `all-notes-completed` classes from `dateCell` before re-evaluating
   - Apply `has-completed-notes` when some notes are completed; apply `all-notes-completed` when all are

4. **CSS — today cell notes visibility** (`calendar.css`)
   - Add `.date-cell.today .notes-indicator` override: white background, `#0066cc` text (inverted from default)
   - Add `.date-cell.all-notes-completed .notes-indicator` style: green-tinted badge or checkmark indication
   - Add `.date-cell.has-completed-notes .notes-indicator` style: subtle completed tint

### Phase C — Notes Modal UI

5. **Add completion toggle per note** (`notes-modal.ts`)
   - In the note list render function, add a toggle button (`note-complete-btn`) alongside existing edit/delete buttons
   - Button shows active state (`note-complete-btn--active`) when `note.completed === true`
   - Note item gets class `note-item--completed` when completed (for CSS strikethrough/grey styling)
   - Click handler: `toggleNoteCompletion(currentDate, note.id)` → re-render list → fire `onNotesChangeCallback`

6. **CSS — completed note styles** (`modal.css`)
   - `.note-item--completed .note-text`: subdued appearance (e.g., reduced opacity, optional strikethrough)
   - `.note-complete-btn`: base toggle button style
   - `.note-complete-btn--active`: active/checked state (green tint or checkmark)

## Dependency Order

```
Phase A (data layer) → Phase B (calendar UI) → Phase C (modal UI)
```

Phase B and C can be developed in parallel once Phase A is complete.

## Complexity Tracking

No violations of constitution principles. No complexity tracking entry needed.
