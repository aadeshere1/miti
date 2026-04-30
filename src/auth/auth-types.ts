// Authentication and sync state types for feature 008-firebase-auth-sync

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'email';
}

export interface AuthState {
  status: 'loading' | 'signed-out' | 'signed-in';
  user: AuthUser | null;
}

export interface SyncIndicatorState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  errorMessage?: string;
}
