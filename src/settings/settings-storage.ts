// Settings storage and management

import { Settings, WeekendConfig } from './settings-types';
import { getItem, setItem } from '../utils/storage';

const SETTINGS_KEY = 'miti:settings';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  weekend: 'saturday',
  sidebarPosition: 'right',
  sidebarEnabled: true,
  themeType: 'none',
};

/**
 * Get all settings from storage (T044)
 * @returns Settings object (returns defaults if not found)
 */
export function getSettings(): Settings {
  const stored = getItem<Settings>(SETTINGS_KEY);
  if (!stored) {
    return { ...DEFAULT_SETTINGS };
  }

  // Merge with defaults to handle missing keys
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
}

/**
 * Update settings with partial updates (T045)
 * @param updates Partial settings to update
 */
export function updateSettings(updates: Partial<Settings>): void {
  const current = getSettings();
  const updated = {
    ...current,
    ...updates,
  };

  setItem(SETTINGS_KEY, updated);
}

/**
 * Reset settings to defaults (T046)
 */
export function resetSettings(): void {
  setItem(SETTINGS_KEY, DEFAULT_SETTINGS);
}

/**
 * Get a specific setting value (T047)
 * @param key Setting key to retrieve
 * @returns Setting value
 */
export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  const settings = getSettings();
  return settings[key];
}

/**
 * Check if a day of week is a weekend day based on settings
 * @param dayOfWeek Day of week (0 = Sunday, 6 = Saturday)
 * @returns true if the day is configured as weekend
 */
export function isWeekendDay(dayOfWeek: number): boolean {
  const weekend = getSetting('weekend');

  switch (weekend) {
    case 'sunday':
      return dayOfWeek === 0;
    case 'saturday':
      return dayOfWeek === 6;
    case 'both':
      return dayOfWeek === 0 || dayOfWeek === 6;
    default:
      return false;
  }
}
