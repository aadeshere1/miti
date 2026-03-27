# Tasks: Challenge Streaks & Rewards

**Input**: Design documents from `/specs/006-challenge-streaks-rewards/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks — tests not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend shared types and add streak storage before any user story work begins

- [x] T001 Add `StreakStats` and `Milestone` interfaces, `STREAK_STATS_KEY` constant, and `MILESTONES` array to src/challenges/challenges-types.ts
- [x] T002 Create streak service with `calculateCurrentStreak()`, `getStreakStats()`, `saveStreakStats()`, `getNextMilestone()`, `getNewlyAchievedMilestones()`, and `updateStreakStats()` in src/challenges/challenges-streak.ts

**Checkpoint**: Streak types and calculation service ready. All existing features still work.

---

## Phase 2: User Story 1 — Today's Challenge Checklist (Priority: P1)

**Goal**: A prominent challenge checklist is displayed above the calendar grid showing each enabled challenge with checkboxes for today's completion.

**Independent Test**: Enable 2-3 challenges, open the app, verify the checklist appears above the grid with working checkboxes that sync with date cell indicators.

### Implementation for User Story 1

- [x] T003 [P] [US1] Add today checklist CSS styles (`.today-checklist`, `.today-challenge-list`, `.today-challenge-item`, `.today-challenge-checkbox`, `.today-challenge-icon`, `.today-challenge-name`) in src/styles/challenges.css
- [x] T004 [US1] Create `renderTodayChecklist()` function that inserts today's challenge checklist into `.calendar-container` after `.calendar-header` and any reminder banners in src/challenges/challenges-today-ui.ts
- [x] T005 [US1] Add checkbox toggle handler in today checklist — calls `toggleCompletion()` for today and refreshes date cell indicators via `refreshChallengeIndicators()` in src/challenges/challenges-today-ui.ts
- [x] T006 [US1] Add `clearTodayChecklist()` and `refreshTodayChecklist()` functions for clearing and refreshing checklist state in src/challenges/challenges-today-ui.ts
- [x] T007 [US1] Wire `renderTodayChecklist()` call in `init()` after `render()` and `renderReminders()`, and call `refreshTodayChecklist()` within `render()` for sync in src/main.ts
- [x] T008 [US1] Add bidirectional sync — when a challenge is toggled in the date cell (challenges-ui.ts), refresh the today checklist by calling `refreshTodayChecklist()` in src/challenges/challenges-ui.ts
- [x] T009 [US1] Ensure today checklist is hidden when no challenges are enabled (FR-003) in src/challenges/challenges-today-ui.ts

**Checkpoint**: Today checklist appears above grid, checkboxes work, syncs bidirectionally with date cell indicators.

---

## Phase 3: User Story 2 — Streak Tracking & Display (Priority: P1)

**Goal**: Current streak count is calculated and displayed in the today checklist area.

**Independent Test**: Enable a challenge, complete it, verify streak shows "1 day". Set up 3 consecutive days of completions, verify streak shows "3 days".

### Implementation for User Story 2

- [x] T010 [US2] Add streak info row (`.streak-info`, `.streak-count`, `.streak-best`) to the today checklist rendering, showing current streak and best streak in src/challenges/challenges-today-ui.ts
- [x] T011 [P] [US2] Add streak info CSS styles (`.streak-info`, `.streak-count`, `.streak-best`) in src/styles/challenges.css
- [x] T012 [US2] Update streak display on each challenge toggle — recalculate streak and update the streak info row in src/challenges/challenges-today-ui.ts
- [x] T013 [US2] Persist best streak — update `StreakStats.bestStreak` whenever current streak exceeds it in src/challenges/challenges-streak.ts

**Checkpoint**: Streak count displays correctly, updates on toggle, best streak persists across sessions.

---

## Phase 4: User Story 3 — Milestone Rewards & Motivation Quotes (Priority: P2)

**Goal**: Celebration banners with badges and quotes appear at milestones (3, 7, 15, 30 days). Between milestones, a progress indicator shows distance to next goal.

**Independent Test**: Set up 3-day completion data, reload — verify celebration banner with "Starter" badge and quote. Dismiss — verify it doesn't return.

### Implementation for User Story 3

- [x] T014 [P] [US3] Add celebration banner CSS styles (`.celebration-banner`, `.celebration-badge`, `.celebration-content`, `.celebration-title`, `.celebration-quote`, `.celebration-dismiss`, `.celebration-banner.dismissing`) in src/styles/challenges.css
- [x] T015 [US3] Create `showCelebrationBanner()` function that renders a celebration banner for a newly achieved milestone above the today checklist in src/challenges/challenges-today-ui.ts
- [x] T016 [US3] Add dismiss handler for celebration banner — marks milestone as seen in `seenCelebrations` via `saveStreakStats()` and removes banner with fade animation in src/challenges/challenges-today-ui.ts
- [x] T017 [US3] Add "next milestone" progress text (`.streak-next`) to the streak info row showing distance to next goal (e.g., "2 more days to 7-day streak!") in src/challenges/challenges-today-ui.ts
- [x] T018 [US3] Wire milestone check into today checklist render — after calculating streak, call `getNewlyAchievedMilestones()` and show celebration if needed in src/challenges/challenges-today-ui.ts

**Checkpoint**: Celebrations appear at correct milestones, dismiss works, progress indicator shows next goal.

---

## Phase 5: User Story 4 — Badge & Streak Persistence (Priority: P2)

**Goal**: Earned badges are displayed as icons and persist permanently. Best streak persists across sessions.

**Independent Test**: Earn a 3-day badge, break the streak, reload — verify badge still shown and best streak preserved.

### Implementation for User Story 4

- [x] T019 [P] [US4] Add badge display CSS styles (`.streak-badges`, `.streak-badge`, `.streak-badge.earned`, `.streak-badge.locked`) in src/styles/challenges.css
- [x] T020 [US4] Add earned badges row to today checklist showing all 4 milestone badges as earned (full opacity) or locked (dimmed) based on `StreakStats.earnedBadges` in src/challenges/challenges-today-ui.ts
- [x] T021 [US4] Ensure `updateStreakStats()` adds new badges to `earnedBadges` and NEVER removes them even when streak resets in src/challenges/challenges-streak.ts

**Checkpoint**: Badges display correctly, persist across sessions, survive streak resets.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Theme support, viewport fitting, and build verification

- [x] T022 Add dark theme styles for today checklist, streak info, badges, and celebration banner (`.calendar-container.dark-theme .today-checklist`, etc.) in src/styles/challenges.css
- [x] T023 Add image theme styles for today checklist and celebration banner (`.calendar-container.image-theme .today-checklist`, etc.) in src/styles/challenges.css
- [x] T024 Ensure today checklist area does not cause viewport overflow — verify calendar fits within screen on desktop (FR-014) in src/styles/challenges.css
- [x] T025 Build Chrome extension with `npm run build:extension` and verify all changes work in the extension context
- [x] T026 Run quickstart.md manual testing checklist to validate all 12 items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 (types + streak service). Creates new UI file.
- **User Story 2 (Phase 3)**: Depends on US1 (today checklist must exist to show streak in it)
- **User Story 3 (Phase 4)**: Depends on US2 (streak calculation must exist for milestone checking)
- **User Story 4 (Phase 5)**: Depends on US3 (milestones must exist to earn badges). Can also run partially in parallel with US3.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (Today checklist)**: Depends on Phase 1. Creates the core UI container.
- **US2 (Streak display)**: Depends on US1. Adds streak info into the US1 container.
- **US3 (Milestones)**: Depends on US2. Adds celebration banners and progress indicators.
- **US4 (Badges)**: Depends on US3. Adds badge display and persistence logic.

### Parallel Opportunities

- T003 (US1 CSS) can run in parallel with T004-T009 (US1 logic) — different files
- T011 (US2 CSS) can run in parallel with T010, T012-T013 (US2 logic) — different files
- T014 (US3 CSS) can run in parallel with T015-T018 (US3 logic) — different files
- T019 (US4 CSS) can run in parallel with T020-T021 (US4 logic) — different files

---

## Parallel Example: CSS + Logic within each story

```bash
# All CSS tasks can run in parallel with their story's logic tasks:
Task: "T003 [US1] CSS styles in src/styles/challenges.css"
Task: "T004 [US1] renderTodayChecklist() in src/challenges/challenges-today-ui.ts"

# Similarly for US2:
Task: "T011 [US2] Streak CSS in src/styles/challenges.css"
Task: "T010 [US2] Streak info in src/challenges/challenges-today-ui.ts"
```

Note: CSS and logic tasks modify different files and can be worked on simultaneously.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + streak service)
2. Complete Phase 2: User Story 1 (today checklist)
3. **STOP and VALIDATE**: Checklist works independently with bidirectional sync
4. Build extension and verify

### Incremental Delivery

1. Phase 1 (Setup) → Foundation ready
2. US1 (Today checklist) → Core usability improvement → Build & verify
3. US2 (Streak display) → Streak tracking visible → Build & verify
4. US3 (Milestones) → Celebration banners and progress → Build & verify
5. US4 (Badges) → Full badge persistence → Build & verify
6. Phase 6 (Polish) → Theme support, final testing

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1-US4 build on each other incrementally (checklist → streak → milestones → badges)
- Commit after each phase to enable rollback
- The existing challenges-ui.ts needs a small modification (T008) for bidirectional sync
- The streak calculation walks backward through at most 30 days of completion data
- Celebration banners are shown once per milestone (tracked in seenCelebrations)
