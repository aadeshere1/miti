// Challenge definitions and completion data CRUD (localStorage)

import { getItem, setItem, removeItem } from '../utils/storage';
import { generateUUID } from '../utils/uuid';
import { convertGregorianToNepali } from '../calendar/conversions';
import type { Challenge, ChallengeCompletions } from './challenges-types';
import { CHALLENGES_KEY, CHALLENGE_COMPLETIONS_PREFIX, MAX_CHALLENGES, createDefaultChallenges } from './challenges-types';

// ── Helpers ──

function getTodayNepali(): string {
  const today = new Date();
  const np = convertGregorianToNepali(today);
  return `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
}

function completionKey(nepaliDate: string): string {
  return `${CHALLENGE_COMPLETIONS_PREFIX}${nepaliDate}`;
}

// ── Challenge definitions CRUD (T004) ──

/**
 * Load all challenges from storage.
 * Initialises with 3 disabled defaults on first access.
 */
export function getChallenges(): Challenge[] {
  const stored = getItem<Challenge[]>(CHALLENGES_KEY);
  if (stored && stored.length > 0) {
    return stored;
  }
  // First access — seed defaults
  const defaults = createDefaultChallenges(getTodayNepali());
  setItem(CHALLENGES_KEY, defaults);
  return defaults;
}

/**
 * Persist the full challenges array.
 */
export function saveChallenges(challenges: Challenge[]): void {
  setItem(CHALLENGES_KEY, challenges);
}

/**
 * Return only challenges that are currently enabled.
 */
export function getEnabledChallenges(): Challenge[] {
  return getChallenges().filter(c => c.enabled);
}

/**
 * Enable a challenge by ID; updates enabledDate to today.
 */
export function enableChallenge(id: string): void {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === id);
  if (!challenge) return;
  challenge.enabled = true;
  challenge.enabledDate = getTodayNepali();
  saveChallenges(challenges);
}

/**
 * Disable a challenge by ID. Completion data is preserved (FR-012).
 */
export function disableChallenge(id: string): void {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === id);
  if (!challenge) return;
  challenge.enabled = false;
  saveChallenges(challenges);
}

// ── Completion data CRUD (T005) ──

/**
 * Get completion map for a specific Nepali date.
 */
export function getCompletionsForDate(nepaliDate: string): ChallengeCompletions {
  return getItem<ChallengeCompletions>(completionKey(nepaliDate)) || {};
}

/**
 * Toggle completion for a challenge on a given date.
 * Only allowed for today (FR-009).
 */
export function toggleCompletion(challengeId: string, nepaliDate: string): boolean {
  const today = getTodayNepali();
  if (nepaliDate !== today) return false;

  const completions = getCompletionsForDate(nepaliDate);
  completions[challengeId] = !completions[challengeId];
  setItem(completionKey(nepaliDate), completions);
  return completions[challengeId];
}

/**
 * Batch-load completions for an entire Nepali month.
 * Returns a map of date string → completions.
 */
export function getCompletionsForMonth(year: number, month: number): Map<string, ChallengeCompletions> {
  const result = new Map<string, ChallengeCompletions>();
  // Nepali months have 29-32 days; iterate generously
  for (let day = 1; day <= 32; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completions = getItem<ChallengeCompletions>(completionKey(dateStr));
    if (completions && Object.keys(completions).length > 0) {
      result.set(dateStr, completions);
    }
  }
  return result;
}

// ── Custom challenge management (T016, T017) ──

/**
 * Add a new custom challenge. Returns the new challenge.
 * Validates name length and total count limit.
 */
export function addChallenge(name: string, icon: string): Challenge {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 30) {
    throw new Error('Challenge name must be 1-30 characters.');
  }

  const challenges = getChallenges();
  if (challenges.length >= MAX_CHALLENGES) {
    throw new Error(`Maximum of ${MAX_CHALLENGES} challenges reached.`);
  }

  const today = getTodayNepali();
  const newChallenge: Challenge = {
    id: generateUUID(),
    name: trimmed,
    icon,
    type: 'custom',
    enabled: true,
    enabledDate: today,
    createdDate: today,
    order: challenges.length,
  };

  challenges.push(newChallenge);
  saveChallenges(challenges);
  return newChallenge;
}

/**
 * Update a custom challenge's name and/or icon.
 * Does nothing for default challenges.
 */
export function updateChallenge(id: string, name: string, icon: string): void {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === id);
  if (!challenge || challenge.type !== 'custom') return;

  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 30) {
    throw new Error('Challenge name must be 1-30 characters.');
  }

  challenge.name = trimmed;
  challenge.icon = icon;
  saveChallenges(challenges);
}

/**
 * Delete a custom challenge and cascade-remove all completion data.
 * Throws if trying to delete a default challenge.
 */
export function deleteChallenge(id: string): void {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === id);
  if (!challenge) return;
  if (challenge.type === 'default') {
    throw new Error('Default challenges cannot be deleted.');
  }

  // Remove from definitions
  const updated = challenges.filter(c => c.id !== id);
  saveChallenges(updated);

  // Cascade delete: remove this challenge from all completion keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CHALLENGE_COMPLETIONS_PREFIX)) {
      const completions = getItem<ChallengeCompletions>(key);
      if (completions && id in completions) {
        delete completions[id];
        if (Object.keys(completions).length === 0) {
          removeItem(key);
        } else {
          setItem(key, completions);
        }
      }
    }
  }
}
