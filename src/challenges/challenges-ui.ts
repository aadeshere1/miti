// Challenge indicator rendering on calendar date cells

import { getEnabledChallenges, getCompletionsForDate, toggleCompletion } from './challenges-storage';
import { convertGregorianToNepali } from '../calendar/conversions';
import { openChallengesPopover } from './challenges-popover';

const COMPACT_THRESHOLD = 4;

// ── Today cache (avoid repeated conversions within a single render pass) ──

let _todayCache: string | null = null;
let _todayCacheTime = 0;

function getTodayNepali(): string {
  const now = Date.now();
  if (_todayCache && now - _todayCacheTime < 60000) {
    return _todayCache;
  }
  const today = new Date();
  const np = convertGregorianToNepali(today);
  _todayCache = `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
  _todayCacheTime = now;
  return _todayCache;
}

/**
 * Add challenge indicators to a date cell element.
 * - Today: interactive toggleable indicators
 * - Past dates (on or after enabledDate): read-only completed/missed
 * - Future dates or before enabledDate: nothing
 */
export function addChallengeIndicators(
  cellElement: HTMLElement,
  nepaliDate: string,
  isToday: boolean,
  isCurrentMonth: boolean,
): void {
  if (!isCurrentMonth) return;

  const enabled = getEnabledChallenges();
  if (enabled.length === 0) return;

  const todayStr = getTodayNepali();
  const isPast = !isToday && nepaliDate < todayStr;
  const isFuture = !isToday && nepaliDate > todayStr;

  if (isFuture) return;

  const applicable = enabled;
  if (applicable.length === 0) return;

  const completions = getCompletionsForDate(nepaliDate);
  const container = cellElement.querySelector('.challenge-indicators') as HTMLElement;
  if (!container) return;

  if (applicable.length > COMPACT_THRESHOLD) {
    // Render compact summary badge
    const completed = applicable.filter(c => completions[c.id]).length;
    const badge = document.createElement('span');
    badge.className = 'challenge-summary-badge';
    badge.textContent = `${completed}/${applicable.length}`;
    badge.title = 'Click to see all challenges';
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      openChallengesPopover(cellElement, nepaliDate, isToday);
    });
    container.appendChild(badge);
  } else {
    // Render individual emoji indicators
    applicable.forEach(challenge => {
      const icon = document.createElement('span');
      icon.className = 'challenge-icon';
      icon.textContent = challenge.icon;
      icon.title = challenge.name;
      icon.dataset.challengeId = challenge.id;

      const isCompleted = !!completions[challenge.id];

      if (isCompleted) {
        icon.classList.add('challenge-completed');
      }

      if (isPast) {
        icon.classList.add('challenge-readonly');
        if (!isCompleted) {
          icon.classList.add('challenge-missed');
        }
      } else if (isToday) {
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          const newState = toggleCompletion(challenge.id, nepaliDate);
          icon.classList.toggle('challenge-completed', newState);
        });
      }

      container.appendChild(icon);
    });
  }
}

/**
 * Refresh challenge indicators on all visible date cells
 * without a full calendar re-render.
 */
export function refreshChallengeIndicators(): void {
  const gridElement = document.getElementById('calendar-grid');
  if (!gridElement) return;

  const cells = gridElement.querySelectorAll('.date-cell');
  cells.forEach(cell => {
    const cellEl = cell as HTMLElement;
    const nepaliDate = cellEl.dataset.nepaliDate;
    if (!nepaliDate) return;

    const container = cellEl.querySelector('.challenge-indicators');
    if (container) {
      container.innerHTML = '';
    }

    const isToday = cellEl.classList.contains('today');
    const isCurrentMonth = !cellEl.classList.contains('other-month');
    addChallengeIndicators(cellEl, nepaliDate, isToday, isCurrentMonth);
  });
}
