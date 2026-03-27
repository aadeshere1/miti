# Research: Challenge Streaks & Rewards

**Feature**: 006-challenge-streaks-rewards
**Date**: 2026-03-19

## R1: Streak Calculation Strategy

**Decision**: Walk backward from today (or yesterday) through consecutive Nepali dates, checking completion data for each date.

**Rationale**: The completion data is stored per-date as `miti:challenge-completions:YYYY-MM-DD`. To calculate a streak, we convert today's Gregorian date to Nepali, then walk backward day-by-day: convert Nepali date to Gregorian, subtract 1 day, convert back. For each date, load completions and check if all enabled challenges are complete. Stop when a day is incomplete.

**Alternatives considered**:
- Pre-computed streak counter stored in localStorage: Simpler but fragile — would desync if user modifies completions retroactively or disables challenges
- Scanning all completion keys: Too expensive — would need to iterate all localStorage keys

**Performance note**: Worst case is 30 days of lookups (for the max milestone). Each lookup is a localStorage read + a date conversion (~10ms total for 30 iterations). Well within the 100ms render budget.

## R2: "All Complete" Definition with Enabled Challenge Changes

**Decision**: For streak purposes, a day is "complete" if all challenges that are currently enabled have completion records for that date. We do NOT track which challenges were enabled on historical dates.

**Rationale**: Tracking per-day enabled sets would add significant storage complexity. The simpler approach (check current enabled set against historical completions) means:
- If you enable a new challenge, your streak may break (historical days won't have completions for it)
- If you disable a challenge, your streak may extend (fewer challenges to satisfy)
This is acceptable behavior — it's the simplest correct approach and matches user expectations ("I need to do all MY challenges every day").

**Alternatives considered**:
- Snapshot enabled challenges per day: Too complex for a single-user local app
- Only count challenges that existed on each historical day: Would require storing enabledDate ranges per challenge

## R3: Streak Stats Storage Key

**Decision**: Store streak stats under `miti:streak-stats` as a single JSON object containing `bestStreak`, `earnedBadges` (array of milestone IDs), and `seenCelebrations` (array of milestone IDs).

**Rationale**: All streak-related persistent data in one key avoids key proliferation. The data is small (< 200 bytes) and read/written infrequently.

**Alternatives considered**:
- Separate keys for best streak and badges: Unnecessary fragmentation
- Store in the existing `miti:settings` key: Violates separation of concerns

## R4: Today Checklist Placement

**Decision**: Insert the today checklist between the calendar header and the reminder banners (if any) or weekday headers. Use `insertAdjacentElement('afterend')` on `.calendar-header`, matching the existing reminder banner insertion pattern.

**Rationale**: This position is immediately visible, above the grid, and follows the established DOM insertion pattern from Feature 005 (reminder banners). The checklist renders as a self-contained `div` that doesn't interfere with the grid layout.

**Alternatives considered**:
- Place inside the sidebar: Too hidden, doesn't match user request for "top of month box"
- Replace the calendar header: Too disruptive to existing layout
- Place below the grid: Not prominent enough

## R5: Bidirectional Sync Between Checklist and Date Cell

**Decision**: When a challenge is toggled in the header checklist, call `toggleCompletion()` (same function used by date cells), then call `refreshChallengeIndicators()` to update the grid. When toggled in the date cell, re-render the header checklist.

**Rationale**: Both UI elements use the same underlying data (localStorage completions). Calling the existing toggle function + refreshing the other view keeps them in sync without adding a custom event system.

**Alternatives considered**:
- Custom event bus: Over-engineered for this use case
- MutationObserver on DOM: Fragile and indirect

## R6: Celebration Banner Behavior

**Decision**: Show celebration banner once per milestone achievement. Track which celebrations have been seen in `miti:streak-stats.seenCelebrations`. The banner appears at the top of the checklist area and can be dismissed.

**Rationale**: Repeating celebrations on every page load would be annoying. One-time display with persistence ensures the user sees it exactly once. If the streak breaks and is re-earned, the celebration shows again (since it's a new achievement).

**Alternatives considered**:
- Toast/popup notification: Too intrusive for a new-tab app
- Permanent banner: Wastes space after initial viewing

## R7: Previous Nepali Day Calculation

**Decision**: To get the previous Nepali day, convert to Gregorian, subtract 86400000ms (1 day), convert back to Nepali. This leverages the existing `convertNepaliToGregorian` and `convertGregorianToNepali` functions.

**Rationale**: The Nepali calendar has variable month lengths (29-32 days), making manual day subtraction error-prone. Converting through Gregorian delegates the complexity to the proven date converter library.

**Alternatives considered**:
- Manual Nepali day subtraction with month-length lookup tables: Duplicates logic already in the converter library
