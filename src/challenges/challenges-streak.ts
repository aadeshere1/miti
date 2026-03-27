// Streak calculation service — tracks consecutive days of challenge completion

import { getItem, setItem } from '../utils/storage';
import { getEnabledChallenges, getCompletionsForDate } from './challenges-storage';
import { convertGregorianToNepali, convertNepaliToGregorian } from '../calendar/conversions';
import type { StreakStats, Milestone } from './challenges-types';
import { STREAK_STATS_KEY, MILESTONES } from './challenges-types';

// ── Streak stats persistence ──

export function getStreakStats(): StreakStats {
  const stored = getItem<StreakStats>(STREAK_STATS_KEY);
  if (stored) return stored;
  return { bestStreak: 0, earnedBadges: [], seenCelebrations: [] };
}

export function saveStreakStats(stats: StreakStats): void {
  setItem(STREAK_STATS_KEY, stats);
}

// ── Streak calculation ──

function getTodayNepaliStr(): string {
  const today = new Date();
  const np = convertGregorianToNepali(today);
  return `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
}

function getPreviousNepaliDate(nepaliDateStr: string): string {
  const parts = nepaliDateStr.split('-').map(Number);
  const gregorian = convertNepaliToGregorian({ year: parts[0], month: parts[1], day: parts[2], dayOfWeek: 0 });
  const prevGregorian = new Date(gregorian.getTime() - 86400000);
  const prevNepali = convertGregorianToNepali(prevGregorian);
  return `${prevNepali.year}-${String(prevNepali.month).padStart(2, '0')}-${String(prevNepali.day).padStart(2, '0')}`;
}

function isAllCompleteForDate(nepaliDate: string): boolean {
  const enabled = getEnabledChallenges();
  if (enabled.length === 0) return false;
  const completions = getCompletionsForDate(nepaliDate);
  return enabled.every(c => completions[c.id]);
}

export function calculateCurrentStreak(): number {
  const enabled = getEnabledChallenges();
  if (enabled.length === 0) return 0;

  const todayStr = getTodayNepaliStr();
  let streak = 0;
  let checkDate = todayStr;

  // Check if today is complete; if not, start from yesterday
  if (isAllCompleteForDate(todayStr)) {
    streak = 1;
    checkDate = getPreviousNepaliDate(todayStr);
  } else {
    checkDate = getPreviousNepaliDate(todayStr);
  }

  // Walk backward through consecutive complete days (max 30)
  for (let i = 0; i < 30; i++) {
    if (isAllCompleteForDate(checkDate)) {
      streak++;
      checkDate = getPreviousNepaliDate(checkDate);
    } else {
      break;
    }
  }

  return streak;
}

// ── Milestone helpers ──

export function getNextMilestone(currentStreak: number): Milestone | null {
  for (const milestone of MILESTONES) {
    if (currentStreak < milestone.days) {
      return milestone;
    }
  }
  return null;
}

export function getNewlyAchievedMilestones(currentStreak: number, stats: StreakStats): Milestone[] {
  return MILESTONES.filter(m =>
    currentStreak >= m.days &&
    !stats.earnedBadges.includes(m.id)
  );
}

export function updateStreakStats(currentStreak: number, stats: StreakStats): StreakStats {
  const updated = { ...stats };

  // Update best streak
  if (currentStreak > updated.bestStreak) {
    updated.bestStreak = currentStreak;
  }

  // Add newly earned badges (never remove existing ones)
  for (const milestone of MILESTONES) {
    if (currentStreak >= milestone.days && !updated.earnedBadges.includes(milestone.id)) {
      updated.earnedBadges.push(milestone.id);
    }
  }

  return updated;
}
