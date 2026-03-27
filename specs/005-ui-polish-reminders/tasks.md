# Tasks: UI Polish & Challenge Reminders

**Input**: Design documents from `/specs/005-ui-polish-reminders/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks — tests not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend shared types and storage before any user story work begins

- [x] T001 Add `ReminderTimeWindow` type and `reminderTime` field to `Challenge` interface in src/challenges/challenges-types.ts
- [x] T002 Update `createDefaultChallenges()` to set default `reminderTime` values (water=morning, junk-food=evening, sugar=evening) in src/challenges/challenges-types.ts
- [x] T003 Add `reminderTime` migration in `getChallenges()` — assign defaults for challenges loaded without the field — in src/challenges/challenges-storage.ts

**Checkpoint**: Challenge type and storage are backward-compatible with new `reminderTime` field. All existing challenge features still work.

---

## Phase 2: User Story 1 — Fixed Navigation Buttons (Priority: P1)

**Goal**: Both prev and next month buttons stay in fixed positions regardless of month name length.

**Independent Test**: Navigate through all 12 Nepali months and verify both nav buttons remain in the same horizontal position.

### Implementation for User Story 1

- [x] T004 [US1] Update `.calendar-header` CSS to remove `justify-content: space-between` and set `.month-title` to `flex: 1; text-align: center` in src/styles/calendar.css
- [x] T005 [US1] Verify mobile responsive `.calendar-header` styles match the fix (ensure `.month-title` flex behavior is not overridden) in src/styles/calendar.css

**Checkpoint**: Nav buttons are fixed across all 12 months on desktop and mobile.

---

## Phase 3: User Story 2 — Larger Calendar View (Priority: P1)

**Goal**: Calendar grid is larger, uses viewport-relative sizing, and the full calendar fits within the viewport without scrolling.

**Independent Test**: Open the calendar on desktop, tablet, and mobile — grid is visibly larger and no vertical scrollbar appears.

### Implementation for User Story 2

- [x] T006 [US2] Replace fixed-height `.calendar-grid` with `calc(100vh - 260px)` sizing, add `min-height: 400px` and `max-height: 640px` in src/styles/calendar.css
- [x] T007 [US2] Increase `.calendar-container` max-width from 800px to 900px in src/styles/calendar.css
- [x] T008 [US2] Update tablet media query (641px–1024px) `.calendar-grid` to use viewport-relative height in src/styles/calendar.css
- [x] T009 [US2] Update mobile media query (≤640px) `.calendar-grid` to use viewport-relative height in src/styles/calendar.css
- [x] T010 [US2] Update large screen media query (≥1025px) `.calendar-grid` to use viewport-relative height in src/styles/calendar.css

**Checkpoint**: Calendar grid is larger on all breakpoints and fits viewport without scrolling.

---

## Phase 4: User Story 3 — Visual Gap Between Calendar and Sidebar (Priority: P1)

**Goal**: A visible gap separates the calendar container from the notes sidebar.

**Independent Test**: View the app with sidebar visible (left and right positions) — clear visual gap is present.

### Implementation for User Story 3

- [x] T011 [US3] Change `.app-container` `gap` from `0` to `1.5rem` in src/styles/sidebar.css
- [x] T012 [US3] Verify mobile stacked layout gap works correctly (sidebar below calendar) in src/styles/sidebar.css

**Checkpoint**: Calendar and sidebar have clear visual separation on desktop and mobile.

---

## Phase 5: User Story 4 — Challenge Reminder at Tab Open (Priority: P2)

**Goal**: When the app loads, non-intrusive reminder banners appear for incomplete challenges whose time window matches the current time.

**Independent Test**: Enable a challenge with morning reminder, open the app during morning hours — reminder banner appears. Complete the challenge — banner disappears and doesn't return.

### Implementation for User Story 4

- [x] T013 [P] [US4] Create `isInReminderWindow()` function that maps each `ReminderTimeWindow` value to an hour range and checks `new Date().getHours()` in src/challenges/challenges-reminder.ts
- [x] T014 [P] [US4] Create `getActiveReminders()` function that returns enabled challenges that are incomplete today, within their reminder window, and not dismissed in src/challenges/challenges-reminder.ts
- [x] T015 [US4] Add reminder banner CSS styles (`.challenge-reminder-banner`, `.reminder-icon`, `.reminder-text`, `.reminder-actions`, `.reminder-complete-btn`, `.reminder-dismiss-btn`) in src/styles/challenges.css
- [x] T016 [US4] Create `renderReminders()` function that inserts reminder banners into `.calendar-container` after `.calendar-header` for each active reminder in src/challenges/challenges-reminder-ui.ts
- [x] T017 [US4] Add "Complete" button handler in reminder banner — toggles challenge completion for today and removes the banner in src/challenges/challenges-reminder-ui.ts
- [x] T018 [US4] Wire `renderReminders()` call in `init()` after the first `render()` call in src/main.ts

**Checkpoint**: Reminders appear on page load for incomplete challenges in the correct time window. Completing removes the banner.

---

## Phase 6: User Story 5 — Per-Challenge Reminder Time Configuration (Priority: P2)

**Goal**: Users can configure reminder time (Morning/Afternoon/Evening/All Day/No Reminder) per challenge in settings.

**Independent Test**: Open settings, change a challenge's reminder time, reload — reminder appears at the new time instead of the old one.

### Implementation for User Story 5

- [x] T019 [US5] Add reminder time `<select>` dropdown next to each challenge in the settings modal challenge list in src/settings/settings-modal.ts
- [x] T020 [US5] Wire dropdown `change` handler to update `challenge.reminderTime` and persist via `saveChallenges()` in src/settings/settings-modal.ts
- [x] T021 [US5] Add CSS styles for `.reminder-time-select` dropdown in src/styles/challenges.css

**Checkpoint**: Reminder time is configurable per challenge via settings, persists across sessions.

---

## Phase 7: User Story 6 — Dismissing Reminders (Priority: P3)

**Goal**: Users can dismiss a reminder for the current session. Dismissed reminders return on next page load if still incomplete.

**Independent Test**: Dismiss a reminder, interact with calendar — reminder doesn't reappear. Open new tab — reminder returns.

### Implementation for User Story 6

- [x] T022 [US6] Add in-memory `dismissedReminders` Set and `dismissReminder()` / `isReminderDismissed()` functions in src/challenges/challenges-reminder.ts
- [x] T023 [US6] Add dismiss button ("×") handler in reminder banner — calls `dismissReminder()` and removes banner with fade-out transition in src/challenges/challenges-reminder-ui.ts
- [x] T024 [US6] Add CSS transition for reminder banner dismiss animation (fade-out / slide-up) in src/styles/challenges.css

**Checkpoint**: Dismissing works within session; reminders return on new page load.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, dark theme support, and build verification

- [x] T025 Ensure reminder banners render correctly with dark theme (`.calendar-container.dark-theme .challenge-reminder-banner` styles) in src/styles/challenges.css
- [x] T026 Ensure reminder banners render correctly with image theme overlay in src/styles/challenges.css
- [x] T027 Build Chrome extension with `npm run build:extension` and verify all changes work in the extension context
- [x] T028 Run quickstart.md manual testing checklist to validate all 7 items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Stories 1–3 (Phases 2–4)**: CSS-only changes, independent of Phase 1. Can run in parallel with each other.
- **User Stories 4–6 (Phases 5–7)**: Depend on Phase 1 (type/storage changes). Must run in order (US4 → US5 → US6).
- **Polish (Phase 8)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (Fixed nav)**: Independent — CSS-only
- **US2 (Larger calendar)**: Independent — CSS-only
- **US3 (Gap)**: Independent — CSS-only
- **US4 (Reminders)**: Depends on Phase 1 (types/storage). Creates new files.
- **US5 (Config)**: Depends on US4 (reminder service must exist to configure)
- **US6 (Dismiss)**: Depends on US4 (reminder UI must exist to dismiss)

### Parallel Opportunities

- T004 and T005 (US1) can run in parallel with T006–T010 (US2) and T011–T012 (US3) — all are CSS in different sections
- T013 and T014 (US4) can run in parallel — different functions in the same new file
- T015 (US4 CSS) can run in parallel with T013–T014 (US4 logic) — different files

---

## Parallel Example: CSS Stories (US1 + US2 + US3)

```bash
# All three CSS user stories can be worked on simultaneously:
Task: "T004 [US1] Fix calendar header flex layout in src/styles/calendar.css"
Task: "T006 [US2] Replace fixed heights with calc() in src/styles/calendar.css"
Task: "T011 [US3] Add gap to app-container in src/styles/sidebar.css"
```

Note: T004 and T006–T010 modify the same file but different CSS rules; apply sequentially to avoid conflicts.

---

## Implementation Strategy

### MVP First (User Stories 1–3 Only)

1. Complete Phase 1: Setup (types + storage migration)
2. Complete Phases 2–4: All CSS fixes (nav buttons, calendar size, gap)
3. **STOP and VALIDATE**: All 3 P1 stories work independently
4. Build extension and verify

### Incremental Delivery

1. Phase 1 (Setup) → Foundation ready
2. US1 + US2 + US3 (CSS) → Visual polish complete → Build & verify
3. US4 (Reminders) → Core reminder feature works → Build & verify
4. US5 (Config) → Configurable reminder times → Build & verify
5. US6 (Dismiss) → Full reminder UX → Build & verify
6. Phase 8 (Polish) → Theme support, final testing

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1–US3 are CSS-only and can be completed very quickly
- US4–US6 build on each other incrementally (reminder core → config → dismiss)
- Commit after each phase to enable rollback
- The existing settings-modal.ts is large (~23KB) — changes in T019–T020 should be surgical, adding only the dropdown
