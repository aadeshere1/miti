# Quickstart: Challenge Streaks & Rewards

**Feature**: 006-challenge-streaks-rewards
**Date**: 2026-03-19

## Overview

This feature adds two things: (A) a prominent today challenge checklist above the calendar grid, and (B) a streak tracking + milestone reward system with motivational quotes and badges.

## Part A: Today Challenge Checklist

### A1. Create streak service

**New file**: `src/challenges/challenges-streak.ts`

Core logic:
1. `calculateCurrentStreak()` — walks backward from today through consecutive Nepali dates checking if all enabled challenges were completed
2. `getStreakStats()` / `saveStreakStats()` — read/write `miti:streak-stats` from localStorage
3. `getNextMilestone()` — returns the next unachieved milestone
4. `getNewlyAchievedMilestones()` — returns milestones reached but not yet celebrated

### A2. Add streak types

**File**: `src/challenges/challenges-types.ts`

```typescript
// Streak stats persisted in localStorage
export interface StreakStats {
  bestStreak: number;
  earnedBadges: string[];
  seenCelebrations: string[];
}

// Milestone definition (constant)
export interface Milestone {
  id: string;
  days: number;
  badgeName: string;
  badgeIcon: string;
  quote: string;
}

export const STREAK_STATS_KEY = 'miti:streak-stats';

export const MILESTONES: Milestone[] = [
  { id: '3-day', days: 3, badgeName: 'Starter', badgeIcon: '🌱', quote: 'The secret of getting ahead is getting started.' },
  { id: '7-day', days: 7, badgeName: 'Dedicated', badgeIcon: '💪', quote: 'Success is the sum of small efforts repeated day in and day out.' },
  { id: '15-day', days: 15, badgeName: 'Champion', badgeIcon: '🏆', quote: 'Champions keep playing until they get it right.' },
  { id: '30-day', days: 30, badgeName: 'Legend', badgeIcon: '🌟', quote: 'A month of consistency is the foundation of lasting change.' },
];
```

### A3. Create today checklist UI

**New file**: `src/challenges/challenges-today-ui.ts`

Renders a checklist area inside `.calendar-container`, after `.calendar-header` and any reminder banners:
- Shows streak count (e.g., "🔥 5 day streak") and best streak
- Shows earned/locked badge icons
- Shows "next milestone" progress text
- Lists each enabled challenge with checkbox, icon, name
- Toggling a checkbox calls `toggleCompletion()`, refreshes date cell indicators, and recalculates streak

### A4. Wire up in main.ts

**File**: `src/main.ts`

- Import and call `renderTodayChecklist()` in `init()` after `render()`
- Call `refreshTodayChecklist()` within `render()` so checkbox states sync when calendar re-renders

## Part B: Celebration Banners

### B1. Celebration display

In `challenges-today-ui.ts`, after calculating the streak and updating stats, check for newly achieved milestones. If found, render a celebration banner above the checklist.

### B2. Celebration banner structure

```html
<div class="celebration-banner" data-milestone-id="3-day">
  <span class="celebration-badge">🌱</span>
  <div class="celebration-content">
    <strong>Starter Badge Earned!</strong>
    <p>"The secret of getting ahead is getting started."</p>
  </div>
  <button class="celebration-dismiss">&times;</button>
</div>
```

Dismiss button adds the milestone ID to `seenCelebrations` in streak stats and removes the banner.

## Part C: CSS Styles

**File**: `src/styles/challenges.css`

Add styles for:
- `.today-checklist` — container with subtle background, rounded corners, padding
- `.streak-info` — flex row with streak count, best, next milestone
- `.streak-badges` — flex row of badge icons (earned vs locked opacity)
- `.today-challenge-list` — list of challenge items with checkboxes
- `.celebration-banner` — celebratory styled banner with badge icon
- Dark theme and image theme variants

## Part D: Bidirectional Sync

When challenge is toggled in the today checklist:
1. Call `toggleCompletion(challengeId, todayNepali)`
2. Call `refreshChallengeIndicators()` to update date cell
3. Recalculate streak and update display

When challenge is toggled in date cell (existing click handler in `challenges-ui.ts`):
1. Existing `toggleCompletion()` call handles storage
2. Call `refreshTodayChecklist()` to update the header checklist

## Build & Test

```bash
npm run build            # Compile TypeScript + bundle
npm run build:extension  # Build Chrome extension to dist/
```

Manual testing checklist:
1. Enable 2-3 challenges, verify checklist appears above grid
2. Toggle a challenge in checklist — verify date cell updates
3. Toggle a challenge in date cell — verify checklist updates
4. Verify streak count shows correctly
5. Set up 3-day completion data in localStorage, reload — verify "Starter" celebration
6. Dismiss celebration — verify it doesn't reappear
7. Verify next milestone progress indicator
8. Verify badges persist after streak breaks
9. Check dark theme rendering
10. Check image theme rendering
11. Navigate to different month — verify checklist still shows
12. Disable all challenges — verify checklist area hidden
