# API Surface: localStorage ↔ Firestore Sync Mapping

## Sync Service Interface (`src/sync/sync-service.ts`)

All methods are no-ops (resolve immediately) when user is signed out.

### Initialization

```typescript
// Called once after sign-in (or app load if already signed in)
async function initSync(uid: string): Promise<void>
// → runs first-login migration if needed, attaches onSnapshot listeners

// Called on sign-out to clean up listeners
function teardownSync(): void
```

### Notes Sync

```typescript
// Push local notes for a date to Firestore (called after every local write)
async function pushNotes(nepaliDate: string, notes: Note[]): Promise<void>
// Firestore path: users/{uid}/notes/{nepaliDate}
// Payload: { notes: Note[], updatedAt: Date.now() }

// Pull remote notes for a date into localStorage (called by onSnapshot)
function applyRemoteNotes(nepaliDate: string, doc: FirestoreNotesDoc): void
// Writes to localStorage key: miti:notes:{nepaliDate}
// Only applies if doc.updatedAt > localNotes[maxModified]
```

### Challenges Sync

```typescript
// Push local challenges array to Firestore
async function pushChallenges(challenges: Challenge[]): Promise<void>
// Firestore path: users/{uid}/challenges
// Payload: { challenges: Challenge[], updatedAt: Date.now() }

// Apply remote challenges to localStorage
function applyRemoteChallenges(doc: FirestoreChallengesDoc): void
// Writes to localStorage key: miti:challenges
// Only applies if doc.updatedAt > max(challenges[].modified)
```

### Challenge Completions Sync

```typescript
// Push local completions for a date to Firestore
async function pushCompletions(nepaliDate: string, completions: ChallengeCompletions): Promise<void>
// Firestore path: users/{uid}/challenge-completions/{nepaliDate}
// Payload: { completions: ChallengeCompletions, updatedAt: Date.now() }

// Apply remote completions to localStorage
function applyRemoteCompletions(nepaliDate: string, doc: FirestoreCompletionsDoc): void
// Writes to localStorage key: miti:challenge-completions:{nepaliDate}
```

---

## localStorage Key → Firestore Path Mapping

| localStorage Key | Firestore Path | Document Shape |
|-----------------|----------------|----------------|
| `miti:notes:{date}` | `users/{uid}/notes/{date}` | `{ notes: Note[], updatedAt: number }` |
| `miti:challenges` | `users/{uid}/challenges` | `{ challenges: Challenge[], updatedAt: number }` |
| `miti:challenge-completions:{date}` | `users/{uid}/challenge-completions/{date}` | `{ completions: Record<string,boolean>, updatedAt: number }` |

---

## Auth Service Interface (`src/auth/auth-service.ts`)

```typescript
// Lazy-initialize Firebase (dynamic import) and return auth instance
async function getFirebaseAuth(): Promise<Auth>

// Sign in with Google popup
async function signInWithGoogle(): Promise<AuthUser>

// Sign in with email/password
async function signInWithEmail(email: string, password: string): Promise<AuthUser>

// Sign out
async function signOut(): Promise<void>

// Subscribe to auth state changes (returns unsubscribe fn)
function onAuthStateChange(callback: (state: AuthState) => void): () => void

// Get current auth state synchronously (reading from module-level var)
function getAuthState(): AuthState
```

---

## Sync Hook Points in Existing Storage Functions

These are the **only** changes to existing storage modules — they call into sync-service after every write:

| Existing Function | Hook Added |
|-------------------|------------|
| `notes-storage.addNote()` | `pushNotes(date, updatedNotes)` |
| `notes-storage.updateNote()` | `pushNotes(date, updatedNotes)` |
| `notes-storage.deleteNote()` | `pushNotes(date, updatedNotes)` |
| `notes-storage.toggleNoteCompletion()` | `pushNotes(date, updatedNotes)` |
| `notes-storage.deleteAllNotesForDate()` | `pushNotes(date, [])` |
| `challenges-storage.saveChallenges()` | `pushChallenges(challenges)` |
| `challenges-storage.saveCompletions()` | `pushCompletions(date, completions)` |

**Pattern** (non-blocking, fire-and-forget from UI perspective):
```typescript
export function addNote(nepaliDate: string, text: string): Note {
  // ... existing logic ...
  setItem(key, notes);
  // sync hook — does nothing if signed out
  pushNotes(nepaliDate, notes).catch(() => {/* sync errors are non-fatal */});
  return note;
}
```
