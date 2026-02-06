---

description: "Task list template for feature implementation"
---

# Tasks: Calendar Month View

**Input**: Design documents from `/specs/001-calendar-month-view/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only (per constitution requirement). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, at repository root
- TypeScript files with `.ts` extension (compile to JavaScript)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize npm project with package.json in repository root
- [X] T002 Install core dependency @remotemerge/nepali-date-converter (1.8 KB gzipped)
- [X] T003 Install TypeScript and Vite build tools as dev dependencies
- [X] T004 Create tsconfig.json with ES2020 target and strict mode enabled
- [X] T005 Create vite.config.ts with build configuration for ES2020 output
- [X] T006 Add npm scripts to package.json: dev, build, preview, typecheck
- [X] T007 [P] Create src/calendar/ directory for date conversion logic
- [X] T008 [P] Create src/components/ directory for UI components
- [X] T009 [P] Create src/state/ directory for state management
- [X] T010 [P] Create src/styles/ directory for CSS files
- [X] T011 Create src/index.html with calendar container structure and script tag
- [X] T012 [P] Create src/styles/global.css for base styles and CSS resets
- [X] T013 Create src/types.ts with TypeScript interfaces for CalendarState, NepaliDate, GregorianDate, DateCell, CalendarMonth

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T014 [P] Implement convertGregorianToNepali() function in src/calendar/conversions.ts
- [X] T015 [P] Implement convertNepaliToGregorian() function in src/calendar/conversions.ts
- [X] T016 [P] Implement getNepaliMonthName() function in src/calendar/calendar-data.ts with month mapping (1-12 to Baishakh-Chaitra)
- [X] T017 [P] Implement getNepaliMonthDays() function in src/calendar/calendar-data.ts using library
- [X] T018 [P] Implement getFirstDayOfNepaliMonth() function in src/calendar/calendar-data.ts
- [X] T019 [P] Implement adjustMonth() function in src/calendar/date-utils.ts for month navigation
- [X] T020 [P] Implement isSameDay() function in src/calendar/date-utils.ts for date comparison
- [X] T021 [P] Implement getStartOfMonth() function in src/calendar/date-utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Stories 1 & 3 - View Current Month + Grid Layout (Priority: P1) 🎯 MVP

**Goal**: Display current Nepali calendar month in 7-column grid format with dual dates (Nepali primary, Gregorian secondary) and today highlighting

**Why Combined**: These two stories are inseparable - you cannot view the current month without the grid layout, and the grid layout is meaningless without month data. They form the core MVP together.

**Independent Test**: Open app and verify: (1) current Nepali month displays in grid, (2) 7 weekday columns with headers, (3) each date cell shows Nepali date prominently and Gregorian date in bottom right, (4) today is highlighted, (5) dates align with correct weekdays

### Implementation for User Stories 1 & 3

- [X] T022 [US1+US3] Create CalendarState with currentMonth, today, selectedDate in src/state/calendar-state.ts
- [X] T023 [US1+US3] Implement getState() function in src/state/calendar-state.ts
- [X] T024 [US1+US3] Implement initializeState() function in src/state/calendar-state.ts
- [X] T025 [US1+US3] Implement generateCalendarGrid() function in src/components/CalendarGrid.ts to create 35-42 DateCell objects
- [X] T026 [US1+US3] Implement renderWeekdayHeaders() function in src/components/WeekdayHeaders.ts
- [X] T027 [US1+US3] Implement renderMonthHeader() function in src/components/MonthHeader.ts
- [X] T028 [US1+US3] Implement renderDateCell() helper function in src/components/DateCell.ts
- [X] T029 [US1+US3] Implement renderCalendarGrid() function in src/components/CalendarGrid.ts to update DOM
- [X] T030 [US1+US3] Implement render() main function in src/main.ts that orchestrates all rendering
- [X] T031 [US1+US3] Create CSS Grid layout (7 columns) in src/styles/calendar.css
- [X] T032 [US1+US3] Style date cells with Nepali date prominent and Gregorian date in bottom right in src/styles/calendar.css
- [X] T033 [US1+US3] Style today highlighting (border/background) in src/styles/calendar.css
- [X] T034 [US1+US3] Style month header and weekday headers in src/styles/calendar.css
- [X] T035 [US1+US3] Style dimmed appearance for adjacent month dates in src/styles/calendar.css
- [X] T036 [US1+US3] Add responsive layout for mobile (320px+) in src/styles/calendar.css
- [X] T037 [US1+US3] Implement init() function in src/main.ts to initialize state and render on load

**Checkpoint**: At this point, User Stories 1 and 3 (MVP) should be fully functional and testable independently. App displays current month with proper grid layout and today highlighted.

---

## Phase 4: User Story 2 - Navigate Between Months (Priority: P2)

**Goal**: Enable users to navigate backward/forward through months and return to current month

**Independent Test**: Test navigation controls: (1) clicking next advances to next Nepali month, (2) clicking previous goes back one month, (3) clicking today returns to current month, (4) month header updates correctly, (5) dates remain accurate across year boundaries

### Implementation for User Story 2

- [X] T038 [US2] Implement navigateToNextMonth() function in src/state/calendar-state.ts
- [X] T039 [US2] Implement navigateToPreviousMonth() function in src/state/calendar-state.ts
- [X] T040 [US2] Implement navigateToToday() function in src/state/calendar-state.ts
- [X] T041 [US2] Add event listener for previous month button in src/main.ts
- [X] T042 [US2] Add event listener for next month button in src/main.ts
- [X] T043 [US2] Add event listener for today button in src/main.ts
- [X] T044 [US2] Ensure render() is called after each navigation in src/main.ts
- [X] T045 [US2] Style navigation buttons (previous, next, today) in src/styles/calendar.css
- [X] T046 [US2] Add hover and active states for navigation buttons in src/styles/calendar.css

**Checkpoint**: All user stories should now be independently functional. Users can view current month (US1), see proper grid layout (US3), and navigate between months (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, testing, and final improvements

- [X] T047 Run npm run build and verify bundle size is <15 KB gzipped
- [ ] T048 Test date conversion accuracy against hamropatro.com for sample dates (2026-02-04 = 2082-10-22 BS, etc.)
- [ ] T049 Test month navigation forward 6 months and verify dates at each step
- [ ] T050 Test month navigation backward 6 months and verify dates at each step
- [ ] T051 Test year boundary navigation (Chaitra to Baishakh and reverse)
- [ ] T052 Test calendar in Chrome (latest version) - verify rendering and functionality
- [ ] T053 Test calendar in Firefox (latest version) - verify rendering and functionality
- [ ] T054 Test calendar in Safari (latest version) - verify rendering and functionality
- [ ] T055 Test calendar in Edge (latest version) - verify rendering and functionality
- [ ] T056 Test calendar on mobile iOS Safari - verify responsive layout
- [ ] T057 Test calendar on mobile Chrome - verify responsive layout
- [ ] T058 Measure render performance with console.time() - verify <100ms
- [ ] T059 Measure navigation performance with console.time() - verify <16ms
- [ ] T060 Test calendar at 320px viewport width - verify legibility
- [ ] T061 Create quickstart validation: follow quickstart.md steps and verify they work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories 1 & 3 (Phase 3)**: Depends on Foundational phase completion - Core MVP
- **User Story 2 (Phase 4)**: Depends on Phase 3 (MVP must exist before navigation can be added)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Stories 1 & 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Stories 1 & 3 completion - Navigation requires existing calendar view

### Within Each User Story

- Foundational functions before UI components
- State management before rendering
- Core rendering before styling
- UI components before event handlers
- Styling can happen in parallel with component implementation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T007-T010, T012)
- All Foundational tasks marked [P] can run in parallel (T014-T021) - within Phase 2
- Within User Stories 1 & 3: renderWeekdayHeaders (T026), renderMonthHeader (T027), renderDateCell (T028) can run in parallel
- CSS styling tasks can run in parallel with JavaScript implementation
- All browser testing tasks (T052-T057) can run in parallel

---

## Parallel Example: User Stories 1 & 3 (MVP)

```bash
# These can be implemented in parallel (different files):
Task T025: generateCalendarGrid() in src/components/CalendarGrid.ts
Task T026: renderWeekdayHeaders() in src/components/WeekdayHeaders.ts
Task T027: renderMonthHeader() in src/components/MonthHeader.ts
Task T028: renderDateCell() in src/components/DateCell.ts

# After components are done, these can run in parallel:
Task T031: CSS Grid layout in src/styles/calendar.css
Task T032: Date cell styling in src/styles/calendar.css
Task T033: Today highlighting in src/styles/calendar.css
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T021) - CRITICAL: blocks all stories
3. Complete Phase 3: User Stories 1 & 3 (T022-T037)
4. **STOP and VALIDATE**: Open app, verify current month displays with grid layout
5. **Manual Testing**: Compare dates with hamropatro.com, verify today highlighting
6. Deploy/demo if ready - you now have a working calendar MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T021)
2. Add User Stories 1 & 3 (MVP) → Test independently → Deploy/Demo (T022-T037)
3. Add User Story 2 (Navigation) → Test independently → Deploy/Demo (T038-T046)
4. Polish and final testing → Production ready (T047-T061)

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T021)
2. Once Foundational is done:
   - Developer A: Calendar grid generation (T025, T029)
   - Developer B: UI components (T026, T027, T028)
   - Developer C: State management (T022-T024)
   - Developer D: Styling (T031-T036)
3. Integrate at T030 and T037 (main application initialization)
4. After MVP complete:
   - Developer A: Navigation logic (T038-T040)
   - Developer B: Event handlers (T041-T044)
   - Developer C: Navigation styling (T045-T046)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Stories 1 & 3 are combined as they're inseparable for MVP
- Manual testing only (per constitution requirement - no automated tests)
- Commit after each task or logical group
- Stop at Phase 3 checkpoint to validate MVP independently
- User Story 2 can be skipped initially if you want absolute minimal MVP (view only, no navigation)
- Avoid: vague tasks, same file conflicts, dependencies that break independence

---

## Constitution Compliance Checkpoints

### After Setup (Phase 1):
- ✅ TypeScript configured for type safety
- ✅ Vite configured for optimal bundling
- ✅ Project structure aligns with Simplicity principle

### After Foundational (Phase 2):
- ✅ Date conversion functions use verified library
- ✅ Pure functions with no hidden state
- ✅ All functions meet <10ms performance budget

### After MVP (Phase 3):
- ✅ Calendar Accuracy: Dates must be validated manually
- ✅ Browser Compatibility: Test in all target browsers
- ✅ Performance: Render must be <100ms
- ✅ Offline-First: No network requests
- ✅ Simplicity: Vanilla JS output, CSS Grid for layout

### After Navigation (Phase 4):
- ✅ Navigation must be <16ms (60fps requirement)
- ✅ Year boundaries handled correctly

### After Polish (Phase 5):
- ✅ Bundle size <200KB (target: 10-15 KB)
- ✅ Cross-browser testing complete
- ✅ Manual accuracy testing complete
- ✅ All constitutional principles verified
