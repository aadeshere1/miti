// Multi-tab synchronization using localStorage events
// Per FR-027: Synchronize notes and settings across multiple browser tabs

type SyncCallback = (key: string, newValue: string | null, oldValue: string | null) => void;

/**
 * Storage sync manager for multi-tab communication
 */
class StorageSyncManager {
  private callbacks: Map<string, SyncCallback[]> = new Map();
  private isListening: boolean = false;

  /**
   * Register a callback for storage changes on a specific key prefix
   * @param keyPrefix Key prefix to listen for (e.g., 'miti:notes:', 'miti:settings')
   * @param callback Function to call when matching key changes
   */
  public on(keyPrefix: string, callback: SyncCallback): void {
    if (!this.callbacks.has(keyPrefix)) {
      this.callbacks.set(keyPrefix, []);
    }
    this.callbacks.get(keyPrefix)!.push(callback);

    // Start listening if not already
    if (!this.isListening) {
      this.startListening();
    }
  }

  /**
   * Unregister a callback
   * @param keyPrefix Key prefix
   * @param callback Callback to remove
   */
  public off(keyPrefix: string, callback: SyncCallback): void {
    const callbacks = this.callbacks.get(keyPrefix);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Start listening to storage events
   */
  private startListening(): void {
    if (this.isListening) return;

    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    this.isListening = true;
  }

  /**
   * Handle storage event from another tab
   * @param event StorageEvent from window
   */
  private handleStorageEvent(event: StorageEvent): void {
    // Only process miti: keys
    if (!event.key || !event.key.startsWith('miti:')) {
      return;
    }

    // Find matching callbacks
    for (const [keyPrefix, callbacks] of this.callbacks.entries()) {
      if (event.key.startsWith(keyPrefix)) {
        callbacks.forEach(callback => {
          try {
            callback(event.key!, event.newValue, event.oldValue);
          } catch (error) {
            console.error(`Error in storage sync callback for ${event.key}:`, error);
          }
        });
      }
    }
  }

  /**
   * Stop listening to storage events
   */
  public stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    this.isListening = false;
  }
}

// Export singleton instance
export const storageSync = new StorageSyncManager();

/**
 * Convenience function to listen for notes changes
 * @param callback Function to call when notes change
 */
export function onNotesChange(callback: SyncCallback): void {
  storageSync.on('miti:notes:', callback);
}

/**
 * Convenience function to listen for settings changes
 * @param callback Function to call when settings change
 */
export function onSettingsChange(callback: SyncCallback): void {
  storageSync.on('miti:settings', callback);
}

/**
 * Convenience function to listen for holiday changes
 * @param callback Function to call when holidays change
 */
export function onHolidaysChange(callback: SyncCallback): void {
  storageSync.on('miti:holidays', callback);
}
