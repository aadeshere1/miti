# Tasks: Daily Challenges

**Input**: Design documents from `/specs/004-daily-challenges/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the challenges module directory and define shared types/constants used by all user stories.

- [x] T001 Create `src/challenges/` directory for the new challenge feature module
- [x] T002 [P] Define Challenge and ChallengeCompletion interfaces, default challenge constants (IDs: `no-junk-food`, `first-thing-water`, `no-sugar`; emojis: 🍔, 💧, 🍬), curated emoji list (~30 health/habit emojis), and storage key constants in `src/challenges/challenges-types.ts` per data-model.md entity definitions
- [x] T003 [P] Create base stylesheet `src/styles/challenges.css` with placeholder sections for challenge indicators, popover, settings section, and completed/incomplete/read-only visual states; import it in `src/main.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the core storage layer for challenge definitions and daily completions. All user stories depend on this.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement challenge definitions CRUD in `src/challenges/challenges-storage.ts`: `getChallenges()` to load from `miti:challenges` key (initializes 3 disabled defaults on first access per data-model.md), `saveChallenges()` to persist the array, `getEnabledChallenges()` to filter enabled-only, `enableChallenge(id)` and `disableChallenge(id)` that update `enabledDate` on enable per research R9. Use existing `getItem`/`setItem` from `src/utils/storage.ts`
- [x] T005 Implement completion data CRUD in `src/challenges/challenges-storage.ts`: `getCompletionsForDate(nepaliDate)` to read from `miti:challenge-completions:YYYY-MM-DD` key, `toggleCompletion(challengeId, nepaliDate)` that flips boolean and saves (only allowed for today per FR-009), `getCompletionsForMonth(year, month)` to batch-load a month's completions for calendar rendering. Follow the per-date key pattern from research R1 and R7

**Checkpoint**: Storage layer ready — challenge data can be read/written via browser console for manual testing.

---

## Phase 3: User Story 1 — Check Off Daily Challenges from Calendar (Priority: P1) 🎯 MVP

**Goal**: Display challenge indicators on calendar date cells and allow users to toggle completion for today by clicking indicators directly. Past dates show read-only status. Future dates show nothing.

**Independent Test**: Enable a default challenge via browser console (`getChallenges()` → set enabled to true → `saveChallenges()`), view calendar, verify indicator appears on today, click to toggle, reload to verify persistence.

### Implementation for User Story 1

- [x] T006 [US1] Implement `addChallengeIndicators(cellElement, nepaliDateString, isToday, isCurrentMonth)` in `src/challenges/challenges-ui.ts`: for each enabled challenge, create a small clickable emoji element (14-16px) inside the cell. For today: add click handler with `stopPropagation()` that calls `toggleCompletion()` and visually toggles completed/incomplete CSS class. For past dates (on or after challenge's `enabledDate`): render as read-only with completed/missed styling. For future dates or dates before `enabledDate`: render nothing. When >4 challenges active, delegate to compact summary rendering (T019). Include a `refreshChallengeIndicators()` export to update indicators without full calendar re-render
- [x] T007 [US1] Modify `renderDateCell()` in `src/components/DateCell.ts`: add a `<div class="challenge-indicators">` container element between the Nepali date and Gregorian date elements to hold challenge indicator icons
- [x] T008 [US1] Modify `renderCalendarGrid()` in `src/components/CalendarGrid.ts`: after existing cell setup (weekend, holiday, notes indicator), call `addChallengeIndicators(cellElement, nepaliDateString, cell.isToday, cell.isCurrentMonth)` from `challenges-ui.ts`. Ensure challenge click handlers use `stopPropagation()` so the cell's notes-modal click handler (FR-002) is not triggered
- [x] T009 [US1] Add challenge indicator styles in `src/styles/challenges.css`: `.challenge-indicators` container layout (horizontal flex, gap 2px), `.challenge-icon` base style (14-16px emoji, cursor pointer for today), `.challenge-completed` state (opacity change or checkmark overlay), `.challenge-missed` state for past incomplete (dimmed), `.challenge-readonly` state (cursor default, no hover effects). Ensure indicators don't overflow the 60px min-height date cell
- [x] T010 [US1] Modify `src/main.ts`: import challenge storage initialization, call `getChallenges()` during app startup to trigger default challenge creation on first use. Register a challenge change callback that calls `refreshChallengeIndicators()` when completion data changes
- [x] T011 [US1] Extend `refreshCalendar()` in `src/components/CalendarGrid.ts` to also refresh challenge indicators on each date cell (similar to how it refreshes notes indicators), so that toggling a challenge updates the UI without a full re-render

**Checkpoint**: User Story 1 is fully functional — challenges display on today's date cell, can be toggled, persist across reloads. Past dates show read-only history. Future dates are clean.

---

## Phase 4: User Story 2 — Enable/Disable Default Challenges in Settings (Priority: P2)

**Goal**: Add a "Daily Challenges" section to the settings modal where users can enable/disable the three default challenges. Changes immediately reflect on the calendar.

**Independent Test**: Open settings, see three default challenges with toggles (all off by default), enable one, close settings, verify indicator appears on today's cell. Disable it, verify indicator disappears. Reload — verify state persists.

### Implementation for User Story 2

- [x] T012 [US2] Add a "Daily Challenges" section to the settings modal in `src/settings/settings-modal.ts`: create a new section after the Theme section with heading "Daily Challenges". List all challenges from `getChallenges()`, each with a toggle switch (checkbox styled as toggle, matching existing settings patterns), showing the challenge icon and name. Wire each toggle to call `enableChallenge(id)` or `disableChallenge(id)` from challenges-storage and trigger calendar re-render via the settings change callback
- [x] T013 [US2] Add settings section styles in `src/styles/challenges.css`: `.challenges-settings-section` layout, `.challenge-toggle-row` with icon + name + toggle alignment, toggle switch styling consistent with existing settings checkboxes. Ensure the section visually fits within the existing settings modal scroll area
- [x] T014 [US2] Wire settings change to calendar update in `src/main.ts`: when a challenge is enabled/disabled via settings, trigger `renderCalendarGrid()` to re-render with updated challenge indicators. Ensure the existing `onSettingsChange` callback pattern is extended (or a new `onChallengesChange` callback is registered) so the calendar responds immediately without page reload (FR-005, SC-005)
- [x] T015 [US2] Add challenge data sync to `src/utils/storage-sync.ts`: listen for `storage` events on keys matching `miti:challenges` and `miti:challenge-completions:*`. When detected from another tab, trigger calendar re-render to keep multi-tab state consistent per research R8

**Checkpoint**: User Story 2 is fully functional — users can enable/disable default challenges from settings, calendar updates immediately, state persists across reloads and syncs across tabs.

---

## Phase 5: User Story 3 — Add Custom Challenges (Priority: P3)

**Goal**: Allow users to create, edit, and delete custom challenges from the settings panel. Custom challenges behave identically to defaults on the calendar.

**Independent Test**: Open settings, click "Add Challenge", enter name and pick emoji, save. Verify new challenge appears in settings list and on calendar. Edit name/icon — verify update. Delete with confirmation — verify removal from calendar and settings.

### Implementation for User Story 3

- [x] T016 [US3] Add custom challenge creation functions to `src/challenges/challenges-storage.ts`: `addChallenge(name, icon)` that validates name (1-30 chars, trimmed, non-empty), checks total count <=10 (FR-011), generates UUID via `generateUUID()`, sets `type: 'custom'`, `enabled: true`, `enabledDate` to current Nepali date, appends to challenges array, and saves. Return the new challenge or throw validation error
- [x] T017 [US3] Add custom challenge edit and delete functions to `src/challenges/challenges-storage.ts`: `updateChallenge(id, name, icon)` that validates and updates name/icon for custom challenges only (ignore if default type). `deleteChallenge(id)` that removes a custom challenge from the array AND iterates all `miti:challenge-completions:*` keys in localStorage to remove entries for that challenge ID (cascade delete per data-model.md validation rule 7). Throw error if attempting to delete a default challenge
- [x] T018 [US3] Add "Add Challenge" button and inline form to the Daily Challenges settings section in `src/settings/settings-modal.ts`: below the challenge list, add an "Add Challenge" button. On click, show an inline form with: text input for name (max 30 chars, placeholder "Challenge name"), emoji picker grid (~30 curated health/habit emojis from challenges-types.ts EMOJI_OPTIONS), and Save/Cancel buttons. On save, call `addChallenge()`, refresh the settings list, and trigger calendar re-render. Show validation error if name empty or 10-challenge limit reached
- [x] T019 [US3] Add edit and delete controls for custom challenges in `src/settings/settings-modal.ts`: for each custom challenge row (type === 'custom'), add an edit icon button and a delete icon button. Edit: replaces the row with inline name input + emoji picker (pre-filled with current values) + Save/Cancel. Delete: shows `confirm()` dialog warning "This will remove the challenge and all its historical data. Continue?" — on confirm, calls `deleteChallenge()`, refreshes settings list, triggers calendar re-render. Default challenges (type === 'default') show no edit/delete buttons
- [x] T020 [US3] Add styles for custom challenge form and controls in `src/styles/challenges.css`: `.challenge-add-form` layout, `.emoji-picker-grid` as a flex-wrap grid of ~30 emoji buttons (each ~32px), `.emoji-selected` highlight state, `.challenge-edit-row` inline edit form, `.challenge-action-btn` for edit/delete icon buttons, validation error message styling

**Checkpoint**: User Story 3 is fully functional — users can create custom challenges with name + emoji, edit them, delete them (with confirmation and data cascade). All custom challenges work identically to defaults on the calendar.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Handle the compact summary/popover edge case for >4 challenges and finalize cross-cutting quality.

- [x] T021 [P] Implement compact summary badge in `src/challenges/challenges-ui.ts`: when >4 enabled challenges exist for a date, replace individual indicators with a single badge showing "completed/total" (e.g., "3/5"). Style the badge as a small rounded element in `src/styles/challenges.css` (`.challenge-summary-badge`). Add click handler with `stopPropagation()` that opens the challenges popover
- [x] T022 [P] Implement challenges popover in `src/challenges/challenges-popover.ts`: `openChallengesPopover(cellElement, nepaliDate, isToday)` creates an absolutely positioned `<div>` anchored to the cell. Lists all enabled challenges with icon, name, and toggle checkbox (toggleable for today, read-only for past). Closes on click outside (document click listener) or Escape key. Only one popover can be open at a time (close existing before opening new). Add popover styles in `src/styles/challenges.css` (`.challenges-popover`, `.popover-backdrop`, `.popover-challenge-row`)
- [x] T023 Verify TypeScript compilation passes with `npm run typecheck` — fix any type errors across all new and modified files
- [x] T024 Verify production build succeeds with `npm run build` — ensure no build errors and bundle size stays under 200KB gzipped per constitution
- [x] T025 Run manual validation per quickstart.md testing checklist (10 items): enable challenge → toggle → click isolation → past month nav → custom add → custom delete → 5+ compact summary → popover → disable all → multi-tab sync

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (T004-T005) — core calendar interaction
- **US2 (Phase 4)**: Depends on Foundational (T004-T005) — can run in parallel with US1 but recommended after US1 for visual verification
- **US3 (Phase 5)**: Depends on Foundational (T004-T005) and US2 (T012-T015) — extends the settings UI built in US2
- **Polish (Phase 6)**: Depends on US1 + US3 complete (popover needs >4 challenges which requires custom challenges)

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational phase — can be tested by manually enabling a challenge via storage functions
- **User Story 2 (P2)**: Depends only on Foundational phase — can technically start in parallel with US1, but sequential order recommended
- **User Story 3 (P3)**: Depends on US2 (settings UI exists to add the "Add Challenge" form into)

### Parallel Opportunities

Within Phase 1:
- T002 and T003 can run in parallel (different files)

Within Phase 3 (US1):
- T006 and T007 can start in parallel (different files), T008 depends on both
- T009 can run in parallel with T006/T007 (CSS file)

Within Phase 4 (US2):
- T012 and T013 can start in parallel (TS vs CSS)
- T015 can run in parallel with T012/T013 (different file)

Within Phase 6 (Polish):
- T021 and T022 can run in parallel (different files)

---

## Parallel Example: User Story 1

```text
# Parallel batch 1 (different files):
T006: Implement addChallengeIndicators() in src/challenges/challenges-ui.ts
T007: Modify renderDateCell() in src/components/DateCell.ts
T009: Add challenge indicator styles in src/styles/challenges.css

# Sequential (depends on T006 + T007):
T008: Modify renderCalendarGrid() in src/components/CalendarGrid.ts
T010: Modify src/main.ts for challenge initialization
T011: Extend refreshCalendar() in src/components/CalendarGrid.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational storage layer (T004-T005)
3. Complete Phase 3: User Story 1 — calendar indicators + toggle (T006-T011)
4. **STOP and VALIDATE**: Manually enable a challenge via storage, test toggle on today, verify persistence
5. MVP delivers core value: daily challenge tracking from the calendar

### Incremental Delivery

1. Setup + Foundational → Storage layer ready
2. Add User Story 1 → Calendar indicators work → **MVP**
3. Add User Story 2 → Settings UI for enable/disable → Full self-service experience
4. Add User Story 3 → Custom challenges → Power user capability
5. Add Polish → Compact summary + popover + build verification → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test tasks included (not requested in spec) — manual testing per quickstart.md checklist
