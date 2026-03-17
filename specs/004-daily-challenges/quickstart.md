# Quickstart: Daily Challenges

**Feature**: 004-daily-challenges
**Date**: 2026-03-17

## Prerequisites

- Node.js (for Vite dev server)
- npm (dependencies already installed)

## Development Setup

```bash
# Start dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## New Files to Create

| File | Purpose |
|------|---------|
| `src/challenges/challenges-types.ts` | Challenge and ChallengeCompletion interfaces, default challenge constants |
| `src/challenges/challenges-storage.ts` | localStorage CRUD for challenge definitions and completions |
| `src/challenges/challenges-ui.ts` | Render challenge indicators on date cells |
| `src/challenges/challenges-popover.ts` | Popover component for >4 challenges compact view |
| `src/styles/challenges.css` | All challenge-related styles |

## Existing Files to Modify

| File | Change |
|------|--------|
| `src/components/DateCell.ts` | Add a container div for challenge indicators within each cell |
| `src/components/CalendarGrid.ts` | Call challenge UI rendering after cell creation; pass date context |
| `src/settings/settings-modal.ts` | Add "Daily Challenges" section with toggles, add/edit/delete controls |
| `src/utils/storage-sync.ts` | Handle `miti:challenges` and `miti:challenge-completions:*` change events |
| `src/main.ts` | Initialize challenge system, register challenge change handlers |
| `src/styles/calendar.css` | Minor adjustments for challenge indicator spacing in date cells |

## Key Patterns to Follow

### Storage Pattern (from notes-storage.ts)

```typescript
// Challenge definitions — single key, like settings
const CHALLENGES_KEY = 'miti:challenges';

// Challenge completions — per-date keys, like notes
function getCompletionKey(nepaliDate: string): string {
  return `miti:challenge-completions:${nepaliDate}`;
}
```

### UI Integration Pattern (from CalendarGrid.ts)

Challenge indicators are added after the base cell is created, similar to how `addNotesIndicator()` and holiday elements are added:

```typescript
// In renderCalendarGrid(), after existing cell setup:
addChallengeIndicators(cellElement, nepaliDateString, cell.isToday);
```

### Click Target Isolation

Challenge indicators use `stopPropagation()` to prevent the date cell's notes-modal click handler from firing:

```typescript
indicator.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleChallengeCompletion(challengeId, nepaliDate);
});
```

### Settings Section Pattern (from settings-modal.ts)

New sections follow the existing pattern of creating a container div with a heading, then appending form controls:

```typescript
// Create section
const section = document.createElement('div');
section.className = 'settings-section';
// Add heading, toggle controls, add button
```

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `miti:challenges` | `Challenge[]` | Array of all challenge definitions (default + custom) |
| `miti:challenge-completions:YYYY-MM-DD` | `Record<string, boolean>` | Completion status per challenge for a given Nepali date |

## Testing Checklist

1. Enable a default challenge in settings → verify indicator appears on today's cell
2. Click challenge indicator on today → verify toggle and persistence after reload
3. Click elsewhere on date cell → verify notes modal still opens (not intercepted)
4. Navigate to past month → verify challenge indicators are read-only
5. Add custom challenge → verify it appears on calendar and in settings
6. Delete custom challenge → verify confirmation prompt and data removal
7. Enable 5+ challenges → verify compact summary "3/5" badge appears
8. Click compact summary → verify popover opens with all challenges
9. Disable all challenges → verify calendar looks identical to before feature
10. Open in two tabs → verify changes sync between tabs
