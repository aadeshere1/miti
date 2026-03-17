# Data Model: Daily Challenges

**Feature**: 004-daily-challenges
**Date**: 2026-03-17

## Entities

### Challenge

Represents a trackable daily challenge definition.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | string | Required, unique | Fixed string for defaults (`no-junk-food`, `first-thing-water`, `no-sugar`); UUID v4 for custom challenges |
| `name` | string | Required, 1-30 characters | Display name (e.g., "No Junk Food") |
| `icon` | string | Required, single emoji | Visual indicator shown on calendar cells |
| `type` | `'default' \| 'custom'` | Required | Determines if challenge can be deleted |
| `enabled` | boolean | Required | Whether challenge appears on the calendar |
| `enabledDate` | string | Required, format YYYY-MM-DD (Nepali) | Date from which challenge indicators should appear; updated on each re-enable |
| `createdDate` | string | Required, format YYYY-MM-DD (Nepali) | Date the challenge was created (immutable after creation) |
| `order` | number | Required, >= 0 | Display order in settings and on calendar |

**Identity Rule**: `id` is the primary key. Default challenge IDs are hardcoded constants. Custom challenge IDs are generated via `generateUUID()` from `src/utils/uuid.ts`.

**Lifecycle**:
- Default challenges: Created at app initialization if not present → Enabled/Disabled → Cannot be deleted
- Custom challenges: Created by user → Enabled/Disabled → Edited → Deleted (with confirmation)

### Challenge Completion

Represents the completion status of challenges for a specific date.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `challengeId` | string | Required, references Challenge.id | Which challenge this completion is for |
| `completed` | boolean | Required | Whether the challenge was completed on this date |

**Storage Format**: Completions are stored as a flat object per date, keyed by challenge ID:

```json
{
  "no-junk-food": true,
  "first-thing-water": true,
  "no-sugar": false,
  "a1b2c3d4-...": true
}
```

**Identity Rule**: Composite key of (date, challengeId). A missing key for a challenge on a given date means "not interacted with" (treated as incomplete).

**Lifecycle**:
- Created: When user toggles a challenge for the first time on a given date
- Updated: When user toggles completion status (today only)
- Read-only: Past dates cannot be modified
- Deleted: Only when the parent Challenge is deleted (cascade delete)

## Storage Keys

| Key Pattern | Content | Example |
|-------------|---------|---------|
| `miti:challenges` | Array of Challenge objects | `[{id: "no-junk-food", name: "No Junk Food", ...}]` |
| `miti:challenge-completions:YYYY-MM-DD` | Object mapping challenge IDs to booleans | `{"no-junk-food": true}` |

## Default Challenges

These are initialized on first access if `miti:challenges` key does not exist:

| ID | Name | Icon | Order |
|----|------|------|-------|
| `no-junk-food` | No Junk Food | 🍔 | 0 |
| `first-thing-water` | First Thing Water | 💧 | 1 |
| `no-sugar` | No Sugar | 🍬 | 2 |

All defaults start with `enabled: false`, `type: 'default'`, `enabledDate` and `createdDate` set to the current Nepali date at initialization.

## Relationships

```text
Challenge (1) ──── (0..*) Challenge Completion
   │                         │
   │ id ◄────────────────── challengeId
   │                         │
   │                    Stored per date key:
   │                    miti:challenge-completions:YYYY-MM-DD
   │
   Stored in:
   miti:challenges
```

## Validation Rules

1. **Challenge name**: 1-30 characters, trimmed, non-empty after trim
2. **Challenge icon**: Must be a single emoji character (or emoji sequence)
3. **Max challenges**: Total challenge count (default + custom, regardless of enabled status) must not exceed 10
4. **Duplicate names**: Allowed (users may want similar challenges)
5. **Completion toggle**: Only allowed for today's date (Nepali calendar)
6. **Enable date**: Automatically set to current Nepali date when challenge is enabled; completions before this date are not displayed
7. **Delete cascade**: Deleting a custom challenge removes all `miti:challenge-completions:*` entries for that challenge ID

## Storage Size Estimates

- **Challenge definitions** (`miti:challenges`): ~150 bytes per challenge × 10 max = ~1.5 KB
- **Daily completions** (`miti:challenge-completions:YYYY-MM-DD`): ~80 bytes per day (10 challenges)
- **Annual completions**: ~80 × 365 = ~29 KB per year
- **5-year projection**: ~145 KB total (well within 5MB localStorage budget)
