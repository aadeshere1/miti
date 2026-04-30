# Tasks: 008-firebase-auth-sync

**Input**: Design documents from `/specs/008-firebase-auth-sync/`
**Prerequisites**: plan.md, data-model.md, contracts/firestore.rules, contracts/api-surface.md, research.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to
- All paths relative to `/Users/senengutami/miti/`

## User Stories (derived from plan + original request)

- **US1** (P1): User can sign in / sign out — auth UI, Firebase lazy-init, header button
- **US2** (P2): First-login migration — existing offline data uploads to Firestore on first sign-in
- **US3** (P3): Real-time sync — notes and challenges sync live across browser sessions when signed in
- **US4** (P4): Offline resilience — app works fully without sign-in; sync resumes on reconnect; sync indicator

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Firebase project wiring, build config, gitignore — no runtime behaviour yet

- [x] T001 Install `firebase` npm package: `npm install firebase` and verify `package.json` is updated
- [x] T002 Add `src/auth/firebase-config.ts` to `.gitignore` (one new line: `src/auth/firebase-config.ts`)
- [x] T003 Create `src/auth/firebase-config.ts` with placeholder Firebase config object (see quickstart.md §2)
- [x] T004 Update `vite.config.ts` — add `manualChunks: { firebase: ['firebase/app','firebase/auth','firebase/firestore'] }` inside `rollupOptions.output`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types and service skeletons that every user story builds on. Must be complete before any US work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Create `src/auth/auth-types.ts` — define `AuthState`, `AuthUser`, `SyncStatus`, `SyncIndicatorState` interfaces per data-model.md
- [x] T006 [P] Create `src/sync/sync-types.ts` — define `FirestoreNotesDoc`, `FirestoreChallengesDoc`, `FirestoreCompletionsDoc`, `SyncRecord` interfaces per data-model.md
- [x] T007 Create `src/auth/auth-service.ts` — lazy Firebase init (`getFirebaseAuth`), `signInWithGoogle`, `signInWithEmail`, `signOut`, `onAuthStateChange`, `getAuthState`; Firebase modules loaded via `await import('firebase/...')` only inside these functions (never at module top-level)
- [x] T008 Create `src/sync/sync-service.ts` — `pushNotes`, `pushChallenges`, `pushCompletions`, `applyRemoteNotes`, `applyRemoteChallenges`, `applyRemoteCompletions`, `initSync`, `teardownSync`; all functions must be no-ops (resolve immediately) when `getAuthState().status !== 'signed-in'`
- [x] T009 Create `src/sync/sync-merge.ts` — `runFirstLoginMigration(uid)`: reads all syncable localStorage keys, compares `updatedAt` vs remote doc, batch-writes newer local docs, pulls newer remote docs, sets `miti:sync-initialized:{uid}` flag; see contracts/api-surface.md for key→path mapping

**Checkpoint**: Foundation ready — `auth-service` and `sync-service` exist; all no-ops when signed out; import from US phases without errors

---

## Phase 3: User Story 1 — Authentication UI (P1) 🎯 MVP

**Goal**: User sees a "Sign In" button in the app header; clicking opens a modal with Google and email/password options; once signed in, the button shows the user avatar and a "Sign Out" link.

**Independent Test**: Open the app → click "Sign In" → sign in with Google → header shows user name/avatar → click "Sign Out" → header reverts to "Sign In" button. App calendar works throughout without any disruption.

- [x] T010 [US1] Create `src/auth/auth-modal.ts` — modal element with Google sign-in button, email/password form (`<input type="email">`, `<input type="password">`), calls `signInWithGoogle()` / `signInWithEmail()` from auth-service; closes on success or explicit close; shows error message on failure
- [x] T011 [US1] Create `src/auth/auth-ui.ts` — header auth widget: renders "Sign In" button when signed out; renders user avatar (img or initials), display name, and "Sign Out" link when signed in; subscribes to `onAuthStateChange` to re-render on state change; calls `signOut()` on sign-out click; imports and opens `AuthModal` on sign-in click
- [x] T012 [US1] Add auth button placeholder `<div id="auth-widget"></div>` to the `<header>` area in `index.html`
- [x] T013 [US1] Wire up auth init in `src/main.ts` — import `auth-ui.ts` and call its mount function after existing `init()` so the widget renders into `#auth-widget`
- [x] T014 [US1] Add CSS for auth modal overlay and header widget button/avatar in `src/styles/` (new file `auth.css` imported in `main.ts`); style must not break existing header layout

**Checkpoint**: US1 complete — sign in/out works end-to-end; calendar is untouched; app still functions fully without signing in

---

## Phase 4: User Story 2 — First-Login Data Migration (P2)

**Goal**: When a user signs in for the first time, all existing localStorage notes and challenge data are silently uploaded to Firestore. On subsequent sign-ins the migration is skipped.

**Independent Test**:
1. Add several notes and complete some challenges while signed out.
2. Sign in → open Firebase Console → verify `users/{uid}/notes/*` and `users/{uid}/challenge-completions/*` documents contain the local data.
3. Sign out and sign in again → verify no duplicate writes (check `miti:sync-initialized:{uid}` in localStorage DevTools).

- [x] T015 [US2] Integrate `runFirstLoginMigration` into `auth-service.ts`'s `onAuthStateChanged` handler — call it when `status` transitions to `'signed-in'` and `miti:sync-initialized:{uid}` is not set; await completion before calling `initSync`
- [x] T016 [US2] Extend `src/sync/sync-service.ts` `initSync(uid)` to attach `onSnapshot` listeners for `users/{uid}/notes`, `users/{uid}/challenges`, and `users/{uid}/challenge-completions` collections after migration completes; each listener calls the corresponding `applyRemote*` function
- [x] T017 [US2] Update `auth-service.ts` `signOut()` to call `teardownSync()` (unsubscribe all `onSnapshot` listeners) before signing out

**Checkpoint**: US2 complete — offline data is in Firestore after first sign-in; no data loss; second sign-in skips migration

---

## Phase 5: User Story 3 — Real-Time Sync (P3)

**Goal**: Any note or challenge change made while signed in is pushed to Firestore immediately. Changes made on another signed-in session appear automatically (within ~2 seconds) without a page reload.

**Independent Test**:
1. Open app in Chrome (signed in) and Firefox (signed in, same account).
2. Add a note in Chrome → verify it appears in Firefox within 2 seconds.
3. Edit a note in Firefox → verify Chrome updates.
4. Toggle challenge completion in Chrome → verify Firefox updates.

- [x] T018 [US3] Add `pushNotes(nepaliDate, notes)` fire-and-forget call to `src/notes/notes-storage.ts` in `addNote`, `updateNote`, `deleteNote`, `toggleNoteCompletion`, `deleteAllNotesForDate` — per contracts/api-surface.md; errors must be caught and silenced (non-fatal)
- [x] T019 [US3] Add `pushChallenges(challenges)` call to `src/challenges/challenges-storage.ts` in the function(s) that write to `miti:challenges` (saveChallenges or equivalent)
- [x] T020 [US3] Add `pushCompletions(nepaliDate, completions)` call to `src/challenges/challenges-storage.ts` in the function(s) that write to `miti:challenge-completions:*`
- [x] T021 [US3] Implement `applyRemoteNotes` in `sync-service.ts` — write pulled `Note[]` to localStorage key `miti:notes:{date}` only if remote `updatedAt` > max local `note.modified`; then fire `StorageSyncManager` event so all open tabs re-render
- [x] T022 [US3] Implement `applyRemoteChallenges` and `applyRemoteCompletions` in `sync-service.ts` using the same last-write-wins logic as T021; fire corresponding `StorageSyncManager` events so calendar/challenge UI re-renders

**Checkpoint**: US3 complete — two signed-in tabs stay in sync in real time; offline (signed-out) tab is unaffected

---

## Phase 6: User Story 4 — Offline Resilience & Sync Indicator (P4)

**Goal**: App works fully without sign-in. When signed in and the device goes offline, writes queue in localStorage only; on reconnect the pending changes push to Firestore. A small sync status indicator (idle / syncing / synced / offline) appears in the header near the auth widget.

**Independent Test**:
1. Sign in, then disable network (DevTools → Offline).
2. Add a note → verify it saves locally (visible on calendar).
3. Re-enable network → verify the note appears in Firestore within a few seconds.
4. Verify the sync indicator transitions: syncing → synced.

- [x] T023 [US4] Add `window` online/offline event listeners in `src/sync/sync-service.ts` — on `'online'`, iterate all syncable localStorage keys and push any whose local `updatedAt` > `miti:last-pushed:{key}` (a per-key timestamp stored in localStorage after each successful push)
- [x] T024 [US4] Store `miti:last-pushed:{localstorageKey}` in localStorage after every successful `push*` call in `sync-service.ts` so the reconnect flush in T023 knows what needs re-pushing
- [x] T025 [US4] Implement sync indicator state management in `src/sync/sync-service.ts` — expose `getSyncIndicatorState(): SyncIndicatorState` and `onSyncIndicatorChange(cb)` subscription; set `status` to `'syncing'` before Firestore writes, `'synced'` on success, `'error'` on failure, `'offline'` when `navigator.onLine === false`
- [x] T026 [US4] Add sync indicator element to `src/auth/auth-ui.ts` — small icon/text next to auth widget showing current `SyncIndicatorState.status`; subscribed to `onSyncIndicatorChange`; only visible when signed in

**Checkpoint**: US4 complete — offline-first guarantee holds; sync indicator provides user feedback; full feature is complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, documentation, and deployment prep.

- [x] T027 [P] Copy `specs/008-firebase-auth-sync/contracts/firestore.rules` to `firestore.rules` at project root for easy deployment via Firebase CLI
- [x] T028 [P] Verify `npm run build` succeeds and the Firebase chunk is split correctly (check `dist/assets/` for a separate firebase chunk file); confirm initial bundle is still ≤ 20KB gzipped
- [x] T029 Update `.github/workflows/deploy.yml` (from feature 007) to generate `src/auth/firebase-config.ts` from repository secrets before the build step, per quickstart.md §4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **Phase 3 (US1)**: Requires Phase 2 — independently testable after
- **Phase 4 (US2)**: Requires Phase 2 + Phase 3 complete (auth state change needed)
- **Phase 5 (US3)**: Requires Phase 2 + Phase 4 complete (initSync must be wired)
- **Phase 6 (US4)**: Requires Phase 2 + Phase 5 complete (push functions must exist)
- **Phase 7 (Polish)**: Requires all prior phases complete

### User Story Dependencies

- **US1**: After Foundational — no story dependencies
- **US2**: After US1 (needs auth state change to trigger migration)
- **US3**: After US2 (initSync called after migration; push hooks need Firestore ready)
- **US4**: After US3 (push functions must exist for reconnect flush)

### Parallel Opportunities Within Phases

- **Phase 1**: T002, T003 can run in parallel (different files)
- **Phase 2**: T005 and T006 can run in parallel (different files)
- **Phase 3**: T010, T012 can start in parallel; T011 needs T010; T013 needs T011; T014 can run alongside T013
- **Phase 7**: T027 and T028 can run in parallel

---

## Parallel Example: Phase 2

```
# Launch in parallel (different files, no deps):
Task T005: "Create src/auth/auth-types.ts"
Task T006: "Create src/sync/sync-types.ts"

# Then sequentially:
Task T007: "Create src/auth/auth-service.ts"  (needs auth-types.ts)
Task T008: "Create src/sync/sync-service.ts"  (needs sync-types.ts)
Task T009: "Create src/sync/sync-merge.ts"    (needs sync-service.ts)
```

---

## Implementation Strategy

### MVP (US1 only — Phases 1–3)

1. Complete Phase 1: Setup (install firebase, vite config, gitignore)
2. Complete Phase 2: Foundational (types + service skeletons — all no-ops)
3. Complete Phase 3: US1 — Auth UI
4. **STOP and VALIDATE**: Sign in/out works; calendar unaffected; no sync yet
5. Ship as "sign-in available, sync coming soon" if desired

### Incremental Delivery

- **After US1**: Users can authenticate; data stays local
- **After US2**: First-login migration uploads existing offline data to cloud
- **After US3**: Real-time sync active — changes propagate across sessions
- **After US4**: Offline resilience complete; sync indicator polishes UX

### Single Developer Sequence

```
Phase 1 → Phase 2 → Phase 3 (US1 MVP) → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

---

## Notes

- Firebase is **never imported at module top-level** — always via `await import(...)` inside functions to ensure lazy loading and zero impact on initial bundle
- All `push*` calls in storage modules are **fire-and-forget** (`.catch(() => {})`) — sync errors must never surface to the user as calendar failures
- `StorageSyncManager` (existing `src/utils/storage-sync.ts`) must be used to notify other tabs when `applyRemote*` updates localStorage, preserving the existing multi-tab sync architecture
- `miti:sync-initialized:{uid}` key prevents re-migration; `miti:last-pushed:{key}` enables reconnect flush
- Total new files: 7 | Modified files: 5
