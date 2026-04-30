// Firebase Authentication service — lazy-loaded to keep initial bundle unchanged.
// Firebase SDK modules are NEVER imported at module top-level; all imports are
// dynamic (await import('firebase/...')) executed only when functions are called.

import type { Auth, User } from 'firebase/auth';
import type { AuthState, AuthUser } from './auth-types';
import { firebaseConfig } from './firebase-config';

// ── Module-level state ─────────────────────────────────────────────────────────

let _auth: Auth | null = null;
let _authState: AuthState = { status: 'loading', user: null };
const _callbacks: ((state: AuthState) => void)[] = [];
let _listenerStarted = false;

// ── Firebase lazy init ────────────────────────────────────────────────────────

async function ensureAuth(): Promise<Auth> {
  if (_auth) return _auth;
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(app);
  return _auth;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapUser(user: User): AuthUser {
  const providerId = user.providerData[0]?.providerId ?? '';
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: providerId === 'google.com' ? 'google' : 'email',
  };
}

function setAuthState(state: AuthState): void {
  _authState = state;
  _callbacks.forEach(cb => { try { cb(state); } catch { /* non-fatal */ } });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAuthState(): AuthState {
  return _authState;
}

/**
 * Subscribe to auth state changes. Fires immediately with current state.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: (state: AuthState) => void): () => void {
  _callbacks.push(callback);
  callback(_authState);
  return () => {
    const idx = _callbacks.indexOf(callback);
    if (idx > -1) _callbacks.splice(idx, 1);
  };
}

/**
 * Lazily initialize Firebase Auth and start listening to auth state changes.
 * Safe to call multiple times — only initializes once.
 * Called from main.ts after app init so it never blocks calendar rendering.
 */
export async function initAuth(): Promise<void> {
  if (_listenerStarted) return;
  _listenerStarted = true;

  try {
    const auth = await ensureAuth();
    const { onAuthStateChanged } = await import('firebase/auth');

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // T015: Run first-login migration if this uid hasn't synced before,
        // then start real-time Firestore listeners.
        const authUser = mapUser(user);
        const syncKey = `miti:sync-initialized:${user.uid}`;
        try {
          if (!localStorage.getItem(syncKey)) {
            const { runFirstLoginMigration } = await import('../sync/sync-merge');
            await runFirstLoginMigration(user.uid);
            localStorage.setItem(syncKey, 'true');
          }
          const { initSync } = await import('../sync/sync-service');
          await initSync(user.uid);
        } catch (err) {
          // Sync failure is non-fatal — app still works offline
          console.error('Sync init error:', err);
        }
        setAuthState({ status: 'signed-in', user: authUser });
      } else {
        // T017: Tear down Firestore listeners on sign-out.
        try {
          const { teardownSync } = await import('../sync/sync-service');
          teardownSync();
        } catch { /* non-fatal */ }
        setAuthState({ status: 'signed-out', user: null });
      }
    });
  } catch (err) {
    // Firebase unavailable (e.g. placeholder config) — silently fall back to signed-out.
    console.warn('Firebase auth unavailable:', err);
    setAuthState({ status: 'signed-out', user: null });
  }
}

/**
 * Sign in with Google popup.
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  const auth = await ensureAuth();
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return mapUser(result.user);
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const auth = await ensureAuth();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return mapUser(result.user);
}

/**
 * Sign out. The onAuthStateChanged handler calls teardownSync automatically.
 */
export async function signOut(): Promise<void> {
  if (!_auth) return;
  const { signOut: fbSignOut } = await import('firebase/auth');
  await fbSignOut(_auth);
}
