# Implementation Plan: Calendar Customization and Note-Taking

**Branch**: `002-calendar-customization` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-calendar-customization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enhances the existing Nepali calendar application by adding personalization and note-taking capabilities. Core functionality includes: (1) A notes system allowing users to add, edit, and delete memos for any date with localStorage persistence; (2) A configurable sidebar displaying all notes for the current month with real-time updates; (3) Weekend configuration to select which days are highlighted in red; (4) Holiday display from JSON files with red highlighting; (5) Theme customization for background colors or images; (6) Chrome extension packaging for new tab page deployment. All settings and data persist in browser localStorage, maintaining the offline-first architecture while transforming the calendar from a read-only view into a personal planning tool.

## Technical Context

**Language/Version**: TypeScript → JavaScript (ES2020+)
**Primary Dependencies**: @remotemerge/nepali-date-converter (1.8 KB), Vite (build only)
**Storage**: Browser localStorage for notes, settings, and holiday data
**Testing**: Manual cross-browser testing (Chrome, Firefox, Safari)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions)
**Project Type**: Single web application (extending existing calendar)
**Performance Goals**:
  - Notes modal open/close: <300ms
  - Sidebar updates: <500ms
  - Settings changes: <200ms visual feedback
  - Support 100+ notes per month without degradation
**Constraints**:
  - Bundle size: Stay under 200KB gzipped total (currently 3.38 KB)
  - localStorage quota limits (~5-10MB per domain)
  - Offline-first: All features must work without network except holiday JSON loading
  - No backend dependencies
**Scale/Scope**:
  - 8 user stories (4 P1, 2 P2, 2 P3)
  - 30 functional requirements
  - ~12-15 new TypeScript modules estimated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Calendar Accuracy (NON-NEGOTIABLE)
**Status**: ✅ PASS

This feature adds UI enhancements and note-taking around the existing calendar but does not modify date conversion logic. All calendar calculations remain untouched. Notes are keyed by date but don't affect date display or conversion accuracy.

**Verification**: No changes to `src/calendar/conversions.ts`, `src/calendar/calendar-data.ts`, or `src/calendar/date-utils.ts` core logic.

### II. Browser Compatibility
**Status**: ✅ PASS

All features use standard Web APIs:
- localStorage API (supported in all target browsers)
- File input API for image upload (standard HTML5)
- CSS color input type (widely supported)
- DOM events for modal interactions
- No proprietary browser features required

**Verification**: localStorage, File API, and input type="color" work in Chrome, Firefox, Safari, Edge latest 2 versions.

### III. Offline-First Architecture
**Status**: ⚠️ CONDITIONAL PASS

Core note-taking and settings features work entirely offline using localStorage. Holiday JSON loading is the only network-dependent feature, and it gracefully degrades - calendar functions normally if holidays fail to load.

**Risk**: localStorage has quota limits (~5-10MB). Large volumes of notes or background images could hit limits.

**Mitigation**:
- Implement character limit (5,000 per note) per FR-030
- Image file size limit (2MB) per edge cases
- localStorage quota error handling per FR-028
- Clear user feedback when approaching limits

### IV. Performance & Responsiveness
**Status**: ✅ PASS (with monitoring required)

Success criteria define strict performance budgets:
- Modal operations: <300ms (SC-009)
- Sidebar updates: <500ms (SC-003)
- Settings changes: <200ms (SC-005)
- 100 notes support without degradation (SC-010)

Current bundle: 3.38 KB / 200 KB budget = 1.7% used. Estimated additions:
- Notes UI + modal: ~8-10 KB
- Sidebar component: ~5-7 KB
- Settings management: ~4-6 KB
- Holiday loading: ~3-4 KB
- **Total estimated**: ~23-30 KB added (still well under 200 KB budget)

**Monitoring**: Bundle size must be measured after implementation to verify estimates.

### V. Simplicity & Maintainability
**Status**: ✅ PASS

Implementation follows existing architecture patterns:
- Pure vanilla TypeScript/JavaScript (no framework added)
- localStorage abstraction follows state management pattern in `src/state/`
- Component structure mirrors existing `src/components/` organization
- No new external dependencies beyond existing Vite build
- Maximum 3 levels of nesting maintained

**Architecture**: Notes, Settings, and Holiday modules will be separate concerns with clear interfaces, following existing calendar module separation.

### Pre-Implementation Decision

**PROCEED TO PHASE 0 RESEARCH**: All constitutional requirements pass or have documented mitigations. No blocking violations.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Existing Structure (from feature 001)
src/
├── calendar/              # Core calendar logic (DO NOT MODIFY)
│   ├── conversions.ts     # Date conversions (Gregorian ↔ Nepali)
│   ├── calendar-data.ts   # Month names, day counts
│   └── date-utils.ts      # Date manipulation utilities
├── components/            # UI rendering components
│   ├── CalendarGrid.ts    # Month grid (EXTEND for notes indicator)
│   ├── MonthHeader.ts     # Month title and navigation
│   └── WeekdayHeaders.ts  # Day-of-week labels
├── state/                 # Application state management
│   └── calendar-state.ts  # Current month, today, selection
├── styles/                # CSS files
│   ├── global.css         # Base styles
│   └── calendar.css       # Calendar-specific styles (EXTEND for weekends, holidays)
├── types.ts               # TypeScript type definitions
└── main.ts                # Application entry point (EXTEND for modal setup)

# New Modules for Feature 002
src/
├── notes/                 # NEW: Notes management module
│   ├── notes-storage.ts   # localStorage CRUD operations for notes
│   ├── notes-modal.ts     # Modal UI for viewing/editing notes
│   └── notes-types.ts     # Note entity types
├── sidebar/               # NEW: Notes sidebar module
│   ├── sidebar-component.ts  # Sidebar rendering and interactions
│   └── sidebar-state.ts      # Sidebar configuration state
├── settings/              # NEW: Settings management module
│   ├── settings-storage.ts   # localStorage for settings
│   ├── settings-modal.ts     # Settings UI component
│   └── settings-types.ts     # Settings entity types
├── holidays/              # NEW: Holiday management module
│   ├── holidays-loader.ts    # JSON file loading and parsing
│   ├── holidays-storage.ts   # Holiday data storage
│   └── holidays-types.ts     # Holiday entity types
└── theme/                 # NEW: Theme customization module
    ├── theme-manager.ts      # Apply background colors/images
    └── theme-storage.ts      # Theme settings persistence

# Chrome Extension Structure (Phase: Priority P3)
extension/                 # NEW: Chrome extension wrapper
├── manifest.json          # Extension manifest v3
├── icons/                 # Extension icons (16x16, 48x48, 128x128)
└── background.js          # Service worker (if needed)

# Data Files
public/                    # NEW: Public assets directory
└── holidays/              # Holiday JSON files
    └── holidays.json      # Holiday data (user-provided or default)

# Build Output
dist/                      # Vite build output
└── index.html             # Bundled application

# Root Files
index.html                 # HTML entry point
vite.config.ts            # Build configuration
package.json              # Dependencies
tsconfig.json             # TypeScript config
```

**Structure Decision**: Single-project web application structure. All new features are organized as separate modules under `src/` following the existing pattern (`calendar/`, `components/`, `state/`). This maintains consistency with the established architecture and keeps related functionality grouped. The Chrome extension will be a simple wrapper in `extension/` directory that loads the built dist output.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. All design decisions align with core principles.

---

## Post-Design Constitution Re-Check

*Re-evaluation after completing Phase 0 (Research) and Phase 1 (Design)*

### I. Calendar Accuracy (NON-NEGOTIABLE)
**Status**: ✅ PASS - CONFIRMED

Design does not touch core calendar logic. All date conversions remain in existing modules. Notes and holidays are keyed by Nepali date strings but do not affect calculation accuracy.

### II. Browser Compatibility
**Status**: ✅ PASS - CONFIRMED

All APIs verified in research:
- localStorage: Supported in all target browsers
- File API (FileReader): Supported in Chrome, Firefox, Safari, Edge
- Color input: Supported in all targets
- Storage events: Supported for multi-tab sync

### III. Offline-First Architecture
**Status**: ✅ PASS - CONFIRMED

Design maintains offline-first approach:
- Notes: Fully offline (localStorage)
- Settings: Fully offline (localStorage)
- Holidays: Cached after first load, graceful degradation if unavailable
- Theme: Images stored as data URLs (offline)

Only network dependency: Initial holiday JSON fetch (optional feature).

### IV. Performance & Responsiveness
**Status**: ✅ PASS - VERIFIED

Research validates performance:
- Modal operations: Direct DOM manipulation, minimal overhead
- localStorage operations: O(1) for most operations
- Estimated bundle addition: 23-30 KB (within budget)
- Success criteria define specific targets (<300ms modals, <500ms sidebar)

**Post-implementation verification required**: Actual bundle size measurement.

### V. Simplicity & Maintainability
**Status**: ✅ PASS - CONFIRMED

Design adheres to simplicity:
- No new framework dependencies
- Clear module separation (notes/, settings/, holidays/, sidebar/)
- Follows existing patterns from feature 001
- Reusable Modal class for both notes and settings
- Pure functions for calendar logic, stateful components for UI

**Architecture Quality**: 5 new modules with single responsibilities, maximum 2-3 levels of nesting.

### Final Gate Decision

**✅ APPROVED FOR IMPLEMENTATION**

All constitutional requirements satisfied. Design artifacts (research.md, data-model.md, contracts/, quickstart.md) complete. Ready for `/speckit.tasks` command to generate implementation tasks.

---

## Design Artifacts Summary

### Phase 0: Research (Completed)
- **research.md**: 7 technical decisions documented
  - localStorage architecture
  - Modal implementation pattern
  - Chrome extension manifest v3
  - Holiday JSON schema
  - Image storage strategy
  - Quota management approach
  - Multi-tab synchronization

### Phase 1: Design (Completed)
- **data-model.md**: 4 entities defined
  - Note (with validation rules and lifecycle)
  - Holiday (with JSON schema)
  - Settings (with defaults and types)
  - CalendarDate (extended attributes)

- **contracts/**: 3 API contracts
  - notes-api.md: CRUD operations for notes
  - settings-api.md: Settings management
  - holidays-api.md: Holiday loading and queries

- **quickstart.md**: Implementation guide
  - 6 phases with step-by-step instructions
  - Code examples for each module
  - Testing checklist
  - Debugging tips

### Phase 2: Task Generation (Next Step)

Run `/speckit.tasks` to generate tasks.md with:
- Detailed implementation tasks across 6 phases
- Dependencies and ordering
- Estimated effort per task
- Verification steps

---

## Implementation Readiness

**Status**: ✅ READY

All planning artifacts complete:
- [x] Feature specification (spec.md)
- [x] Implementation plan (plan.md)
- [x] Technical research (research.md)
- [x] Data model (data-model.md)
- [x] API contracts (contracts/)
- [x] Development guide (quickstart.md)
- [x] Agent context updated (CLAUDE.md)
- [x] Constitution compliance verified

**Next Command**: `/speckit.tasks` to generate implementation tasks
