// First-login migration: uploads existing localStorage data to Firestore.
// Called once per uid when miti:sync-initialized:{uid} is not set.
// Uses last-write-wins: local wins if local.updatedAt > remote.updatedAt.

import type { Note } from '../notes/notes-types';
import type { Challenge, ChallengeCompletions } from '../challenges/challenges-types';
import type { FirestoreNotesDoc, FirestoreChallengesDoc, FirestoreCompletionsDoc } from './sync-types';
import { getItem } from '../utils/storage';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function runFirstLoginMigration(uid: string): Promise<void> {
  const { firebaseConfig } = await import('../auth/firebase-config');
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getFirestore, doc, getDoc, writeBatch } = await import('firebase/firestore');

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const batch = writeBatch(db);
  let opCount = 0;

  // Collect all syncable localStorage keys before any async work
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) keys.push(k);
  }

  // ── Migrate notes ──────────────────────────────────────────────────────────
  for (const key of keys) {
    if (!key.startsWith('miti:notes:')) continue;
    const date = key.slice('miti:notes:'.length);
    if (!DATE_PATTERN.test(date)) continue;

    const notes = getItem<Note[]>(key, []) ?? [];
    if (notes.length === 0) continue;
    const localMax = Math.max(...notes.map(n => n.modified));

    const remoteRef = doc(db, 'users', uid, 'notes', date);
    const remoteSnap = await getDoc(remoteRef);

    if (!remoteSnap.exists()) {
      batch.set(remoteRef, { notes, updatedAt: localMax } satisfies FirestoreNotesDoc);
      opCount++;
    } else {
      const remote = remoteSnap.data() as FirestoreNotesDoc;
      if (localMax > remote.updatedAt) {
        batch.set(remoteRef, { notes, updatedAt: localMax } satisfies FirestoreNotesDoc);
        opCount++;
      }
      // If remote is newer: initSync's onSnapshot will pull it after migration completes
    }
  }

  // ── Migrate challenge definitions ──────────────────────────────────────────
  const challenges = getItem<Challenge[]>('miti:challenges', []) ?? [];
  if (challenges.length > 0) {
    const remoteRef = doc(db, 'users', uid, 'challenges');
    const remoteSnap = await getDoc(remoteRef);
    const localUpdatedAt = Date.now();
    if (!remoteSnap.exists()) {
      batch.set(remoteRef, { challenges, updatedAt: localUpdatedAt } satisfies FirestoreChallengesDoc);
      opCount++;
    }
    // If remote exists: keep remote (assume it was set from another device)
  }

  // ── Migrate challenge completions ──────────────────────────────────────────
  for (const key of keys) {
    if (!key.startsWith('miti:challenge-completions:')) continue;
    const date = key.slice('miti:challenge-completions:'.length);
    if (!DATE_PATTERN.test(date)) continue;

    const completions = getItem<ChallengeCompletions>(key, {}) ?? {};
    if (Object.keys(completions).length === 0) continue;

    const remoteRef = doc(db, 'users', uid, 'challenge-completions', date);
    const remoteSnap = await getDoc(remoteRef);
    if (!remoteSnap.exists()) {
      batch.set(remoteRef, { completions, updatedAt: Date.now() } satisfies FirestoreCompletionsDoc);
      opCount++;
    }
  }

  // Commit only if there are operations (avoids empty batch error)
  if (opCount > 0) {
    await batch.commit();
  }
}
