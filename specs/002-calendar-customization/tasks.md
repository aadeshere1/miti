# Tasks: Calendar Customization and Note-Taking

**Input**: Design documents from `/specs/002-calendar-customization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only - no automated test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to repository root (`/Users/senengutami/miti/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for new modules

- [x] T001 Create directory structure for new modules: src/notes/, src/sidebar/, src/settings/, src/holidays/, src/theme/
- [x] T002 [P] Create type definitions file src/notes/notes-types.ts with Note interface and MAX_NOTE_LENGTH constant
- [x] T003 [P] Create type definitions file src/settings/settings-types.ts with Settings interface, WeekendConfig, SidebarPosition, ThemeType, and DEFAULT_SETTINGS
- [x] T004 [P] Create type definitions file src/holidays/holidays-types.ts with Holiday interface and HolidayStorage interface
- [x] T005 [P] Create public/holidays/ directory for holiday JSON files
- [x] T006 [P] Create CSS file src/styles/modal.css for modal component styles
- [x] T007 [P] Create CSS file src/styles/sidebar.css for sidebar component styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and base components that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Implement UUID generator utility function in src/utils/uuid.ts (or install uuid library if preferred)
- [x] T009 [P] Implement localStorage wrapper utilities in src/utils/storage.ts with quota checking and error handling per FR-028
- [x] T010 [P] Implement reusable Modal base class in src/components/Modal.ts with open/close methods, backdrop, accessibility (ARIA, focus trap, ESC key)
- [x] T011 [P] Add modal CSS styles to src/styles/modal.css (overlay, container, animations, accessibility)
- [x] T012 Update src/types.ts to import and extend CalendarDate interface with hasNotes, notesCount, isWeekend, isHoliday, holidayName, holidayDescription properties
- [x] T013 Create localStorage event listener in src/utils/storage-sync.ts for multi-tab synchronization per FR-027

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Personal Note Taking (Priority: P1) 🎯 MVP

**Goal**: Allow users to click any date and add/edit/delete notes with localStorage persistence

**Independent Test**: Click date → add note with text → save → close browser → reopen → click date again → note displays with timestamp

### Implementation for User Story 1

- [ ] T014 [US1] Implement getNotesForDate function in src/notes/notes-storage.ts to retrieve notes array from localStorage by Nepali date key
- [ ] T015 [US1] Implement addNote function in src/notes/notes-storage.ts with character limit validation (5000 chars per FR-030), UUID generation, timestamp creation, localStorage write with quota error handling
- [ ] T016 [US1] Implement updateNote function in src/notes/notes-storage.ts to update existing note text and modified timestamp
- [ ] T017 [US1] Implement deleteNote function in src/notes/notes-storage.ts to remove note from array by ID
- [ ] T018 [US1] Implement hasNotes helper function in src/notes/notes-storage.ts to check if date has notes (O(1) key existence check)
- [ ] T019 [US1] Implement getNotesCount helper function in src/notes/notes-storage.ts to return number of notes for a date
- [ ] T020 [US1] Create NotesModal class in src/notes/notes-modal.ts extending Modal base class with date parameter, notes list rendering, add note form, edit/delete actions
- [ ] T021 [US1] Implement renderNotesList method in src/notes/notes-modal.ts to display notes chronologically with timestamps per acceptance scenario 4
- [ ] T022 [US1] Implement handleAddNote method in src/notes/notes-modal.ts with form validation and character counter UI
- [ ] T023 [US1] Implement handleEditNote method in src/notes/notes-modal.ts to load note text into edit form and update on save
- [ ] T024 [US1] Implement handleDeleteNote method in src/notes/notes-modal.ts with confirmation dialog before deletion
- [ ] T025 [US1] Create visual notes indicator component in src/notes/notes-ui.ts that adds badge showing note count to date cells per FR-006
- [ ] T026 [US1] Add CSS styles for notes indicator in src/styles/calendar.css (position, badge, count display)
- [ ] T027 [US1] Add CSS styles for notes modal content in src/styles/modal.css (notes list, form, edit/delete buttons, character counter)
- [ ] T028 [US1] Update src/components/CalendarGrid.ts to integrate notes indicator on date cells that have notes using hasNotes check
- [ ] T029 [US1] Update src/components/CalendarGrid.ts to add click event listener on date cells that opens NotesModal with nepali date parameter per FR-001
- [ ] T030 [US1] Initialize NotesModal instance in src/main.ts during app initialization
- [ ] T031 [US1] Implement modal close handler that refreshes calendar indicators when notes are added/edited/deleted

**Checkpoint**: At this point, User Story 1 should be fully functional - users can click dates, add/edit/delete notes, notes persist across sessions, visual indicators appear

---

## Phase 4: User Story 2 - Month Notes Overview (Priority: P1)

**Goal**: Display all notes for current month in a sidebar panel with real-time updates

**Independent Test**: Add notes to multiple dates in month → verify all appear in sidebar → click note in sidebar → jumps to date and opens modal → add/edit/delete note → sidebar updates immediately

### Implementation for User Story 2

- [ ] T032 [US2] Implement getNotesForMonth function in src/notes/notes-storage.ts that iterates localStorage keys with month prefix and returns Map<date, Note[]>
- [ ] T033 [US2] Create NotesSidebar class in src/sidebar/sidebar-component.ts with render method accepting year and month parameters
- [ ] T034 [US2] Implement renderNotesList method in src/sidebar/sidebar-component.ts to display notes grouped by date with date labels per acceptance scenario 1
- [ ] T035 [US2] Implement renderEmptyState method in src/sidebar/sidebar-component.ts to show "No notes for this month" message per acceptance scenario 4
- [ ] T036 [US2] Add click handlers in src/sidebar/sidebar-component.ts that jump to date and open notes modal per FR-008
- [ ] T037 [US2] Implement refresh method in src/sidebar/sidebar-component.ts to update sidebar display when notes change per FR-009
- [ ] T038 [US2] Add sidebar HTML structure to index.html with id="notes-sidebar" and container divs
- [ ] T039 [US2] Add CSS styles for sidebar in src/styles/sidebar.css (layout, notes list, date labels, empty state, scrolling)
- [ ] T040 [US2] Update src/main.ts to initialize NotesSidebar instance and call render with current month on app load
- [ ] T041 [US2] Update src/main.ts render function to call sidebar.render() when month changes per acceptance scenario 3
- [ ] T042 [US2] Add event listener in src/notes/notes-modal.ts that calls sidebar.refresh() when notes are added/edited/deleted for real-time updates
- [ ] T043 [US2] Update src/utils/storage-sync.ts to call sidebar.refresh() on storage events from other tabs

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - notes system functional, sidebar displays all month notes, clicking sidebar notes opens modal, real-time updates working

---

## Phase 5: User Story 3 - Sidebar Configuration (Priority: P2)

**Goal**: Allow users to configure sidebar position (left/right) and visibility (enabled/disabled)

**Independent Test**: Access settings → change sidebar position to left → verify moves left → toggle visibility off → verify sidebar hidden → refresh browser → settings persist

### Implementation for User Story 3

- [ ] T044 [US3] Implement getSettings function in src/settings/settings-storage.ts that reads from localStorage or returns DEFAULT_SETTINGS
- [ ] T045 [US3] Implement updateSettings function in src/settings/settings-storage.ts that merges partial updates with current settings per contract
- [ ] T046 [US3] Implement resetSettings function in src/settings/settings-storage.ts that writes DEFAULT_SETTINGS to localStorage
- [ ] T047 [US3] Implement getSetting helper function in src/settings/settings-storage.ts to get specific setting value by key
- [ ] T048 [US3] Create SettingsModal class in src/settings/settings-modal.ts extending Modal base class with settings form
- [ ] T049 [US3] Add sidebar configuration section to settings form in src/settings/settings-modal.ts (position radio buttons: left/right, visibility checkbox)
- [ ] T050 [US3] Implement handleSidebarPositionChange in src/settings/settings-modal.ts that calls updateSettings and applies position class per acceptance scenario 1
- [ ] T051 [US3] Implement handleSidebarVisibilityToggle in src/settings/settings-modal.ts that calls updateSettings and shows/hides sidebar per acceptance scenario 2
- [ ] T052 [US3] Add applySidebarSettings function in src/sidebar/sidebar-component.ts that reads settings and applies position class and visibility
- [ ] T053 [US3] Update index.html app container to use flexbox layout that supports left/right sidebar ordering
- [ ] T054 [US3] Add CSS classes in src/styles/sidebar.css for position-left and position-right that control sidebar ordering
- [ ] T055 [US3] Add CSS class in src/styles/sidebar.css for sidebar-hidden that hides sidebar with display: none
- [ ] T056 [US3] Update src/main.ts to call applySidebarSettings on app initialization to load persisted settings per acceptance scenario 3
- [ ] T057 [US3] Add settings button to calendar header in index.html that opens SettingsModal
- [ ] T058 [US3] Initialize SettingsModal instance in src/main.ts
- [ ] T059 [US3] Update src/utils/storage-sync.ts to call applySidebarSettings on settings storage events from other tabs

**Checkpoint**: Sidebar configuration working - position and visibility configurable, settings persist, changes apply immediately

---

## Phase 6: User Story 4 - Visual Date Highlighting (Priority: P2)

**Goal**: Display weekends and holidays in red color for quick identification

**Independent Test**: Configure weekend as "both" → verify Saturdays and Sundays appear in red → load holidays JSON → verify holiday dates appear in red with names

### Implementation for User Story 4

- [ ] T060 [US4] Implement isWeekendDay helper function in src/settings/settings-storage.ts that checks if dayOfWeek matches weekend configuration per contract
- [ ] T061 [US4] Update src/components/CalendarGrid.ts to check isWeekendDay for each date cell and add CSS class "weekend" per FR-014
- [ ] T062 [US4] Add CSS styles in src/styles/calendar.css for .date-cell.weekend class with red text color (#dc2626)
- [ ] T063 [US4] Update src/components/CalendarGrid.ts to check if date has holiday using getHolidaysForDate and add CSS class "holiday" per FR-017
- [ ] T064 [US4] Add holiday name display element in src/components/CalendarGrid.ts for dates with holidays (small text below date)
- [ ] T065 [US4] Add CSS styles in src/styles/calendar.css for .date-cell.holiday class with red text color matching weekends
- [ ] T066 [US4] Add CSS styles in src/styles/calendar.css for .holiday-name display (small font, positioned below nepali date)
- [ ] T067 [US4] Ensure notes indicator remains visible on weekend/holiday dates by adjusting z-index and positioning per acceptance scenario 4

**Checkpoint**: Weekend and holiday highlighting working - dates display in red, holiday names visible, compatible with notes indicators

---

## Phase 7: User Story 5 - Weekend Configuration (Priority: P2)

**Goal**: Allow users to select which days are weekends (Sunday, Saturday, or both)

**Independent Test**: Access settings → select "Sunday only" → verify only Sundays red → change to "Saturday only" → verify only Saturdays red → change to "Both" → verify both red → refresh → setting persists

### Implementation for User Story 5

- [ ] T068 [US5] Add weekend configuration section to src/settings/settings-modal.ts with radio buttons for "Sunday", "Saturday", "Both" per acceptance scenario 1
- [ ] T069 [US5] Implement handleWeekendChange in src/settings/settings-modal.ts that validates selection and calls updateSettings per contract validation
- [ ] T070 [US5] Add applyWeekendSettings function that re-renders calendar grid to update weekend highlighting
- [ ] T071 [US5] Update src/main.ts to call applyWeekendSettings on app initialization to apply persisted weekend configuration
- [ ] T072 [US5] Update settings modal save handler to call applyWeekendSettings immediately for visual feedback per acceptance scenario 1
- [ ] T073 [US5] Update src/utils/storage-sync.ts to call applyWeekendSettings on weekend setting changes from other tabs
- [ ] T074 [US5] Verify weekend highlighting updates correctly when navigating between months per acceptance scenario 4

**Checkpoint**: Weekend configuration working - all three modes functional, changes apply immediately, settings persist, highlighting consistent across months

---

## Phase 8: User Story 6 - Theme Customization (Priority: P3)

**Goal**: Allow users to customize calendar appearance with background color or image

**Independent Test**: Access settings → select background color with color picker → verify applies → enter image URL → verify displays → upload image file → verify displays → refresh → theme persists

### Implementation for User Story 6

- [ ] T075 [US6] Add theme customization section to src/settings/settings-modal.ts with theme type radio buttons: "None", "Color", "Image"
- [ ] T076 [US6] Add color picker input (type="color") to src/settings/settings-modal.ts for background color selection per FR-019
- [ ] T077 [US6] Add text input to src/settings/settings-modal.ts for background image URL per FR-020
- [ ] T078 [US6] Add file input to src/settings/settings-modal.ts for background image upload per FR-021
- [ ] T079 [US6] Implement handleColorChange in src/settings/settings-modal.ts with hex color validation per contract
- [ ] T080 [US6] Implement handleImageUrlChange in src/settings/settings-modal.ts with URL validation per contract
- [ ] T081 [US6] Implement handleImageUpload in src/settings/settings-modal.ts using FileReader API to convert to data URL with 2MB size limit per research
- [ ] T082 [US6] Create ThemeManager class in src/theme/theme-manager.ts with applyTheme method that reads settings and applies to DOM
- [ ] T083 [US6] Implement applyColorTheme method in src/theme/theme-manager.ts that sets calendar container background color
- [ ] T084 [US6] Implement applyImageTheme method in src/theme/theme-manager.ts that sets calendar container background image with CSS cover/center
- [ ] T085 [US6] Implement removeTheme method in src/theme/theme-manager.ts that resets to default background
- [ ] T086 [US6] Add text legibility check in src/theme/theme-manager.ts that ensures text contrast or adds overlay per FR-023
- [ ] T087 [US6] Add CSS styles in src/styles/global.css for themed calendar container (background transition, overlay for text legibility)
- [ ] T088 [US6] Update src/main.ts to initialize ThemeManager and call applyTheme on app load to restore persisted theme
- [ ] T089 [US6] Update settings modal save handler to call ThemeManager.applyTheme immediately for visual feedback per acceptance scenario 1-3
- [ ] T090 [US6] Update src/utils/storage-sync.ts to call ThemeManager.applyTheme on theme setting changes from other tabs
- [ ] T091 [US6] Add error handling in theme manager for failed image loads (404, network errors) per edge case - fall back to color or default

**Checkpoint**: Theme customization working - color picker functional, image URL works, file upload converts to data URL, theme persists, text remains legible

---

## Phase 9: User Story 7 - Holiday Management (Priority: P3)

**Goal**: Load holidays from JSON file and display on calendar with red highlighting

**Independent Test**: Create holidays.json with sample holidays → place in public/holidays/ → load app → verify holidays appear in red with names → click holiday date → modal shows description → navigate months/years → correct holidays display

### Implementation for User Story 7

- [ ] T092 [US7] Implement validateHolidayJSON function in src/holidays/holidays-loader.ts that checks schema per contract validation rules
- [ ] T093 [US7] Implement loadHolidays function in src/holidays/holidays-loader.ts that fetches JSON from public/holidays/holidays.json with error handling per acceptance scenario 5
- [ ] T094 [US7] Add JSON parsing and validation in loadHolidays that validates each holiday entry per contract schema
- [ ] T095 [US7] Store validated holidays in localStorage using miti:holidays key per data model
- [ ] T096 [US7] Implement getHolidaysForDate function in src/holidays/holidays-storage.ts that filters holidays array by date match per contract
- [ ] T097 [US7] Implement getHolidaysForYear function in src/holidays/holidays-storage.ts that returns year array from storage per contract
- [ ] T098 [US7] Implement getHolidaysForMonth function in src/holidays/holidays-storage.ts that filters year array by month per contract
- [ ] T099 [US7] Implement isHoliday function in src/holidays/holidays-storage.ts that checks if date has any holidays (O(m) check)
- [ ] T100 [US7] Implement getCachedHolidays function in src/holidays/holidays-storage.ts that reads all holidays from localStorage
- [ ] T101 [US7] Implement clearHolidays function in src/holidays/holidays-storage.ts that removes miti:holidays key
- [ ] T102 [US7] Create sample holidays.json file in public/holidays/ with 2082 and 2083 Nepali holidays following schema from research
- [ ] T103 [US7] Update src/main.ts to call loadHolidays on app initialization with try-catch for graceful fallback per acceptance scenario 5
- [ ] T104 [US7] Update src/components/CalendarGrid.ts to integrate holiday highlighting using getHolidaysForDate (already done in Phase 6 T063-T066)
- [ ] T105 [US7] Update src/notes/notes-modal.ts to display holiday description (if available) when opening modal for holiday dates per acceptance scenario 3
- [ ] T106 [US7] Add error notification UI in index.html for holiday loading failures (toast or banner)
- [ ] T107 [US7] Display user-friendly error message in notification when JSON validation fails per acceptance scenario 5

**Checkpoint**: Holiday management working - JSON loads and caches, holidays display in red with names, descriptions show in modal, validation errors handled gracefully, calendar functions without holidays

---

## Phase 10: User Story 8 - Chrome Extension (Priority: P3)

**Goal**: Package calendar as Chrome extension for new tab page

**Independent Test**: Build extension → load unpacked in chrome://extensions → open new tab → calendar displays → add notes/change settings → data persists → all features work identically to web app

### Implementation for User Story 8

- [ ] T108 [US8] Create extension/ directory structure with icons/ subdirectory
- [ ] T109 [US8] Create manifest.json in extension/ with Manifest v3 format per research (chrome_url_overrides.newtab, storage permission)
- [ ] T110 [US8] Generate extension icons in extension/icons/ at required sizes: 16x16, 48x48, 128x128 (can use calendar icon with Nepali theme)
- [ ] T111 [US8] Update package.json with build:extension script that runs npm run build and copies manifest + icons to dist/
- [ ] T112 [US8] Test extension installation in Chrome: run build:extension → load unpacked from dist/ → verify new tab override works per acceptance scenario 1
- [ ] T113 [US8] Verify localStorage persistence works in extension context by adding notes and reopening tabs per acceptance scenario 2
- [ ] T114 [US8] Verify all features function in extension: navigation, notes CRUD, settings changes, sidebar, weekends, holidays, themes per acceptance scenario 3
- [ ] T115 [US8] Add extension documentation to README.md with installation instructions and permissions explanation per acceptance scenario 4-5

**Checkpoint**: Chrome extension working - installs successfully, displays as new tab, all features functional, localStorage works, only storage permission requested

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation that affect multiple user stories

- [ ] T116 [P] Add keyboard shortcuts: ESC to close modals, Tab for focus management within modals per accessibility requirements
- [ ] T117 [P] Add loading states for holiday JSON fetch in src/main.ts (spinner or skeleton UI)
- [ ] T118 [P] Implement localStorage usage monitor in src/utils/storage.ts that warns at 80% capacity per research
- [ ] T119 [P] Add smooth transitions for sidebar position changes and visibility toggles in src/styles/sidebar.css
- [ ] T120 [P] Add smooth transitions for theme changes in src/styles/global.css
- [ ] T121 [P] Optimize bundle size: verify final build is under 200KB gzipped (currently 3.38KB + estimated 23-30KB additions)
- [ ] T122 [P] Update README.md with feature overview, notes system usage, settings configuration, holiday JSON format
- [ ] T123 [P] Create holidays JSON template file public/holidays/holidays-template.json with instructions for customization
- [ ] T124 [P] Add error boundary or global error handler for unhandled exceptions to prevent app crashes
- [ ] T125 [P] Run cross-browser testing in Chrome, Firefox, Safari per constitution requirement
- [ ] T126 Run final validation against all 12 success criteria from spec.md (SC-001 through SC-012)
- [ ] T127 Verify all 30 functional requirements are implemented (FR-001 through FR-030)
- [ ] T128 Test all edge cases documented in spec.md (localStorage full, long notes, rapid notes, invalid JSON, large images, many notes, multi-tab, broken image URL, date formatting)
- [ ] T129 Measure and document actual performance metrics: modal open time, sidebar update time, settings change time, 100 notes handling
- [ ] T130 Create git commit with message: "feat: implement calendar customization and note-taking features (US1-US8)"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - MVP
  - US2 (Phase 4): Can start after Foundational - Requires US1 for notes data
  - US3 (Phase 5): Can start after US2 (sidebar must exist to configure)
  - US4 (Phase 6): Can start after Foundational - Independent of notes
  - US5 (Phase 7): Can start after Foundational - Independent of notes
  - US6 (Phase 8): Can start after Foundational - Independent of notes
  - US7 (Phase 9): Can start after Foundational - Independent of notes
  - US8 (Phase 10): Depends on all desired features being complete
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: MVP - Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 for notes storage API - Uses getNotesForMonth from notes-storage.ts
- **User Story 3 (P2)**: Depends on US2 for sidebar component - Configures existing sidebar
- **User Story 4 (P2)**: Can start after Foundational - Independent
- **User Story 5 (P2)**: Can start after Foundational - Independent (provides settings for US4)
- **User Story 6 (P3)**: Can start after Foundational - Independent
- **User Story 7 (P3)**: Can start after Foundational - Independent (extends US4 highlighting)
- **User Story 8 (P3)**: Depends on completing all desired features - Just packages existing app

### Within Each User Story

Tasks within each story follow this order:
1. Storage/data layer (localStorage functions)
2. Business logic (validation, processing)
3. UI components (modals, forms)
4. Integration (connect to calendar grid, main app)
5. Styling (CSS for new components)
6. Event handlers and synchronization

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- All 7 tasks can run in parallel (T002-T007 marked [P])

**Foundational Phase (Phase 2)**:
- T009, T010, T011 can run in parallel (different files, no dependencies)

**After Foundational Phase Completes**:
- US4 (Visual Highlighting), US5 (Weekend Config), US6 (Theme), US7 (Holidays) can start in parallel
- US1 (Notes) must complete before US2 (Sidebar)
- US2 (Sidebar) must complete before US3 (Sidebar Config)

**Within User Stories**:
- Storage functions that don't depend on each other can be parallelized
- CSS files can be worked on in parallel with TypeScript
- Independent components can be built in parallel

---

## Parallel Example: User Story 1 (Notes System)

```bash
# Can be done in parallel:
T014: getNotesForDate in src/notes/notes-storage.ts
T015: addNote in src/notes/notes-storage.ts
T016: updateNote in src/notes/notes-storage.ts
T017: deleteNote in src/notes/notes-storage.ts
T018: hasNotes in src/notes/notes-storage.ts
T019: getNotesCount in src/notes/notes-storage.ts
# (All different functions in same file but logically independent)

# Then sequentially:
T020: Create NotesModal class (depends on storage functions)
T021-T024: Modal methods (depend on T020)
T025: Visual indicator (depends on storage functions)
T026-T027: CSS styles (can be parallel with modal implementation)
T028-T031: Integration (depends on modal and indicator being ready)
```

---

## Parallel Example: After Foundational Complete

```bash
# These user stories can start in parallel with different team members:

Developer A: US1 (Notes System) - T014 through T031
Developer B: US4 (Visual Highlighting) + US5 (Weekend Config) - T060 through T074
Developer C: US7 (Holidays) - T092 through T107

# US2 and US3 must wait for US1 completion
# US6 (Theme) and US8 (Extension) can be done anytime after foundational
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) - CRITICAL
3. Complete Phase 3: User Story 1 - Notes (T014-T031)
4. Complete Phase 4: User Story 2 - Sidebar (T032-T043)
5. **STOP and VALIDATE**: Test notes system independently
6. Deploy/demo MVP

**MVP Deliverable**: Users can add notes to dates, see all month notes in sidebar, notes persist across sessions

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1-2): Setup + Foundational → Infrastructure ready
2. **MVP** (Phase 3-4): US1 + US2 → Notes system working → Deploy
3. **Configuration** (Phase 5): US3 → Sidebar configurable → Deploy
4. **Visual Enhancement** (Phase 6-7): US4 + US5 → Weekends highlighted → Deploy
5. **Personalization** (Phase 8): US6 → Themes → Deploy
6. **Holidays** (Phase 9): US7 → Holiday data → Deploy
7. **Distribution** (Phase 10): US8 → Chrome extension → Deploy
8. **Polish** (Phase 11): Cross-cutting improvements → Final release

Each delivery adds value without breaking previous functionality.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

**Week 1-2**:
- Developer A: US1 (Notes) + US2 (Sidebar) - Core MVP
- Developer B: US4 (Highlighting) + US5 (Weekend Config)
- Developer C: US7 (Holidays)

**Week 3**:
- Developer A: US3 (Sidebar Config) - depends on US2
- Developer B: US6 (Theme)
- Developer C: US8 (Extension) - depends on features being stable

**Week 4**:
- All developers: Phase 11 (Polish), testing, validation

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - Notes)**: 18 tasks
- **Phase 4 (US2 - Sidebar)**: 12 tasks
- **Phase 5 (US3 - Sidebar Config)**: 16 tasks
- **Phase 6 (US4 - Visual Highlighting)**: 8 tasks
- **Phase 7 (US5 - Weekend Config)**: 7 tasks
- **Phase 8 (US6 - Theme)**: 17 tasks
- **Phase 9 (US7 - Holidays)**: 16 tasks
- **Phase 10 (US8 - Extension)**: 8 tasks
- **Phase 11 (Polish)**: 15 tasks

**Total**: 130 tasks

**MVP (US1 + US2)**: 43 tasks (Setup + Foundational + US1 + US2)

---

## Notes

- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks = can run in parallel (different files or logically independent)
- [Story] label (US1-US8) maps task to specific user story for traceability
- Each user story is independently completable after Foundational phase
- US2 depends on US1 (sidebar needs notes data)
- US3 depends on US2 (configures existing sidebar)
- US8 depends on feature stability (packages complete app)
- All other stories (US4-US7) are independent after Foundational
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
- Manual testing throughout - no automated test tasks included
- Performance monitoring during Polish phase ensures constitution compliance
