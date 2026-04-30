# Implementation Plan: 008-firebase-auth-sync

**Branch**: `008-firebase-auth-sync` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-firebase-auth-sync/spec.md`

## Summary

Add optional Firebase Authentication (Google + email/password) and Firestore sync for notes,
challenge definitions, and challenge completions. All existing offline features remain fully
functional without login. When signed in, data syncs in real-time across browser sessions.
Firebase modules are lazy-loaded on sign-in to keep the initial bundle unchanged.

## Technical Context

**Language/Version**: TypeScript 5.9 → ES2020+ JavaScript
**Primary Dependencies**: `firebase` v10+ (modular SDK) — lazy-loaded; `@remotemerge/nepali-date-converter` (existing)
**Storage**: Browser localStorage (existing, remains primary); Firestore (optional, sync layer)
**Testing**: Manual cross-browser (Chrome, Firefox, Safari); no new test framework
**Target Platform**: Modern browser (same as existing app)
**Project Type**: Web application (single-page, Vite)
**Performance Goals**: Initial bundle stays under 20KB gzipped; Firebase chunk ~140KB gzipped loaded on-demand
**Constraints**: Offline-first — all core features work without network; sync is additive only
**Scale/Scope**: Single user per account; sync across browser tabs and devices

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Calendar Accuracy (NON-NEGOTIABLE) | ✅ PASS | No calendar logic touched |
| II. Browser Compatibility | ✅ PASS | Firebase v10 supports all target browsers; graceful degradation if auth unavailable |
| III. Offline-First Architecture | ✅ PASS | localStorage remains source of truth; Firestore is optional sync layer; constitution explicitly allows "Network requests ONLY for optional features (syncing)" |
| IV. Performance & Responsiveness | ✅ PASS | Lazy-loading Firebase: initial bundle stays ~16KB gzipped; Firebase chunk (~140KB) loads only on sign-in initiation |
| V. Simplicity & Maintainability | ⚠️ JUSTIFIED | Firebase adds external dependency; justified because it's user-requested and the sync layer is isolated from calendar logic (see Complexity Tracking) |

## Project Structure

### Documentation (this feature)

```text
specs/008-firebase-auth-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── firestore.rules  # Firestore security rules
│   └── api-surface.md   # localStorage ↔ Firestore mapping
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── auth/
│   ├── auth-types.ts         # AuthState, SyncStatus types
│   ├── auth-service.ts       # Firebase init (lazy), sign-in/out, auth state
│   ├── auth-ui.ts            # Sign-in button, user avatar, sync indicator
│   └── auth-modal.ts         # Sign-in modal (Google + email/password)
├── sync/
│   ├── sync-service.ts       # Firestore read/write, offline detection
│   ├── sync-merge.ts         # localStorage → Firestore merge on first login
│   └── sync-types.ts         # SyncRecord, SyncState types
├── notes/                    # EXISTING — notes-storage.ts gets sync hooks
├── challenges/               # EXISTING — challenges-storage.ts gets sync hooks
├── utils/
│   └── storage.ts            # EXISTING — no changes
└── main.ts                   # EXISTING — add auth init call
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Firebase external dependency (~140KB lazy chunk) | User explicitly requested Firebase for cross-browser-session sync; already uses Firebase on other apps | Other sync options (CRDTs, custom backend, IndexedDB sync) require more code with no reuse benefit for user |
| Firestore as optional backend | Cross-device note sync is impossible with localStorage alone | No simpler cloud option that provides real-time sync, auth, and security rules in one package |
