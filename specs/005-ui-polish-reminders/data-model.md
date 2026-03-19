# Data Model: UI Polish & Challenge Reminders

**Feature**: 005-ui-polish-reminders
**Date**: 2026-03-19

## Entity Changes

### Challenge (extended)

The existing `Challenge` entity gains one new field:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `reminderTime` | `ReminderTimeWindow` | Varies by challenge | When to show reminders for this challenge |

**Default values by challenge**:
- `first-thing-water` → `'morning'`
- `no-junk-food` → `'evening'`
- `no-sugar` → `'evening'`
- Custom challenges → `'all-day'`

### ReminderTimeWindow (new type)

A union type representing predefined time-of-day windows:

| Value | Hour Range | Description |
|-------|-----------|-------------|
| `'morning'` | 05:00 – 09:59 | Hours 5–9 inclusive |
| `'afternoon'` | 11:00 – 15:59 | Hours 11–15 inclusive |
| `'evening'` | 17:00 – 21:59 | Hours 17–21 inclusive |
| `'all-day'` | 00:00 – 23:59 | Always active |
| `'none'` | — | Never triggers |

### ReminderDismissal (runtime only)

In-memory state, NOT persisted. Reset on every page load.

| Field | Type | Description |
|-------|------|-------------|
| Dismissed challenge IDs | `Set<string>` | Challenge IDs dismissed in the current session |

## Storage Schema

### Existing key (modified)

**Key**: `miti:challenges`
**Value**: `Challenge[]` (JSON array)

The `Challenge` objects in this array now include the `reminderTime` field. Backward compatibility: if `reminderTime` is missing (data from before this feature), default to `'all-day'` for custom and type-specific defaults for built-in challenges.

### No new storage keys

Reminder dismissal is in-memory only. No new localStorage keys are introduced.

## Migration

When loading challenges from localStorage:
- If a `Challenge` object lacks `reminderTime`, assign the default based on its `id`:
  - `'first-thing-water'` → `'morning'`
  - `'no-junk-food'` → `'evening'`
  - `'no-sugar'` → `'evening'`
  - All others → `'all-day'`
- This migration is transparent — it happens on read, and the next write persists the field.
