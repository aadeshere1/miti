// Firestore document shapes and sync tracking types for feature 008-firebase-auth-sync

import type { Note } from '../notes/notes-types';
import type { Challenge, ChallengeCompletions } from '../challenges/challenges-types';

// users/{uid}/notes/{YYYY-MM-DD}
export interface FirestoreNotesDoc {
  notes: Note[];
  updatedAt: number; // Unix ms — used for last-write-wins
}

// users/{uid}/challenges  (single document)
export interface FirestoreChallengesDoc {
  challenges: Challenge[];
  updatedAt: number;
}

// users/{uid}/challenge-completions/{YYYY-MM-DD}
export interface FirestoreCompletionsDoc {
  completions: ChallengeCompletions;
  updatedAt: number;
}

// Tracks sync state per document (for debugging / future use)
export interface SyncRecord {
  key: string;           // localStorage key (e.g., "miti:notes:2082-01-15")
  firestorePath: string; // Firestore path (e.g., "users/abc/notes/2082-01-15")
  localUpdatedAt: number;
  remoteUpdatedAt: number;
  status: 'pending' | 'synced' | 'conflict-resolved';
}
