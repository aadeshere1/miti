# Implementation Plan: UI Polish & Challenge Reminders

**Branch**: `005-ui-polish-reminders` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-ui-polish-reminders/spec.md`

## Summary

This feature addresses four areas: (1) fixing navigation button positions so they don't shift with month name length, (2) making the calendar grid larger while fitting the viewport, (3) adding visual spacing between calendar and sidebar, and (4) adding a per-challenge reminder system that shows inline banners when opening the app during configured time windows.

## Technical Context

**Language/Version**: TypeScript (compiled to ES2020+ JavaScript) — matches existing codebase
**Primary Dependencies**: @remotemerge/nepali-date-converter (1.8 KB gzipped), Vite (build only) — no new dependencies
**Storage**: Browser localStorage — existing `miti:challenges` key extended with `reminderTime` field; no new keys
**Testing**: Manual cross-browser testing; automated tests optional
**Target Platform**: Chrome Extension (new tab override) + Web app (localhost:3000)
**Project Type**: Single (client-side web app)
**Performance Goals**: Calendar render < 100ms, date conversion < 10ms, reminder check < 5ms
**Constraints**: Bundle < 200KB gzipped (current: ~18KB gzipped total), offline-capable, no server dependencies
**Scale/Scope**: Single-user local app, 10 max challenges, 5 reminder window options

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Calendar Accuracy (NON-NEGOTIABLE) | PASS | No changes to date conversion or calendar calculations |
| II. Browser Compatibility | PASS | CSS flexbox and `calc()` supported in all target browsers; no proprietary APIs |
| III. Offline-First | PASS | Reminders use local system time + localStorage; no network dependency |
| IV. Performance | PASS | CSS-only changes for layout; reminder check is a simple hour comparison (~1ms); bundle increase < 2KB |
| V. Simplicity | PASS | No new dependencies; reminder logic is pure functions; 2 new files (~150 LOC); max 3 component nesting preserved |

**Post-Phase 1 re-check**: All gates still PASS. No architecture changes; data model extension is backward-compatible.

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-polish-reminders/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model changes
├── quickstart.md        # Phase 1: implementation quickstart
├── contracts/           # Phase 1: API contracts
│   └── ui-api.md        # CSS + TypeScript contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── challenges/
│   ├── challenges-types.ts       # MODIFY: add ReminderTimeWindow type, extend Challenge
│   ├── challenges-storage.ts     # MODIFY: add migration for reminderTime field
│   ├── challenges-reminder.ts    # NEW: reminder service (window check, dismiss logic)
│   ├── challenges-reminder-ui.ts # NEW: reminder banner rendering
│   ├── challenges-popover.ts     # UNCHANGED
│   └── challenges-ui.ts          # UNCHANGED
├── settings/
│   └── settings-modal.ts         # MODIFY: add reminder time dropdown per challenge
├── styles/
│   ├── calendar.css              # MODIFY: fix nav buttons, increase grid size
│   ├── sidebar.css               # MODIFY: add gap to app-container
│   └── challenges.css            # MODIFY: add reminder banner styles
├── main.ts                       # MODIFY: call renderReminders() on init
└── [all other files]             # UNCHANGED
```

**Structure Decision**: Follows existing module-per-feature pattern. New reminder logic goes in `src/challenges/` alongside existing challenge code. CSS changes go in existing style files. No new directories needed.

## Complexity Tracking

No constitution violations. No complexity justification needed.
