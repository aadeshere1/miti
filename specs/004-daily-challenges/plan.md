# Implementation Plan: Daily Challenges

**Branch**: `004-daily-challenges` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-daily-challenges/spec.md`

## Summary

Add a daily challenge tracking feature to the Miti Nepali calendar. Users can track habits like "No Junk Food", "First Thing Water", and "No Sugar" by checking off challenges directly from calendar date cells. Three default challenges are provided (all disabled by default); users can enable them and add custom challenges (up to 10 total) via the settings panel. Challenge indicators appear as small emoji icons within date cells, with `stopPropagation` to keep them separate from the existing notes-modal click handler. Data is persisted in localStorage following existing patterns. When >4 challenges are active, a compact "3/5" summary badge replaces individual icons, with a click-to-open popover for full details.

## Technical Context

**Language/Version**: TypeScript (compiled to ES2020+ JavaScript) — matches existing codebase
**Primary Dependencies**: @remotemerge/nepali-date-converter (1.8 KB gzipped), Vite (build only) — no new dependencies
**Storage**: Browser localStorage — `miti:challenges` for definitions, `miti:challenge-completions:YYYY-MM-DD` for daily data
**Testing**: Manual browser testing (Chrome, Firefox, Safari) — matches existing project conventions
**Target Platform**: Modern browsers (latest 2 versions of Chrome, Firefox, Safari, Edge), iOS Safari 14+
**Project Type**: Single client-side web application (vanilla TypeScript, no framework)
**Performance Goals**: Calendar rendering <100ms, challenge toggle <16ms (60fps), bundle size <200KB gzipped
**Constraints**: Offline-capable (all localStorage), no server dependencies, no new npm packages
**Scale/Scope**: Max 10 active challenges per user, ~365 completion entries per challenge per year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Calendar Accuracy (NON-NEGOTIABLE) | PASS | Feature adds UI overlay on date cells; does not modify date conversion logic or calendar calculations. Nepali date format (YYYY-MM-DD) reused for challenge completion keys. |
| II. Browser Compatibility | PASS | Uses standard DOM APIs only (createElement, addEventListener, stopPropagation). Emoji rendering supported in all target browsers. No new Web APIs required. |
| III. Offline-First Architecture | PASS | All data stored in localStorage. No network requests. Challenges work entirely client-side. |
| IV. Performance & Responsiveness | PASS | Challenge indicators are lightweight DOM elements (~5-10 extra elements per cell for today). Toggle is a single localStorage write + CSS class change. No new npm dependencies — bundle size impact is code-only (~3-5KB estimated). |
| V. Simplicity & Maintainability | PASS | Follows existing patterns: storage module (like notes-storage), types file (like notes-types), UI integration in CalendarGrid (like holidays/notes indicators). Max 2 levels of component nesting. No new abstractions beyond what exists. |

**Post-Phase 1 Re-check**: All gates still pass. Data model uses flat localStorage keys (no new abstractions). Popover is a simple positioned div (no library). Emoji picker is a hardcoded array (no dependency).

## Project Structure

### Documentation (this feature)

```text
specs/004-daily-challenges/
├── plan.md              # This file
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: developer guide
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── challenges/                    # NEW: Challenge feature module
│   ├── challenges-types.ts        # Challenge and ChallengeCompletion interfaces
│   ├── challenges-storage.ts      # CRUD for challenges + completions in localStorage
│   ├── challenges-ui.ts           # Render challenge indicators in date cells
│   └── challenges-popover.ts      # Popover component for compact summary expansion
├── components/
│   ├── CalendarGrid.ts            # MODIFIED: integrate challenge indicators into cell rendering
│   └── DateCell.ts                # MODIFIED: add challenge indicator container to cell structure
├── settings/
│   ├── settings-modal.ts          # MODIFIED: add Daily Challenges section
│   └── settings-types.ts          # UNCHANGED (challenge settings stored separately)
├── styles/
│   └── challenges.css             # NEW: styles for challenge indicators, popover, settings section
├── utils/
│   ├── storage.ts                 # UNCHANGED (reuse existing getItem/setItem)
│   └── storage-sync.ts            # MODIFIED: handle challenge storage events for multi-tab sync
└── main.ts                        # MODIFIED: initialize challenge system, register change handlers
```

**Structure Decision**: Single project structure (Option 1 equivalent). New `challenges/` module follows the same pattern as existing `notes/`, `holidays/`, and `settings/` modules — a types file, a storage file, and UI files. No contracts directory needed since this is a purely client-side feature with no API.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
