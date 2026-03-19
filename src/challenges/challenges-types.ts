// Challenge types, constants, and defaults

/**
 * Challenge type: default (built-in) or custom (user-created)
 */
export type ChallengeType = 'default' | 'custom';

/**
 * Reminder time window options for challenge reminders
 */
export type ReminderTimeWindow = 'morning' | 'afternoon' | 'evening' | 'all-day' | 'none';

/**
 * Challenge entity — a trackable daily challenge definition
 */
export interface Challenge {
  id: string;
  name: string;
  icon: string;
  type: ChallengeType;
  enabled: boolean;
  enabledDate: string;   // Nepali date YYYY-MM-DD
  createdDate: string;   // Nepali date YYYY-MM-DD
  order: number;
  reminderTime: ReminderTimeWindow;
}

/**
 * Challenge completion record for a single date.
 * Stored as a flat object mapping challenge IDs to booleans.
 */
export type ChallengeCompletions = Record<string, boolean>;

// ── Storage keys ──

export const CHALLENGES_KEY = 'miti:challenges';
export const CHALLENGE_COMPLETIONS_PREFIX = 'miti:challenge-completions:';

// ── Default challenge IDs ──

export const DEFAULT_CHALLENGE_IDS = {
  NO_JUNK_FOOD: 'no-junk-food',
  FIRST_THING_WATER: 'first-thing-water',
  NO_SUGAR: 'no-sugar',
} as const;

// ── Default challenge definitions (enabled: false on first use) ──

export function createDefaultChallenges(todayNepali: string): Challenge[] {
  return [
    {
      id: DEFAULT_CHALLENGE_IDS.NO_JUNK_FOOD,
      name: 'No Junk Food',
      icon: '🍔',
      type: 'default',
      enabled: false,
      enabledDate: todayNepali,
      createdDate: todayNepali,
      order: 0,
      reminderTime: 'evening',
    },
    {
      id: DEFAULT_CHALLENGE_IDS.FIRST_THING_WATER,
      name: 'First Thing Water',
      icon: '💧',
      type: 'default',
      enabled: false,
      enabledDate: todayNepali,
      createdDate: todayNepali,
      order: 1,
      reminderTime: 'morning',
    },
    {
      id: DEFAULT_CHALLENGE_IDS.NO_SUGAR,
      name: 'No Sugar',
      icon: '🍬',
      type: 'default',
      enabled: false,
      enabledDate: todayNepali,
      createdDate: todayNepali,
      order: 2,
      reminderTime: 'evening',
    },
  ];
}

// ── Max challenges limit ──

export const MAX_CHALLENGES = 10;

// ── Curated emoji options for custom challenges ──

export const EMOJI_OPTIONS = [
  '🏃', '💪', '🥗', '🧘', '💧', '🚫', '⏰', '📚', '🎯', '🧠',
  '🍎', '🥦', '🚶', '🛌', '🧹', '💊', '🚭', '🍵', '☀️', '🌙',
  '✍️', '🎵', '🧘‍♀️', '🚴', '🏋️', '🥤', '🍬', '🍔', '📱', '🧘‍♂️',
];
