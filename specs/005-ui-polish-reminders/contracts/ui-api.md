# UI Contracts: UI Polish & Challenge Reminders

**Feature**: 005-ui-polish-reminders
**Date**: 2026-03-19

## CSS Layout Contracts

### Calendar Header (fixed buttons)

```css
.calendar-header {
  display: flex;
  align-items: center;
  /* Remove justify-content: space-between */
}

.month-title {
  flex: 1;
  text-align: center;
  /* Title absorbs variable width; buttons stay fixed */
}
```

**Invariant**: `.nav-button` elements maintain identical `offsetLeft` across all 12 Nepali months.

### Calendar Grid (viewport-aware sizing)

```css
.calendar-grid {
  /* Replace fixed pixel heights with viewport-relative sizing */
  height: calc(100vh - <non-grid-elements>);
  max-height: 640px;  /* Cap for very tall screens */
  min-height: 400px;  /* Floor for readability */
}
```

**Invariant**: The full calendar (header + weekdays + grid + Today button) fits within `100vh` without vertical scrollbar.

### App Container (gap)

```css
.app-container {
  gap: 1.5rem;  /* Currently 0 — adds separation between calendar and sidebar */
}
```

**Invariant**: A minimum of 16px gap exists between calendar container and notes sidebar in all layout modes.

## TypeScript API Contracts

### ReminderTimeWindow type

```typescript
// In challenges-types.ts
export type ReminderTimeWindow = 'morning' | 'afternoon' | 'evening' | 'all-day' | 'none';
```

### Challenge interface extension

```typescript
// In challenges-types.ts — add to existing Challenge interface
export interface Challenge {
  // ... existing fields ...
  reminderTime: ReminderTimeWindow;  // NEW
}
```

### Reminder service functions

```typescript
// In challenges/challenges-reminder.ts (new file)

/**
 * Check if the current time falls within a reminder window.
 * @param window - The reminder time window to check
 * @returns true if current local time is within the window
 */
function isInReminderWindow(window: ReminderTimeWindow): boolean;

/**
 * Get all challenges that should display a reminder right now.
 * Filters by: enabled, incomplete today, within reminder window, not dismissed.
 * @returns Array of challenges needing reminders
 */
function getActiveReminders(): Challenge[];

/**
 * Dismiss a challenge's reminder for the current session.
 * @param challengeId - The challenge to dismiss
 */
function dismissReminder(challengeId: string): void;

/**
 * Check if a challenge's reminder has been dismissed this session.
 * @param challengeId - The challenge to check
 * @returns true if dismissed
 */
function isReminderDismissed(challengeId: string): boolean;
```

### Reminder UI functions

```typescript
// In challenges/challenges-reminder-ui.ts (new file)

/**
 * Render reminder banners for all active reminders.
 * Inserts banner elements into the calendar container, between header and weekday row.
 */
function renderReminders(): void;

/**
 * Remove all reminder banners from the DOM.
 */
function clearReminders(): void;

/**
 * Remove a specific reminder banner (on dismiss).
 * @param challengeId - The challenge whose banner to remove
 */
function removeReminderBanner(challengeId: string): void;
```

### Migration function

```typescript
// In challenges/challenges-storage.ts — update getChallenges()

/**
 * Ensure all challenges have a reminderTime field.
 * Applies defaults based on challenge ID for backward compatibility.
 */
function migrateReminderTime(challenge: Challenge): Challenge;
```

## Reminder Banner HTML Structure

```html
<div class="challenge-reminder-banner" data-challenge-id="{id}">
  <span class="reminder-icon">{icon}</span>
  <span class="reminder-text">Time to check: {name}</span>
  <div class="reminder-actions">
    <button class="reminder-complete-btn" title="Mark as done">Complete</button>
    <button class="reminder-dismiss-btn" title="Dismiss">&times;</button>
  </div>
</div>
```

## Settings Modal Extension

The existing challenge list in the settings modal adds a reminder time dropdown for each challenge:

```html
<!-- Added next to each challenge's enable/disable toggle -->
<select class="reminder-time-select" data-challenge-id="{id}">
  <option value="morning">Morning (5-10 AM)</option>
  <option value="afternoon">Afternoon (11 AM-4 PM)</option>
  <option value="evening">Evening (5-10 PM)</option>
  <option value="all-day">All Day</option>
  <option value="none">No Reminder</option>
</select>
```
