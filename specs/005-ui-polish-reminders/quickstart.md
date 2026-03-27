# Quickstart: UI Polish & Challenge Reminders

**Feature**: 005-ui-polish-reminders
**Date**: 2026-03-19

## Overview

This feature has two parts: (A) CSS layout fixes for the calendar UI, and (B) a challenge reminder system. Part A involves only CSS changes. Part B adds new TypeScript modules and extends existing ones.

## Part A: CSS Layout Fixes (no new files)

### A1. Fix navigation button positions

**File**: `src/styles/calendar.css`

Change `.calendar-header` to stop using `space-between` and make `.month-title` flex-grow:

```css
.calendar-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  /* REMOVED: justify-content: space-between; */
}

.month-title {
  flex: 1;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
```

### A2. Increase calendar grid size

**File**: `src/styles/calendar.css`

Replace fixed pixel heights with viewport-relative sizing:

```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  height: calc(100vh - 280px);  /* Subtract header, weekdays, padding, today btn */
  min-height: 400px;
  max-height: 640px;
}

/* Update max-width for larger calendar */
.calendar-container {
  max-width: 900px;  /* was 800px */
}
```

Update responsive breakpoints similarly.

### A3. Add gap between calendar and sidebar

**File**: `src/styles/sidebar.css`

```css
.app-container {
  gap: 1.5rem;  /* was 0 */
}
```

## Part B: Challenge Reminders

### B1. Extend Challenge type

**File**: `src/challenges/challenges-types.ts`

```typescript
export type ReminderTimeWindow = 'morning' | 'afternoon' | 'evening' | 'all-day' | 'none';

export interface Challenge {
  id: string;
  name: string;
  icon: string;
  type: ChallengeType;
  enabled: boolean;
  enabledDate: string;
  createdDate: string;
  order: number;
  reminderTime: ReminderTimeWindow;  // NEW
}
```

Update `createDefaultChallenges()` to set:
- `first-thing-water` → `reminderTime: 'morning'`
- `no-junk-food` → `reminderTime: 'evening'`
- `no-sugar` → `reminderTime: 'evening'`

### B2. Create reminder service

**New file**: `src/challenges/challenges-reminder.ts`

Core logic:
1. `isInReminderWindow(window)` — checks current hour against window ranges
2. `getActiveReminders()` — returns challenges needing reminders (enabled + incomplete + in-window + not-dismissed)
3. `dismissReminder(id)` / `isReminderDismissed(id)` — in-memory Set operations

### B3. Create reminder UI

**New file**: `src/challenges/challenges-reminder-ui.ts`

Renders banner(s) inside `.calendar-container`, inserted after `.calendar-header`:
- Each banner shows icon + name + "Complete" button + dismiss "×" button
- "Complete" toggles the challenge completion and removes the banner
- Dismiss adds to dismissed Set and removes the banner

**New CSS**: `src/styles/challenges.css` (append to existing file)

### B4. Add migration in storage

**File**: `src/challenges/challenges-storage.ts`

In `getChallenges()`, ensure all loaded challenges have `reminderTime`. If missing, assign defaults based on ID.

### B5. Add reminder time dropdown in settings

**File**: `src/settings/settings-modal.ts`

In the challenge list rendering, add a `<select>` dropdown for `reminderTime` next to each challenge's toggle.

### B6. Wire up in main.ts

**File**: `src/main.ts`

After `render()` is first called, call `renderReminders()` to show any active reminders on page load.

## Build & Test

```bash
npm run build            # Compile TypeScript + bundle
npm run build:extension  # Build Chrome extension to dist/
```

Manual testing checklist:
1. Navigate all 12 months — verify buttons don't move
2. Check calendar fits viewport on desktop/tablet/mobile
3. Verify gap between calendar and sidebar
4. Enable a challenge, set reminder to current time window, reload — verify reminder shows
5. Dismiss reminder — verify it doesn't reappear until next tab
6. Complete a challenge — verify reminder disappears and doesn't reappear
7. Change reminder time in settings — verify it takes effect on next load
