// Challenge reminder service — window check, active reminders, dismiss logic

import type { Challenge, ReminderTimeWindow } from './challenges-types';
import { getEnabledChallenges, getCompletionsForDate } from './challenges-storage';
import { convertGregorianToNepali } from '../calendar/conversions';

// ── In-memory dismissed set (session-only, clears on page reload) ──

const dismissedReminders = new Set<string>();

export function dismissReminder(challengeId: string): void {
  dismissedReminders.add(challengeId);
}

export function isReminderDismissed(challengeId: string): boolean {
  return dismissedReminders.has(challengeId);
}

// ── Reminder window check ──

const WINDOW_RANGES: Record<Exclude<ReminderTimeWindow, 'none'>, [number, number]> = {
  'morning': [5, 10],
  'afternoon': [11, 16],
  'evening': [17, 22],
  'all-day': [0, 24],
};

export function isInReminderWindow(window: ReminderTimeWindow): boolean {
  if (window === 'none') return false;
  const hour = new Date().getHours();
  const [start, end] = WINDOW_RANGES[window];
  return hour >= start && hour < end;
}

// ── Active reminders ──

function getTodayNepali(): string {
  const today = new Date();
  const np = convertGregorianToNepali(today);
  return `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
}

export function getActiveReminders(): Challenge[] {
  const enabled = getEnabledChallenges();
  const todayStr = getTodayNepali();
  const completions = getCompletionsForDate(todayStr);

  return enabled.filter(challenge => {
    if (completions[challenge.id]) return false;
    if (isReminderDismissed(challenge.id)) return false;
    if (!isInReminderWindow(challenge.reminderTime)) return false;
    return true;
  });
}
