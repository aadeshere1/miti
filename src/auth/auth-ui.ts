// Auth header widget — renders sign-in button or user info based on auth state.
// Also shows sync indicator (T026) when signed in.
// Mounted into #auth-widget by main.ts.

import type { AuthState } from './auth-types';
import { AuthModal } from './auth-modal';
import { onAuthStateChange, signOut } from './auth-service';
import { onSyncIndicatorChange, getSyncIndicatorState } from '../sync/sync-service';
import type { SyncIndicatorState } from './auth-types';

const SYNC_STATUS_ICONS: Record<string, string> = {
  idle: '',
  syncing: '↻',
  synced: '✓',
  error: '⚠',
  offline: '⊘',
};

const SYNC_STATUS_TITLES: Record<string, string> = {
  idle: '',
  syncing: 'Syncing…',
  synced: 'Synced',
  error: 'Sync error',
  offline: 'Offline — changes saved locally',
};

export function mountAuthWidget(): void {
  const containerEl = document.getElementById('auth-widget');
  if (!containerEl) return;
  const container: HTMLElement = containerEl;

  const modal = new AuthModal();

  function renderSyncIndicator(syncState: SyncIndicatorState): string {
    if (syncState.status === 'idle') return '';
    const icon = SYNC_STATUS_ICONS[syncState.status] ?? '';
    const title = SYNC_STATUS_TITLES[syncState.status] ?? '';
    return `<span class="auth-sync-indicator auth-sync-${syncState.status}" title="${title}" aria-label="${title}">${icon}</span>`;
  }

  function render(state: AuthState): void {
    const syncState = getSyncIndicatorState();

    if (state.status === 'loading') {
      container.innerHTML = `<div class="auth-widget auth-widget-loading" aria-label="Loading sign-in status"></div>`;
      return;
    }

    if (state.status === 'signed-out') {
      container.innerHTML = `<button class="auth-signin-btn" type="button">Sign In</button>`;
      container.querySelector('.auth-signin-btn')?.addEventListener('click', () => modal.open());
      return;
    }

    // Signed in
    const user = state.user!;
    const initials = getInitials(user.displayName ?? user.email ?? '?');
    const avatarHtml = user.photoURL
      ? `<img class="auth-avatar-img" src="${user.photoURL}" alt="${escapeHtml(user.displayName ?? 'User')}" referrerpolicy="no-referrer" />`
      : `<span class="auth-avatar-initials">${escapeHtml(initials)}</span>`;

    container.innerHTML = `
      <div class="auth-widget auth-widget-signed-in">
        ${renderSyncIndicator(syncState)}
        <div class="auth-avatar" title="${escapeHtml(user.email ?? user.displayName ?? '')}">${avatarHtml}</div>
        <button class="auth-signout-btn" type="button">Sign Out</button>
      </div>
    `;
    container.querySelector('.auth-signout-btn')?.addEventListener('click', async () => {
      try { await signOut(); } catch { /* non-fatal */ }
    });
  }

  // Subscribe to auth state changes
  onAuthStateChange(state => render(state));

  // Subscribe to sync indicator changes (re-render widget portion only)
  onSyncIndicatorChange(syncState => {
    const indicator = container.querySelector('.auth-sync-indicator');
    if (!indicator) return;
    const status = syncState.status;
    // Update indicator in-place to avoid full re-render flickering
    indicator.className = `auth-sync-indicator auth-sync-${status}`;
    indicator.textContent = SYNC_STATUS_ICONS[status] ?? '';
    (indicator as HTMLElement).title = SYNC_STATUS_TITLES[status] ?? '';
    (indicator as HTMLElement).setAttribute('aria-label', SYNC_STATUS_TITLES[status] ?? '');
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
