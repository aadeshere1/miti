// Today challenge checklist UI — renders in the streak sidebar panel

import { getEnabledChallenges, getCompletionsForDate, toggleCompletion } from './challenges-storage';
import { refreshChallengeIndicators } from './challenges-ui';
import { calculateCurrentStreak, getStreakStats, saveStreakStats, getNextMilestone, getNewlyAchievedMilestones, updateStreakStats } from './challenges-streak';
import { convertGregorianToNepali } from '../calendar/conversions';
import { MILESTONES } from './challenges-types';
import { getSetting } from '../settings/settings-storage';

function getTodayNepali(): string {
  const today = new Date();
  const np = convertGregorianToNepali(today);
  return `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
}

// ── Clear / Remove ──

export function clearTodayChecklist(): void {
  const streakSidebar = document.getElementById('streak-sidebar');
  if (streakSidebar) {
    streakSidebar.innerHTML = '';
  }
}

// ── Celebration banner element ──

function createCelebrationElement(milestone: typeof MILESTONES[0]): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'celebration-banner';
  banner.dataset.milestoneId = milestone.id;

  const badge = document.createElement('span');
  badge.className = 'celebration-badge';
  badge.textContent = milestone.badgeIcon;

  const content = document.createElement('div');
  content.className = 'celebration-content';

  const title = document.createElement('strong');
  title.className = 'celebration-title';
  title.textContent = `${milestone.badgeName} Badge Earned!`;

  const quote = document.createElement('p');
  quote.className = 'celebration-quote';
  quote.textContent = `"${milestone.quote}"`;

  content.appendChild(title);
  content.appendChild(quote);

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'celebration-dismiss';
  dismissBtn.title = 'Dismiss';
  dismissBtn.innerHTML = '&times;';
  dismissBtn.addEventListener('click', () => {
    const stats = getStreakStats();
    if (!stats.seenCelebrations.includes(milestone.id)) {
      stats.seenCelebrations.push(milestone.id);
      saveStreakStats(stats);
    }
    banner.classList.add('dismissing');
    setTimeout(() => banner.remove(), 300);
  });

  banner.appendChild(badge);
  banner.appendChild(content);
  banner.appendChild(dismissBtn);

  return banner;
}

// ── Main render ──

export function renderTodayChecklist(): void {
  clearTodayChecklist();

  const streakSidebar = document.getElementById('streak-sidebar');
  if (!streakSidebar) return;

  const enabled = getEnabledChallenges();
  const panelEnabled = getSetting('streakPanelEnabled') !== false;

  if (enabled.length === 0 || !panelEnabled) {
    streakSidebar.classList.add('sidebar-hidden');
    return;
  }

  streakSidebar.classList.remove('sidebar-hidden');

  const todayStr = getTodayNepali();
  const completions = getCompletionsForDate(todayStr);
  const streak = calculateCurrentStreak();

  // Update streak stats and check for new milestones
  let stats = getStreakStats();
  const newMilestones = getNewlyAchievedMilestones(streak, stats);
  stats = updateStreakStats(streak, stats);
  saveStreakStats(stats);

  // Sidebar header
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  const h3 = document.createElement('h3');
  h3.textContent = "Today's Challenges";
  header.appendChild(h3);

  // Sidebar content wrapper
  const content = document.createElement('div');
  content.className = 'sidebar-content streak-sidebar-content';

  // Show celebration banners for newly earned milestones (not yet seen)
  const unseenCelebrations = newMilestones.filter(m => !stats.seenCelebrations.includes(m.id));
  for (const milestone of unseenCelebrations) {
    content.appendChild(createCelebrationElement(milestone));
  }

  // Build checklist container
  const checklist = document.createElement('div');
  checklist.className = 'today-checklist';

  // Streak info row
  const streakInfo = document.createElement('div');
  streakInfo.className = 'streak-info';

  const streakCount = document.createElement('span');
  streakCount.className = 'streak-count';
  streakCount.textContent = streak > 0 ? `🔥 ${streak} day${streak !== 1 ? 's' : ''} streak` : '🔥 Start your streak!';

  streakInfo.appendChild(streakCount);

  if (stats.bestStreak > 0) {
    const streakBest = document.createElement('span');
    streakBest.className = 'streak-best';
    streakBest.textContent = `Best: ${stats.bestStreak}`;
    streakInfo.appendChild(streakBest);
  }

  const nextMilestone = getNextMilestone(streak);
  if (nextMilestone) {
    const streakNext = document.createElement('span');
    streakNext.className = 'streak-next';
    const daysLeft = nextMilestone.days - streak;
    streakNext.textContent = `${daysLeft} more day${daysLeft !== 1 ? 's' : ''} to ${nextMilestone.days}-day streak!`;
    streakInfo.appendChild(streakNext);
  }

  checklist.appendChild(streakInfo);

  // Badges row
  const badgesRow = document.createElement('div');
  badgesRow.className = 'streak-badges';
  for (const milestone of MILESTONES) {
    const badge = document.createElement('span');
    badge.className = 'streak-badge';
    badge.textContent = milestone.badgeIcon;
    if (stats.earnedBadges.includes(milestone.id)) {
      badge.classList.add('earned');
      badge.title = `${milestone.badgeName} - ${milestone.days} day streak`;
    } else {
      badge.classList.add('locked');
      badge.title = `${milestone.badgeName} - ${milestone.days} day streak (locked)`;
    }
    badgesRow.appendChild(badge);
  }
  checklist.appendChild(badgesRow);

  // Challenge items
  const list = document.createElement('div');
  list.className = 'today-challenge-list';

  enabled.forEach(challenge => {
    const item = document.createElement('label');
    item.className = 'today-challenge-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'today-challenge-checkbox';
    checkbox.dataset.challengeId = challenge.id;
    checkbox.checked = !!completions[challenge.id];
    checkbox.addEventListener('change', () => {
      toggleCompletion(challenge.id, todayStr);
      refreshChallengeIndicators();
      // Refresh streak display
      renderTodayChecklist();
    });

    const icon = document.createElement('span');
    icon.className = 'today-challenge-icon';
    icon.textContent = challenge.icon;

    const name = document.createElement('span');
    name.className = 'today-challenge-name';
    name.textContent = challenge.name;

    item.appendChild(checkbox);
    item.appendChild(icon);
    item.appendChild(name);
    list.appendChild(item);
  });

  checklist.appendChild(list);
  content.appendChild(checklist);

  streakSidebar.appendChild(header);
  streakSidebar.appendChild(content);
}

// ── Refresh (used for bidirectional sync from date cells) ──

export function refreshTodayChecklist(): void {
  const streakSidebar = document.getElementById('streak-sidebar');
  if (!streakSidebar) return;

  const existing = streakSidebar.querySelector('.today-checklist');
  if (!existing) {
    // If no checklist exists, render from scratch
    renderTodayChecklist();
    return;
  }

  const enabled = getEnabledChallenges();
  const panelEnabled = getSetting('streakPanelEnabled') !== false;

  if (enabled.length === 0 || !panelEnabled) {
    clearTodayChecklist();
    streakSidebar.classList.add('sidebar-hidden');
    return;
  }

  const todayStr = getTodayNepali();
  const completions = getCompletionsForDate(todayStr);

  // Update checkbox states
  const checkboxes = existing.querySelectorAll('.today-challenge-checkbox') as NodeListOf<HTMLInputElement>;
  checkboxes.forEach(cb => {
    const challengeId = cb.dataset.challengeId;
    if (challengeId) {
      cb.checked = !!completions[challengeId];
    }
  });

  // Update streak info
  const streak = calculateCurrentStreak();
  let stats = getStreakStats();
  stats = updateStreakStats(streak, stats);
  saveStreakStats(stats);

  const streakCountEl = existing.querySelector('.streak-count');
  if (streakCountEl) {
    streakCountEl.textContent = streak > 0 ? `🔥 ${streak} day${streak !== 1 ? 's' : ''} streak` : '🔥 Start your streak!';
  }

  const streakBestEl = existing.querySelector('.streak-best');
  if (streakBestEl) {
    streakBestEl.textContent = `Best: ${stats.bestStreak}`;
  } else if (stats.bestStreak > 0) {
    const streakInfoEl = existing.querySelector('.streak-info');
    if (streakInfoEl) {
      const best = document.createElement('span');
      best.className = 'streak-best';
      best.textContent = `Best: ${stats.bestStreak}`;
      streakInfoEl.appendChild(best);
    }
  }

  // Update next milestone text
  const nextMilestone = getNextMilestone(streak);
  const streakNextEl = existing.querySelector('.streak-next');
  if (nextMilestone) {
    const daysLeft = nextMilestone.days - streak;
    const text = `${daysLeft} more day${daysLeft !== 1 ? 's' : ''} to ${nextMilestone.days}-day streak!`;
    if (streakNextEl) {
      streakNextEl.textContent = text;
    }
  } else if (streakNextEl) {
    streakNextEl.textContent = '';
  }

  // Update badge states
  const badges = existing.querySelectorAll('.streak-badge');
  badges.forEach((badge, i) => {
    const milestone = MILESTONES[i];
    if (milestone) {
      badge.classList.toggle('earned', stats.earnedBadges.includes(milestone.id));
      badge.classList.toggle('locked', !stats.earnedBadges.includes(milestone.id));
    }
  });
}
