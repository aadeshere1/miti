# Data Model: Note Completion & Today Highlight

**Feature**: 001-note-complete-today
**Date**: 2026-04-12

---

## Modified Entity: Note

**File**: `src/notes/notes-types.ts`

**Change**: Add optional `completed` field.

```
Note {
  id:        string    // UUID v4 — immutable after creation
  text:      string    // 1–5000 characters; trimmed on save
  timestamp: number    // Unix ms — last modified (legacy field, kept for compatibility)
  created:   number    // Unix ms — set once on creation
  modified:  number    // Unix ms — updated on text change or completion toggle
  completed: boolean   // NEW — default: false (absent = false for legacy notes)
}
```

**Backwards compatibility**: Legacy notes stored without `completed` field are treated as `completed: false` — no migration required.

**State transitions**:
```
note created   → completed: false (default)
user toggles   → completed: true  (modified timestamp updated)
user toggles   → completed: false (modified timestamp updated)
note deleted   → entry removed; completion state gone with it
all notes gone → storage key removed; no orphaned state
```

---

## Derived State: Date Cell Completion Status

Computed at render time from the notes array for a given date. Not stored separately.

```
DateCompletionStatus {
  hasNotes:          boolean   // any notes exist
  hasCompletedNotes: boolean   // at least one note has completed: true
  allNotesCompleted: boolean   // all notes have completed: true (and hasNotes is true)
}
```

**CSS class mapping applied to `.date-cell`**:

| State                          | CSS class added         |
|-------------------------------|-------------------------|
| Has notes, none completed      | `has-notes`             |
| Has notes, some completed      | `has-notes has-completed-notes` |
| Has notes, all completed       | `has-notes all-notes-completed` |
| No notes                       | (no note class)         |

---

## Storage: No Schema Change

Storage key format unchanged: `miti:notes:YYYY-MM-DD` (Nepali BS)

Value: `Note[]` JSON array — backwards compatible because `completed` is optional.

---

## Validation Rules

| Field       | Rule                                                  |
|-------------|-------------------------------------------------------|
| `completed` | Must be boolean; defaults to `false` if absent        |
| `modified`  | Updated to `Date.now()` whenever completion is toggled |

---

## Today Indicator

Not stored. Derived at render time by comparing system clock date to each calendar cell's Gregorian date using the existing `isSameDay()` utility. No data model change required.
