# Data Model: 008-firebase-auth-sync

## Overview

This feature adds a sync layer on top of the existing localStorage model. No existing types are changed.
New types live in `src/auth/auth-types.ts` and `src/sync/sync-types.ts`.

---

## Existing Types (unchanged, synced to Firestore)

### Note (`src/notes/notes-types.ts`)
```typescript
interface Note {
  id: string;           // UUID v4 — used as stable identity across devices
  text: string;         // Max 5000 characters
  timestamp: number;    // Unix ms — last modified (used for conflict resolution)
  created: number;      // Unix ms
  modified: number;     // Unix ms — authoritative for last-write-wins
  completed?: boolean;  // Absent = false
}
```

### Challenge (`src/challenges/challenges-types.ts`)
```typescript
interface Challenge {
  id: string;
  name: string;
  icon: string;
  type: 'default' | 'custom';
  enabled: boolean;
  enabledDate: string;    // YYYY-MM-DD (BS)
  createdDate: string;    // YYYY-MM-DD (BS)
  order: number;
  reminderTime: ReminderTimeWindow;
}
```

### ChallengeCompletions (`src/challenges/challenges-types.ts`)
```typescript
type ChallengeCompletions = Record<string, boolean>; // challengeId → completed
```

---

## New Types

### AuthState (`src/auth/auth-types.ts`)
```typescript
interface AuthState {
  status: 'loading' | 'signed-out' | 'signed-in';
  user: AuthUser | null;
}

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'email';
}
```

### SyncStatus (`src/auth/auth-types.ts`)
```typescript
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncIndicatorState {
  status: SyncStatus;
  lastSyncedAt: number | null;  // Unix ms
  errorMessage?: string;
}
```

### Firestore Document Shapes (`src/sync/sync-types.ts`)
```typescript
// users/{uid}/notes/{YYYY-MM-DD}
interface FirestoreNotesDoc {
  notes: Note[];
  updatedAt: number;  // Unix ms — used for last-write-wins
}

// users/{uid}/challenges  (single document)
interface FirestoreChallengesDoc {
  challenges: Challenge[];
  updatedAt: number;
}

// users/{uid}/challenge-completions/{YYYY-MM-DD}
interface FirestoreCompletionsDoc {
  completions: ChallengeCompletions;
  updatedAt: number;
}
```

### SyncRecord (`src/sync/sync-types.ts`)
```typescript
// Tracks sync state per document to avoid redundant writes
interface SyncRecord {
  key: string;          // localStorage key (e.g., "miti:notes:2082-01-15")
  firestorePath: string; // Firestore path (e.g., "users/abc/notes/2082-01-15")
  localUpdatedAt: number;
  remoteUpdatedAt: number;
  status: 'pending' | 'synced' | 'conflict-resolved';
}
```

---

## Firestore Collection Structure

```
users/
  {uid}/                               # Document: user profile metadata
    displayName: string
    email: string
    createdAt: number                  # Unix ms

    notes/                             # Subcollection
      {YYYY-MM-DD}/                    # One doc per date that has notes
        notes: Note[]
        updatedAt: number

    challenges                         # Single document (not subcollection)
      challenges: Challenge[]
      updatedAt: number

    challenge-completions/             # Subcollection
      {YYYY-MM-DD}/                    # One doc per date that has completions
        completions: Record<string, boolean>
        updatedAt: number
```

---

## localStorage Keys — Sync Eligibility

| Key Pattern | Synced | Reason |
|-------------|--------|--------|
| `miti:notes:YYYY-MM-DD` | ✅ Yes | User content |
| `miti:challenges` | ✅ Yes | User configuration |
| `miti:challenge-completions:YYYY-MM-DD` | ✅ Yes | Completion data |
| `miti:settings` | ❌ No | Device-local preferences |
| `miti:holidays` | ❌ No | Public static data |
| `miti:streak-stats` | ❌ No | Derived — recomputed from completions |
| `miti:sync-initialized:{uid}` | ❌ No | Internal sync flag |

---

## State Transitions

### Auth Flow
```
[app load] → loading
             ├─ Firebase resolves signed-in  → signed-in  → trigger sync init
             └─ Firebase resolves signed-out → signed-out → offline-only mode
```

### Sync Flow (per document)
```
[write to localStorage]
  └─ if signed-in → enqueue sync
     ├─ online  → write to Firestore → synced
     └─ offline → queue in memory → retry on 'online' event
```

### First-Login Migration
```
[first sign-in with this uid]
  → read all syncable localStorage keys
  → for each key: compare local.updatedAt vs remote.updatedAt
    ├─ local newer or remote absent → batch write to Firestore
    └─ remote newer → pull to localStorage
  → set miti:sync-initialized:{uid} = "true"
  → start onSnapshot listeners
```
