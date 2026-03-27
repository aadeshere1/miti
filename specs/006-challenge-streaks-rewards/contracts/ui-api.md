# UI Contracts: Challenge Streaks & Rewards

**Feature**: 006-challenge-streaks-rewards
**Date**: 2026-03-19

## TypeScript API Contracts

### Streak Service (new file: `src/challenges/challenges-streak.ts`)

```typescript
/**
 * Calculate the current streak — consecutive days ending today or yesterday
 * where ALL enabled challenges were completed.
 * @returns Current streak count (0 if no streak)
 */
function calculateCurrentStreak(): number;

/**
 * Get the persisted streak stats (best streak, earned badges, seen celebrations).
 * Initializes defaults on first access.
 */
function getStreakStats(): StreakStats;

/**
 * Save updated streak stats to localStorage.
 */
function saveStreakStats(stats: StreakStats): void;

/**
 * Get the next milestone the user hasn't reached yet.
 * @param currentStreak - The current streak count
 * @returns The next milestone, or null if all milestones achieved
 */
function getNextMilestone(currentStreak: number): Milestone | null;

/**
 * Get all milestones that the user has newly reached (earned but not yet celebrated).
 * @param currentStreak - The current streak count
 * @param stats - Current streak stats
 * @returns Array of newly achieved milestones
 */
function getNewlyAchievedMilestones(currentStreak: number, stats: StreakStats): Milestone[];

/**
 * Check all milestones the user has earned (based on streak history).
 * @param currentStreak - The current streak count
 * @param stats - Current streak stats
 * @returns Updated stats with any new badges
 */
function updateStreakStats(currentStreak: number, stats: StreakStats): StreakStats;
```

### Streak Types (in `src/challenges/challenges-types.ts`)

```typescript
interface StreakStats {
  bestStreak: number;
  earnedBadges: string[];
  seenCelebrations: string[];
}

interface Milestone {
  id: string;
  days: number;
  badgeName: string;
  badgeIcon: string;
  quote: string;
}
```

### Today Checklist UI (new file: `src/challenges/challenges-today-ui.ts`)

```typescript
/**
 * Render the today challenge checklist above the calendar grid.
 * Shows each enabled challenge with checkbox, icon, name.
 * Shows streak count and next milestone progress.
 * Includes earned badges display.
 */
function renderTodayChecklist(): void;

/**
 * Remove the today checklist from the DOM.
 */
function clearTodayChecklist(): void;

/**
 * Refresh the today checklist state (checkbox states, streak count)
 * without rebuilding the entire DOM structure.
 */
function refreshTodayChecklist(): void;
```

### Celebration Banner UI (in `src/challenges/challenges-today-ui.ts`)

```typescript
/**
 * Show a celebration banner for a newly achieved milestone.
 * @param milestone - The milestone to celebrate
 */
function showCelebrationBanner(milestone: Milestone): void;

/**
 * Dismiss a celebration banner.
 * @param milestoneId - The milestone whose banner to dismiss
 */
function dismissCelebration(milestoneId: string): void;
```

## HTML Structure Contracts

### Today Checklist

```html
<div class="today-checklist">
  <!-- Streak info row -->
  <div class="streak-info">
    <span class="streak-count">🔥 5 day streak</span>
    <span class="streak-best">Best: 12</span>
    <span class="streak-next">2 more to 7-day streak!</span>
  </div>

  <!-- Earned badges row (only shown if badges earned) -->
  <div class="streak-badges">
    <span class="streak-badge earned" title="Starter - 3 day streak">🌱</span>
    <span class="streak-badge locked" title="Dedicated - 7 day streak">💪</span>
    <span class="streak-badge locked" title="Champion - 15 day streak">🏆</span>
    <span class="streak-badge locked" title="Legend - 30 day streak">🌟</span>
  </div>

  <!-- Challenge items -->
  <div class="today-challenge-list">
    <label class="today-challenge-item">
      <input type="checkbox" class="today-challenge-checkbox" data-challenge-id="{id}" />
      <span class="today-challenge-icon">{icon}</span>
      <span class="today-challenge-name">{name}</span>
    </label>
    <!-- Repeat for each enabled challenge -->
  </div>
</div>
```

### Celebration Banner

```html
<div class="celebration-banner" data-milestone-id="{id}">
  <span class="celebration-badge">{badgeIcon}</span>
  <div class="celebration-content">
    <strong class="celebration-title">{badgeName} Badge Earned!</strong>
    <p class="celebration-quote">"{quote}"</p>
  </div>
  <button class="celebration-dismiss" title="Dismiss">&times;</button>
</div>
```

## CSS Class Contracts

### Today Checklist Styles (in `src/styles/challenges.css`)

```css
.today-checklist { }
.streak-info { }
.streak-count { }
.streak-best { }
.streak-next { }
.streak-badges { }
.streak-badge { }
.streak-badge.earned { }
.streak-badge.locked { }
.today-challenge-list { }
.today-challenge-item { }
.today-challenge-checkbox { }
.today-challenge-icon { }
.today-challenge-name { }
```

### Celebration Banner Styles

```css
.celebration-banner { }
.celebration-badge { }
.celebration-content { }
.celebration-title { }
.celebration-quote { }
.celebration-dismiss { }
.celebration-banner.dismissing { }
```

### Theme Variants

```css
.calendar-container.dark-theme .today-checklist { }
.calendar-container.dark-theme .celebration-banner { }
.calendar-container.image-theme .today-checklist { }
.calendar-container.image-theme .celebration-banner { }
```

## DOM Insertion Point

The today checklist is inserted into `.calendar-container` after `.calendar-header` and after any `.challenge-reminder-banner` elements:

```
.calendar-container
  ├── .calendar-header
  ├── .challenge-reminder-banner (0 or more, from Feature 005)
  ├── .today-checklist          ← NEW (inserted here)
  ├── .weekday-headers
  ├── .calendar-grid
  └── .today-button
```

**Insertion logic**: Find the last `.challenge-reminder-banner` element (if any) and insert after it. If no reminder banners exist, insert after `.calendar-header`.
