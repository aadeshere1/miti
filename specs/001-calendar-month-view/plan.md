# Implementation Plan: Calendar Month View

**Branch**: `001-calendar-month-view` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-calendar-month-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a browser-based Nepali calendar month view that displays dates in a standard 7-column grid format. Each date cell shows the Nepali (Bikram Sambat) date prominently with the corresponding Gregorian date in the bottom right corner. Users can navigate between months and view the current date highlighted. The implementation must ensure 100% date conversion accuracy, work offline in all modern browsers, and meet strict performance budgets (<100ms render, <10ms conversions).

## Technical Context

**Language/Version**: TypeScript (compiled to ES2020+ JavaScript) - Resolved in research.md: type safety critical for date calculations, zero runtime overhead
**Primary Dependencies**: @remotemerge/nepali-date-converter (1.8 KB gzipped) - Resolved in research.md: smallest, accurate, TypeScript-supported library; no framework (vanilla JS output)
**Storage**: N/A (no backend storage - all client-side, calendar data bundled)
**Testing**: Manual calendar accuracy testing with known correct dates (constitution requirement); browser cross-testing in Chrome, Firefox, Safari, Edge
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions; iOS Safari 14+, Chrome Mobile latest 2)
**Project Type**: Single web application (browser-based, no backend)
**Performance Goals**:
  - Initial render: <100ms (constitution)
  - Date conversions: <10ms per operation (constitution)
  - Month navigation: <16ms for 60fps (constitution)
  - Bundle size: <200KB gzipped (constitution)
  - Memory usage: <50MB typical use (constitution)
**Constraints**:
  - Offline-capable (no network required for core features)
  - Browser-only execution (no server-side processing)
  - Cross-browser compatible (standard Web APIs only)
  - Calendar accuracy NON-NEGOTIABLE (100% correct date conversions)
**Scale/Scope**: Single-user browser application; handle ±100 years of calendar data; responsive from 320px to desktop widths

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Calendar Accuracy (NON-NEGOTIABLE) ✅

**Status**: PASS (with requirements)

- ✅ Date conversion logic must be validated against official Nepali calendar sources
- ✅ Month lengths (29-32 days varying by year/month) handled via data or algorithm
- ✅ Gregorian-Bikram Sambat bidirectional conversion required
- ✅ Manual accuracy testing with known correct dates mandatory before release
- ✅ **COMPLETED Phase 0**: Selected @remotemerge/nepali-date-converter - 100% accuracy, 1975-2099 BS range, verified lookup tables

### II. Browser Compatibility ✅

**Status**: PASS

- ✅ Target: Chrome, Firefox, Safari, Edge (latest 2 versions)
- ✅ Mobile: iOS Safari 14+, Chrome Mobile
- ✅ Client-side only (no server dependencies for core features)
- ✅ Standard Web APIs only (Date, DOM, CSS Grid/Flexbox)
- ✅ Graceful degradation for unsupported browsers

### III. Offline-First Architecture ✅

**Status**: PASS

- ✅ Calendar calculations run entirely in browser
- ✅ Calendar data bundled with application (no API calls for dates)
- ✅ No network required for month view, navigation, or date display
- ℹ️ Service Worker optional (PWA features out of scope for this feature)

### IV. Performance & Responsiveness ✅

**Status**: PASS (measurable targets defined)

- ✅ Render budget: <100ms initial paint
- ✅ Conversion budget: <10ms per date calculation
- ✅ Navigation budget: <16ms (60fps) for month transitions
- ✅ Bundle budget: <200KB gzipped
- ✅ Memory budget: <50MB typical use
- ✅ **COMPLETED Phase 0**: No framework - vanilla JS output, expected ~10-15 KB gzipped (7.5% of 200KB budget)

### V. Simplicity & Maintainability ✅

**Status**: PASS (with design constraints)

- ✅ Vanilla JavaScript OR minimal framework (<50KB)
- ✅ Pure functions for calendar calculations (no hidden state)
- ✅ Maximum 3 levels of component nesting
- ✅ Clear separation: calendar logic (pure) vs UI rendering
- ✅ **COMPLETED Phase 0**: TypeScript → vanilla JS (no framework), pure functions for calendar logic, CSS Grid for layout

### Overall Gate Status: ✅ APPROVED - PHASE 1 COMPLETE

**Summary**: All constitutional principles satisfied. Phase 0 research completed:
1. ✅ **Library Selected**: @remotemerge/nepali-date-converter (1.8 KB gzipped, 100% accuracy)
2. ✅ **Tech Stack Decided**: TypeScript → ES2020+ vanilla JavaScript (no framework)
3. ✅ **Bundle Projection**: 10-15 KB gzipped total (7.5% of budget)
4. ✅ **Phase 1 Design**: data-model.md, contracts/calendar-api.md, quickstart.md generated

**Post-Phase 1 Re-evaluation**: All constitutional principles remain satisfied. Ready for `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/001-calendar-month-view/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── calendar-api.md  # Internal API contracts (if using modules)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single web application structure
src/
├── calendar/
│   ├── conversions.js     # Pure date conversion functions (BS <-> Gregorian)
│   ├── calendar-data.js   # Nepali calendar month length data
│   └── date-utils.js      # Helper functions for date operations
├── components/
│   ├── CalendarGrid.js    # Month grid layout component
│   ├── DateCell.js        # Individual date cell with dual dates
│   ├── MonthHeader.js     # Month/year display and navigation
│   └── WeekdayHeaders.js  # Day-of-week column headers
├── state/
│   └── calendar-state.js  # Current month state management (minimal)
├── styles/
│   ├── calendar.css       # Calendar-specific styles
│   └── global.css         # Base styles and resets
├── index.html             # Entry point
└── main.js                # Application initialization

# No tests directory initially (manual testing per constitution)
# Tests can be added later if automated testing is desired
```

**Structure Decision**: Single web application structure chosen because:
- Browser-based application with no backend (matches constitution "No Backend" requirement)
- All code runs client-side in a single deployment unit
- Simple folder structure aligns with Simplicity & Maintainability principle
- Separation of concerns: calendar logic (`calendar/`) separate from UI (`components/`)
- No need for backend/, frontend/ split - this IS the frontend

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional principles can be satisfied with straightforward design.
