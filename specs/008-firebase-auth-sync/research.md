# Research: 008-firebase-auth-sync

All NEEDS CLARIFICATION items from Technical Context resolved below.

---

## Decision 1: Firebase SDK Version & Bundle Impact

**Decision**: Use Firebase modular SDK v10+ with dynamic `import()` (lazy-loaded on sign-in)

**Rationale**:
- Modular SDK enables tree-shaking; only `firebase/app`, `firebase/auth`, `firebase/firestore` needed
- Estimated gzipped sizes: `firebase/app` ~2KB, `firebase/auth` ~40KB, `firebase/firestore` ~70KB → ~112KB total
- With lazy loading via `await import('firebase/app')`, Firebase is excluded from the initial bundle
- Current initial bundle: ~16KB gzipped — stays unchanged
- Firebase chunk loads only when user clicks "Sign In" — acceptable UX trade-off
- Constitution bundle limit (<200KB gzipped) applies to initial load; lazy chunk is separate

**Alternatives considered**:
- **Compat SDK**: ~200-250KB gzipped, no tree-shaking — rejected
- **Firebase loaded at startup**: Adds ~112KB to initial bundle (total ~128KB, still under 200KB) but penalizes all offline users — rejected; lazy is better for offline-first
- **Supabase**: Similar bundle size, requires different infrastructure, user doesn't use it elsewhere — rejected
- **Custom REST backend**: No offline persistence, much more code — rejected

---

## Decision 2: What Data to Sync

**Decision**: Sync notes, challenge definitions, and challenge completions. Do NOT sync settings, holidays, or streak-stats.

**Rationale**:
- `miti:notes:YYYY-MM-DD` → user-created content, primary sync target
- `miti:challenges` → user-configured challenge list; should follow user across sessions
- `miti:challenge-completions:YYYY-MM-DD` → completion data drives streaks; must sync for accurate streaks on new devices
- `miti:settings` → intentionally device-local (e.g., sidebar position may differ per device)
- `miti:holidays` → public static data bundled with the app; no sync needed
- `miti:streak-stats` → derived data (badges earned, best streak) recalculated from completions; sync completions instead

**Alternatives considered**:
- Sync settings: Rejected — layout preferences are device-specific; sync would cause jarring layout changes
- Sync holidays: Rejected — static public data, already bundled
- Sync streak-stats: Rejected — can be recomputed from synced completions; avoids stale badge state

---

## Decision 3: Firestore Data Structure

**Decision**: Subcollections under `users/{uid}/` with one document per date for notes and completions

```
users/{uid}/
  notes/{YYYY-MM-DD}          → { notes: Note[], updatedAt: Timestamp }
  challenges                  → { challenges: Challenge[], updatedAt: Timestamp }  (single doc)
  challenge-completions/{YYYY-MM-DD} → { completions: Record<string,boolean>, updatedAt: Timestamp }
```

**Rationale**:
- Mirrors existing localStorage key structure exactly — simplifies sync mapping
- One document per date for notes/completions (not per note/completion) keeps document count low
- `updatedAt` on each document enables simple last-write-wins conflict resolution
- Subcollection pattern scales if more user data types are added later
- All reads/writes are scoped to a single user document tree → clean security rules

**Alternatives considered**:
- Flat collection `userNotes/{uid}_YYYY-MM-DD`: Harder to secure (rules need to parse document IDs) — rejected
- Storing each `Note` as its own Firestore document: Higher read costs, complex merge logic — rejected

---

## Decision 4: Conflict Resolution Strategy

**Decision**: Last-write-wins using `updatedAt` timestamps (millisecond precision)

**Rationale**:
- Notes and completions are edited by one user at a time (personal app)
- Timestamp comparison handles the common case: user edits on device A, then opens device B
- Implementation is simple and auditable
- The `modified` field already exists on `Note` type — use it as the authoritative timestamp

**Algorithm on sync**:
1. Local `modified` > remote `updatedAt` → push local to Firestore
2. Remote `updatedAt` > local `modified` → pull remote to localStorage
3. Equal → no-op

**Alternatives considered**:
- CRDT (operational transform): Overkill for personal notes app, significant complexity — rejected
- Manual merge UI: Poor UX for what should be automatic — rejected

---

## Decision 5: First-Login Data Migration

**Decision**: On first sign-in, upload all existing localStorage data to Firestore using batch writes; mark sync as initialized in localStorage under `miti:sync-initialized:{uid}`

**Rationale**:
- Users who have been using the app offline should not lose their data on first sign-in
- Batch write is atomic (max 500 ops per batch; typical users have <30 days of data)
- `miti:sync-initialized:{uid}` flag prevents re-uploading on subsequent sign-ins
- If Firestore already has data (user signed in on another device first), last-write-wins applies per document

**Migration steps**:
1. Read all `miti:notes:*` keys from localStorage
2. Read `miti:challenges` from localStorage
3. Read all `miti:challenge-completions:*` keys from localStorage
4. Compare each against Firestore (fetch once)
5. Write new/newer local docs to Firestore in a batch
6. Pull any newer remote docs back to localStorage
7. Set `miti:sync-initialized:{uid}` = `"true"`

---

## Decision 6: Auth Methods

**Decision**: Google Sign-In (popup) as primary method; email/password as secondary

**Rationale**:
- Google Sign-In is frictionless (no password management) and widely trusted
- Email/password as fallback for users without Google accounts
- No phone auth, anonymous auth, or SSO needed for a personal calendar app
- `signInWithPopup` works on all target browsers (no redirect issues for SPAs)

**Alternatives considered**:
- `signInWithRedirect`: Causes page reload, breaks SPA state — rejected for primary flow
- Anonymous auth + upgrade: Adds complexity, unclear UX — rejected

---

## Decision 7: Real-Time Sync vs. On-Demand Sync

**Decision**: Real-time `onSnapshot` listeners for active session; sync-on-focus for background refresh

**Rationale**:
- `onSnapshot` keeps notes/completions live while user is on the page — changes from another tab/device appear immediately
- On-demand sync (fetch on page focus) handles the case where `onSnapshot` missed updates during offline period
- Unsubscribe listeners on sign-out to prevent memory leaks

**Offline behavior**:
- Firestore IndexedDB persistence is NOT enabled — localStorage is the offline store
- When offline, writes go to localStorage only; on reconnect, the sync layer pushes to Firestore
- `window.addEventListener('online', ...)` triggers a push sync on reconnection

---

## Decision 8: Auth UI Placement

**Decision**: Compact sign-in button in the app header (top-right); sign-in modal on click

**Rationale**:
- Auth is optional — it must not dominate the UI or block calendar use
- Header placement is convention-standard and non-intrusive
- Modal shows Google button + email/password form + explanatory text about sync benefits
- Signed-in state shows user avatar + email + "Sign Out" link

**Alternatives considered**:
- Sidebar/settings panel: Less discoverable for new users — rejected
- Full-page auth gate: Violates offline-first principle — rejected
