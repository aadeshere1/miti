// Firestore sync service — lazy-loaded, no-op when signed out.
// Handles push (local → Firestore), apply-remote (Firestore → local),
// real-time onSnapshot listeners, and online/offline flush.
//
// Firebase SDK is NEVER imported at module top-level.

import type { Firestore } from 'firebase/firestore';
import type { FirestoreNotesDoc, FirestoreChallengesDoc, FirestoreCompletionsDoc } from './sync-types';
import type { SyncIndicatorState, SyncStatus } from '../auth/auth-types';
import type { Note } from '../notes/notes-types';
import type { Challenge, ChallengeCompletions } from '../challenges/challenges-types';
import { setItem, getItem } from '../utils/storage';

// ── Module-level state ────────────────────────────────────────────────────────

let _db: Firestore | null = null;
let _currentUid: string | null = null;
let _unsubscribers: (() => void)[] = [];

// ── Sync indicator (T025) ─────────────────────────────────────────────────────

let _syncState: SyncIndicatorState = { status: 'idle', lastSyncedAt: null };
const _syncCallbacks: ((state: SyncIndicatorState) => void)[] = [];

function setSyncStatus(status: SyncStatus, errorMessage?: string): void {
  _syncState = {
    status,
    lastSyncedAt: status === 'synced' ? Date.now() : _syncState.lastSyncedAt,
    errorMessage,
  };
  _syncCallbacks.forEach(cb => { try { cb(_syncState); } catch { /* non-fatal */ } });
}

export function getSyncIndicatorState(): SyncIndicatorState {
  return _syncState;
}

export function onSyncIndicatorChange(cb: (state: SyncIndicatorState) => void): () => void {
  _syncCallbacks.push(cb);
  cb(_syncState);
  return () => {
    const idx = _syncCallbacks.indexOf(cb);
    if (idx > -1) _syncCallbacks.splice(idx, 1);
  };
}

// ── Firebase lazy init ────────────────────────────────────────────────────────

async function getDb(): Promise<Firestore> {
  if (_db) return _db;
  const { firebaseConfig } = await import('../auth/firebase-config');
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _db = getFirestore(app);
  return _db;
}

// ── Last-pushed tracking (T024) ───────────────────────────────────────────────

function getLastPushed(localKey: string): number {
  return parseInt(localStorage.getItem(`miti:last-pushed:${localKey}`) ?? '0', 10);
}

function setLastPushed(localKey: string): void {
  localStorage.setItem(`miti:last-pushed:${localKey}`, String(Date.now()));
}

// ── Push functions ────────────────────────────────────────────────────────────

export function setCurrentUid(uid: string | null): void {
  _currentUid = uid;
  if (!uid) {
    setSyncStatus('idle');
  } else if (!navigator.onLine) {
    setSyncStatus('offline');
  }
}

export async function pushNotes(nepaliDate: string, notes: Note[]): Promise<void> {
  if (!_currentUid) return;
  const localKey = `miti:notes:${nepaliDate}`;
  const updatedAt = notes.length > 0 ? Math.max(...notes.map(n => n.modified)) : Date.now();
  setSyncStatus('syncing');
  try {
    const db = await getDb();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', _currentUid, 'notes', nepaliDate), { notes, updatedAt });
    setLastPushed(localKey);
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('error', String(err));
  }
}

export async function pushChallenges(challenges: Challenge[]): Promise<void> {
  if (!_currentUid) return;
  const localKey = 'miti:challenges';
  const updatedAt = Date.now();
  setSyncStatus('syncing');
  try {
    const db = await getDb();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', _currentUid, 'challenges'), { challenges, updatedAt });
    setLastPushed(localKey);
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('error', String(err));
  }
}

export async function pushCompletions(nepaliDate: string, completions: ChallengeCompletions): Promise<void> {
  if (!_currentUid) return;
  const localKey = `miti:challenge-completions:${nepaliDate}`;
  const updatedAt = Date.now();
  setSyncStatus('syncing');
  try {
    const db = await getDb();
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', _currentUid, 'challenge-completions', nepaliDate), { completions, updatedAt });
    setLastPushed(localKey);
    setSyncStatus('synced');
  } catch (err) {
    setSyncStatus('error', String(err));
  }
}

// ── Apply-remote functions (T021, T022) ───────────────────────────────────────
// Writes pulled Firestore data to localStorage using last-write-wins.
// Dispatches a synthetic StorageEvent so the current tab's StorageSyncManager
// callbacks fire (the native storage event only fires in OTHER tabs).

export function applyRemoteNotes(nepaliDate: string, remoteDoc: FirestoreNotesDoc): void {
  const localKey = `miti:notes:${nepaliDate}`;
  const localNotes = getItem<Note[]>(localKey, []) ?? [];
  const localMax = localNotes.length > 0 ? Math.max(...localNotes.map(n => n.modified)) : 0;
  if (remoteDoc.updatedAt <= localMax) return; // local is newer or equal — skip
  setItem(localKey, remoteDoc.notes);
  window.dispatchEvent(new StorageEvent('storage', {
    key: localKey,
    newValue: JSON.stringify(remoteDoc.notes),
    storageArea: localStorage,
  }));
}

export function applyRemoteChallenges(remoteDoc: FirestoreChallengesDoc): void {
  const localKey = 'miti:challenges';
  const lastPushed = getLastPushed(localKey);
  if (remoteDoc.updatedAt <= lastPushed) return; // we just pushed this — skip echo
  setItem(localKey, remoteDoc.challenges);
  window.dispatchEvent(new StorageEvent('storage', {
    key: localKey,
    newValue: JSON.stringify(remoteDoc.challenges),
    storageArea: localStorage,
  }));
}

export function applyRemoteCompletions(nepaliDate: string, remoteDoc: FirestoreCompletionsDoc): void {
  const localKey = `miti:challenge-completions:${nepaliDate}`;
  const lastPushed = getLastPushed(localKey);
  if (remoteDoc.updatedAt <= lastPushed) return;
  setItem(localKey, remoteDoc.completions);
  window.dispatchEvent(new StorageEvent('storage', {
    key: localKey,
    newValue: JSON.stringify(remoteDoc.completions),
    storageArea: localStorage,
  }));
}

// ── initSync / teardownSync (T016) ────────────────────────────────────────────

export async function initSync(uid: string): Promise<void> {
  _currentUid = uid;
  if (!navigator.onLine) {
    setSyncStatus('offline');
    return;
  }
  setSyncStatus('syncing');

  try {
    const db = await getDb();
    const { collection, onSnapshot, doc } = await import('firebase/firestore');

    // Listen to notes collection
    const notesUnsub = onSnapshot(
      collection(db, 'users', uid, 'notes'),
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type !== 'removed') {
            applyRemoteNotes(change.doc.id, change.doc.data() as FirestoreNotesDoc);
          }
        });
      },
      err => { console.error('Notes sync error:', err); setSyncStatus('error', String(err)); }
    );
    _unsubscribers.push(notesUnsub);

    // Listen to challenges document
    const challengesUnsub = onSnapshot(
      doc(db, 'users', uid, 'challenges'),
      snap => {
        if (snap.exists()) applyRemoteChallenges(snap.data() as FirestoreChallengesDoc);
      },
      err => { console.error('Challenges sync error:', err); }
    );
    _unsubscribers.push(challengesUnsub);

    // Listen to challenge-completions collection
    const completionsUnsub = onSnapshot(
      collection(db, 'users', uid, 'challenge-completions'),
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type !== 'removed') {
            applyRemoteCompletions(change.doc.id, change.doc.data() as FirestoreCompletionsDoc);
          }
        });
      },
      err => { console.error('Completions sync error:', err); }
    );
    _unsubscribers.push(completionsUnsub);

    setSyncStatus('synced');
  } catch (err) {
    console.error('initSync error:', err);
    setSyncStatus('error', String(err));
  }
}

export function teardownSync(): void {
  _unsubscribers.forEach(u => { try { u(); } catch { /* non-fatal */ } });
  _unsubscribers = [];
  _currentUid = null;
  setSyncStatus('idle');
}

// ── Online / offline handling (T023) ─────────────────────────────────────────

async function flushPendingSync(): Promise<void> {
  if (!_currentUid) return;

  // Collect all keys first to avoid mutating while iterating
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) keys.push(k);
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  for (const key of keys) {
    if (key.startsWith('miti:notes:')) {
      const date = key.slice('miti:notes:'.length);
      if (!datePattern.test(date)) continue;
      const notes = getItem<Note[]>(key, []) ?? [];
      const localMax = notes.length > 0 ? Math.max(...notes.map(n => n.modified)) : 0;
      if (localMax > getLastPushed(key)) {
        await pushNotes(date, notes).catch(() => { /* non-fatal */ });
      }
    } else if (key === 'miti:challenges') {
      // Re-push challenges if they've never been pushed in this session
      if (getLastPushed(key) === 0) {
        const challenges = getItem<Challenge[]>(key, []) ?? [];
        if (challenges.length > 0) {
          await pushChallenges(challenges).catch(() => { /* non-fatal */ });
        }
      }
    } else if (key.startsWith('miti:challenge-completions:')) {
      const date = key.slice('miti:challenge-completions:'.length);
      if (!datePattern.test(date)) continue;
      if (getLastPushed(key) === 0) {
        const completions = getItem<ChallengeCompletions>(key, {}) ?? {};
        if (Object.keys(completions).length > 0) {
          await pushCompletions(date, completions).catch(() => { /* non-fatal */ });
        }
      }
    }
  }
}

window.addEventListener('online', () => {
  if (_currentUid) {
    flushPendingSync().catch(console.error);
  }
});

window.addEventListener('offline', () => {
  if (_currentUid) setSyncStatus('offline');
});
