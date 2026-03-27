# Data Model: Challenge Streaks & Rewards

**Feature**: 006-challenge-streaks-rewards
**Date**: 2026-03-19

## Entities

### StreakStats (NEW — persisted)

Stored under `miti:streak-stats` in localStorage.

```typescript
interface StreakStats {
  bestStreak: number;           // Highest streak ever achieved
  earnedBadges: string[];       // Milestone IDs earned (e.g., ['3-day', '7-day'])
  seenCelebrations: string[];   // Milestone IDs whose celebration was shown
}
```

**Default value** (first access):
```json
{
  "bestStreak": 0,
  "earnedBadges": [],
  "seenCelebrations": []
}
```

### Milestone (constant — not stored)

Hardcoded milestone definitions.

```typescript
interface Milestone {
  id: string;           // e.g., '3-day', '7-day', '15-day', '30-day'
  days: number;         // Streak threshold (3, 7, 15, 30)
  badgeName: string;    // Display name (e.g., 'Starter', 'Dedicated', 'Champion', 'Legend')
  badgeIcon: string;    // Emoji icon
  quote: string;        // Motivational quote
}
```

**Milestone definitions**:

| ID | Days | Badge Name | Icon | Quote |
|----|------|-----------|------|-------|
| `3-day` | 3 | Starter | 🌱 | "The secret of getting ahead is getting started." |
| `7-day` | 7 | Dedicated | 💪 | "Success is the sum of small efforts repeated day in and day out." |
| `15-day` | 15 | Champion | 🏆 | "Champions keep playing until they get it right." |
| `30-day` | 30 | Legend | 🌟 | "A month of consistency is the foundation of lasting change." |

### Existing Entities (unchanged)

- **Challenge**: No changes. Uses existing `Challenge` interface with `id`, `name`, `icon`, `type`, `enabled`, `enabledDate`, `createdDate`, `order`, `reminderTime`.
- **ChallengeCompletions**: No changes. `Record<string, boolean>` stored per Nepali date under `miti:challenge-completions:YYYY-MM-DD`.

## Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `miti:streak-stats` | NEW | StreakStats JSON object |
| `miti:challenges` | EXISTING | Challenge definitions array |
| `miti:challenge-completions:YYYY-MM-DD` | EXISTING | Daily completion records |

## Relationships

```text
Challenge (enabled) ──┐
                      ├──▶ ChallengeCompletions (per date) ──▶ Streak calculation
Challenge (enabled) ──┘                                              │
                                                                     ▼
                                                              StreakStats (persisted)
                                                                     │
                                                                     ▼
                                                              Milestone (constant)
                                                                     │
                                                                     ▼
                                                              Badge (earned/seen)
```

## State Transitions

### Streak State

```text
                ┌─────────────┐
                │  streak = 0 │
                │  (no history)│
                └──────┬──────┘
                       │ User completes all challenges today
                       ▼
                ┌─────────────┐
                │  streak = 1 │
                └──────┬──────┘
                       │ Completes next day
                       ▼
                ┌─────────────┐
                │  streak = N │◀────── Increments daily
                └──────┬──────┘
                       │ Misses a day
                       ▼
                ┌─────────────┐
                │  streak = 0 │ (bestStreak preserved)
                └─────────────┘
```

### Milestone Achievement

```text
streak reaches milestone.days
        │
        ▼
┌───────────────────┐    already in      ┌─────────────┐
│ Check earnedBadges│──earnedBadges──▶   │  Skip badge  │
└───────┬───────────┘                    └─────────────┘
        │ NOT in earnedBadges
        ▼
┌───────────────────┐
│ Add to earnedBadges│
│ Check seenCelebration│
└───────┬───────────┘
        │ NOT in seenCelebrations
        ▼
┌───────────────────┐
│ Show celebration   │
│ Add to seenCelebrations│
└───────────────────┘
```
