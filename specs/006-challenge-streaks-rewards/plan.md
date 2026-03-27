# Implementation Plan: Challenge Streaks & Rewards

**Branch**: `006-challenge-streaks-rewards` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-challenge-streaks-rewards/spec.md`

## Summary

This feature adds two major capabilities: (1) a prominent today challenge checklist displayed above the calendar grid for quick daily interaction, and (2) a streak tracking + milestone reward system with motivational quotes and badges at 3, 7, 15, and 30-day streaks. The checklist syncs bidirectionally with existing date cell challenge indicators. Streak stats and earned badges persist across sessions via localStorage.

## Technical Context

**Language/Version**: TypeScript (compiled to ES2020+ JavaScript) — matches existing codebase
**Primary Dependencies**: @remotemerge/nepali-date-converter (1.8 KB gzipped), Vite (build only) — no new dependencies
**Storage**: Browser localStorage — new `miti:streak-stats` key for badges/best streak; existing `miti:challenge-completions:YYYY-MM-DD` for streak calculation
**Testing**: Manual cross-browser testing; automated tests optional
**Target Platform**: Chrome Extension (new tab override) + Web app (localhost:3000)
**Project Type**: Single (client-side web app)
**Performance Goals**: Calendar render < 100ms, streak calculation < 50ms (30 day max lookback), date conversion < 10ms
**Constraints**: Bundle < 200KB gzipped (current: ~14KB gzipped JS), offline-capable, no server dependencies
**Scale/Scope**: Single-user local app, 10 max challenges, 4 milestones, 30-day max streak lookback

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Calendar Accuracy (NON-NEGOTIABLE) | PASS | No changes to date conversion or calendar calculations. Streak uses existing Nepali date conversions. |
| II. Browser Compatibility | PASS | Uses standard DOM APIs (createElement, insertAdjacentElement, checkbox inputs). No proprietary features. |
| III. Offline-First | PASS | Streak calculation uses local localStorage data and local system time. No network dependency. |
| IV. Performance | PASS | Streak calculation is max 30 localStorage reads + 30 date conversions (~50ms worst case). Today checklist is a single DOM insertion. Bundle increase < 3KB. |
| V. Simplicity | PASS | No new dependencies. 2 new files (~200 LOC). Pure functions for streak calculation. Max 2 levels of component nesting. |

**Post-Phase 1 re-check**: All gates still PASS. Data model adds one new localStorage key. No architecture changes needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-challenge-streaks-rewards/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model changes
├── quickstart.md        # Phase 1: implementation quickstart
├── contracts/           # Phase 1: API contracts
│   └── ui-api.md        # TypeScript + CSS contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── challenges/
│   ├── challenges-types.ts          # MODIFY: add StreakStats, Milestone types, constants
│   ├── challenges-streak.ts         # NEW: streak calculation service
│   ├── challenges-today-ui.ts       # NEW: today checklist + celebration banner UI
│   ├── challenges-ui.ts             # MODIFY: add callback for sync from date cell to checklist
│   ├── challenges-storage.ts        # UNCHANGED
│   ├── challenges-reminder.ts       # UNCHANGED
│   └── challenges-reminder-ui.ts    # UNCHANGED
├── styles/
│   └── challenges.css               # MODIFY: add today checklist + celebration banner styles
├── main.ts                          # MODIFY: wire renderTodayChecklist() calls
└── [all other files]                # UNCHANGED
```

**Structure Decision**: Follows existing module-per-feature pattern. Streak logic goes in `src/challenges/` alongside existing challenge code. Two new files: one for streak calculation (pure functions), one for UI rendering. CSS changes go in existing `challenges.css`.

## Complexity Tracking

No constitution violations. No complexity justification needed.
