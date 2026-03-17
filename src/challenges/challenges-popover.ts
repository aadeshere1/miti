// Challenges popover for compact summary expansion (>4 challenges)

import { getEnabledChallenges, getCompletionsForDate, toggleCompletion } from './challenges-storage';
import { refreshChallengeIndicators } from './challenges-ui';

let activePopover: HTMLElement | null = null;
let outsideClickHandler: ((e: MouseEvent) => void) | null = null;
let escapeHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * Close the currently open popover, if any.
 */
export function closeChallengesPopover(): void {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
  if (outsideClickHandler) {
    document.removeEventListener('click', outsideClickHandler);
    outsideClickHandler = null;
  }
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
}

/**
 * Open a popover anchored to a date cell, listing all challenges
 * with toggleable checkboxes (today) or read-only status (past).
 */
export function openChallengesPopover(
  cellElement: HTMLElement,
  nepaliDate: string,
  isToday: boolean,
): void {
  // Close any existing popover first
  closeChallengesPopover();

  const enabled = getEnabledChallenges();
  const completions = getCompletionsForDate(nepaliDate);

  // Create popover element
  const popover = document.createElement('div');
  popover.className = 'challenges-popover';

  // Header
  const header = document.createElement('div');
  header.className = 'popover-header';
  header.textContent = isToday ? 'Today\'s Challenges' : 'Challenges';
  popover.appendChild(header);

  // Challenge rows
  enabled.forEach(challenge => {
    if (nepaliDate < challenge.enabledDate) return;

    const row = document.createElement('div');
    row.className = 'popover-challenge-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'popover-challenge-checkbox';
    checkbox.checked = !!completions[challenge.id];
    checkbox.disabled = !isToday;

    if (isToday) {
      checkbox.addEventListener('change', () => {
        toggleCompletion(challenge.id, nepaliDate);
        refreshChallengeIndicators();
      });
    }

    const icon = document.createElement('span');
    icon.className = 'popover-challenge-icon';
    icon.textContent = challenge.icon;

    const name = document.createElement('span');
    name.className = 'popover-challenge-name';
    name.textContent = challenge.name;

    row.appendChild(checkbox);
    row.appendChild(icon);
    row.appendChild(name);
    popover.appendChild(row);
  });

  // Position relative to cell
  const cellRect = cellElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  popover.style.position = 'absolute';
  popover.style.top = `${cellRect.bottom + scrollTop + 4}px`;
  popover.style.left = `${cellRect.left + scrollLeft}px`;

  document.body.appendChild(popover);
  activePopover = popover;

  // Adjust position if overflows viewport right edge
  const popoverRect = popover.getBoundingClientRect();
  if (popoverRect.right > window.innerWidth) {
    popover.style.left = `${window.innerWidth - popoverRect.width - 8 + scrollLeft}px`;
  }

  // Close on click outside (defer to avoid immediate trigger)
  setTimeout(() => {
    outsideClickHandler = (e: MouseEvent) => {
      if (!popover.contains(e.target as Node)) {
        closeChallengesPopover();
      }
    };
    document.addEventListener('click', outsideClickHandler);
  }, 0);

  // Close on Escape
  escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeChallengesPopover();
    }
  };
  document.addEventListener('keydown', escapeHandler);
}
