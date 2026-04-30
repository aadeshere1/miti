# Tasks: Note Completion & Today Highlight

**Input**: Design documents from `specs/001-note-complete-today/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2])
- Exact file paths included in every task description

## Path Conventions

Single project layout — all source files under `src/` at repository root.

---

## Phase 1: Setup

**Purpose**: No new files or project initialization needed. All changes are additive modifications to existing files. Phase 1 is a single orientation step.

- [x] T001 Read `specs/001-note-complete-today/plan.md`, `data-model.md`, and `contracts/storage-api.md` to confirm understanding before any code changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the `Note` type and add the storage functions that every subsequent task depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `completed?: boolean` field to the `Note` interface in `src/notes/notes-types.ts` (add after `modified: number;` with comment `// Completion status — absent means false (backwards compatible)`)
- [x] T003 Add `toggleNoteCompletion(nepaliDate: string, noteId: string): Note` function to `src/notes/notes-storage.ts` — flips `note.completed`, updates `note.modified`, persists, returns updated Note; throws if noteId not found (depends on T002)
- [x] T004 Add `hasCompletedNotes(nepaliDate: string): boolean` and `allNotesCompleted(nepaliDate: string): boolean` functions to `src/notes/notes-storage.ts` — see contracts/storage-api.md for exact semantics (depends on T002, sequential with T003 — same file)

**Checkpoint**: Type-check passes (`npm run typecheck`). `toggleNoteCompletion`, `hasCompletedNotes`, and `allNotesCompleted` are exported and callable.

---

## Phase 3: User Story 1 — Today's Date Highlighted (Priority: P1) 🎯 MVP

**Goal**: The notes badge on today's calendar cell becomes visible against the blue today-highlight background.

**Independent Test**: Open the calendar. Add a note to today's date. The circular notes badge must be clearly visible on the blue today cell (white badge with blue number, not invisible blue-on-blue).

### Implementation for User Story 1

- [x] T005 [US1] Add CSS rule `.date-cell.today .notes-indicator { background: white; color: #0066cc; box-shadow: 0 1px 3px rgba(0, 102, 204, 0.4); }` to `src/styles/calendar.css` in the "Today Highlighting" section (after line 148)

**Checkpoint**: Build (`npm run build:extension`), open extension, add a note to today. Notes badge is clearly visible white circle with blue number on the blue today cell.

---

## Phase 4: User Story 2 — Mark a Note as Completed (Priority: P2)

**Goal**: Users can toggle completion on individual notes from the notes modal. Completion state is shown on the calendar date cell and persists across reloads.

**Independent Test**: Open any date's notes, add a note, click the completion toggle. The note shows a completed visual state in the modal. Close the modal — the date cell shows a completion indicator. Reload the page — the state is preserved.

### Implementation for User Story 2

- [x] T006 [US2] Update `addNotesIndicator` in `src/notes/notes-ui.ts`: after removing the existing indicator, call `hasCompletedNotes` and `allNotesCompleted` (import both from `./notes-storage`), then remove `has-completed-notes` and `all-notes-completed` classes from `dateCell` before re-evaluating, then add `has-completed-notes` class when any notes are completed or `all-notes-completed` class when all are completed (depends on T004)
- [x] T007 [P] [US2] Update the note item render logic in `src/notes/notes-modal.ts`: add a `<button class="note-complete-btn" data-note-id="${note.id}" aria-label="Mark as complete">✓</button>` per note item; add `note-item--completed` class to note item element when `note.completed === true`; add `note-complete-btn--active` class to the button when `note.completed === true`; wire click handler to call `toggleNoteCompletion(this.currentDate!, noteId)` then re-render notes list and fire `this.onNotesChangeCallback?.()` (depends on T003, parallel with T006 — different file)
- [x] T008 [US2] Add completion cell CSS to `src/styles/calendar.css`: add `.date-cell.has-completed-notes .notes-indicator { border: 2px solid #16a34a; }` and `.date-cell.all-notes-completed .notes-indicator { background: #16a34a; color: white; }` styles in the Notes Indicator section (sequential with T005 — same file, depends on T006)
- [x] T009 [P] [US2] Add completion modal CSS to `src/styles/modal.css`: note-item/completion styles added to `src/styles/calendar.css` (modal note styles were already there; no separate modal.css changes needed)

**Checkpoint**: Open any date, add two notes. Toggle completion on one — date cell gets `has-completed-notes` style (green border on badge). Toggle the other — cell gets `all-notes-completed` style (green badge). Reload — both states preserved. Delete all notes — no completion indicator remains.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge case verification and final validation.

- [ ] T010 Run full manual test checklist in `specs/001-note-complete-today/quickstart.md` — verify all 9 scenarios pass
- [x] T011 [P] Verify `npm run typecheck` passes with zero errors after all changes
- [ ] T012 [P] Verify today's cell shows both blue background AND visible notes badge AND correct completion indicator simultaneously (edge case: today + completed note)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Depends on T001 orientation — BLOCKS all user story work
- **US1 (Phase 3)**: Depends on Phase 2 completion — T005 is independent of storage changes (CSS only, but type-check must pass)
- **US2 (Phase 4)**: Depends on Phase 2 completion (T003, T004 must exist before T006, T007)
- **Polish (Phase 5)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (different CSS sections, different logic)
- US1 and US2 touch the same file (`calendar.css`) — T005 must complete before T008 to avoid edit conflicts

### Within Each User Story

- Models before services: T002 (type) → T003, T004 (storage) → T006, T007 (UI)
- T006 and T007 can run in parallel (different files)
- T008 and T009 can run in parallel (different files)
- T008 depends on T006 (needs to know completion classes are applied correctly)
- T009 depends on T007 (needs to know what HTML classes to style)

### Parallel Opportunities

| Parallel Group | Tasks | Condition |
|----------------|-------|-----------|
| Storage additions | T003 and T004 are sequential (same file) | Write both in one pass |
| US2 UI | T006 and T007 | Different files — can work simultaneously |
| US2 CSS | T008 and T009 | Different files — can work simultaneously |
| Polish | T011 and T012 | Independent checks |

---

## Parallel Example: User Story 2

```
# After Phase 2 complete, launch US2 UI tasks together:
Task A: T006 — Update addNotesIndicator in src/notes/notes-ui.ts
Task B: T007 — Add completion toggle to notes modal in src/notes/notes-modal.ts

# After T006 + T007 complete, launch CSS tasks together:
Task A: T008 — Add completion cell CSS in src/styles/calendar.css
Task B: T009 — Add completion modal CSS in src/styles/modal.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004)
2. Complete Phase 3: US1 — T005 (single CSS rule)
3. **STOP and VALIDATE**: Today cell shows visible notes badge on blue background
4. Ship US1 independently — it is a bug fix with zero risk

### Incremental Delivery

1. Phase 2 → Foundation ready (< 30 min)
2. Phase 3 (T005) → Today notes badge visible — demo/ship (MVP!)
3. Phase 4 (T006–T009) → Note completion end-to-end — demo/ship
4. Phase 5 → Verified and polished

---

## Notes

- [P] tasks operate on different files — no merge conflicts
- [US1] = User Story 1 (today highlight), [US2] = User Story 2 (note completion)
- T005 is the highest-value, lowest-risk task — one CSS rule fixes a visual bug
- Backwards compatibility: existing notes without `completed` field work unchanged (treated as `false`)
- Both CSS files (`calendar.css`, `modal.css`) have sequential tasks — edit in one pass per file to avoid conflicts
- Commit after each phase checkpoint for clean rollback points
