// Challenge reminder banner UI — renders inline banners in the calendar container

import { getActiveReminders, dismissReminder } from './challenges-reminder';
import { toggleCompletion } from './challenges-storage';
import { convertGregorianToNepali } from '../calendar/conversions';

function getTodayNepali(): string {
  const today = new Date();
  const np = convertGregorianToNepali(today);
  return `${np.year}-${String(np.month).padStart(2, '0')}-${String(np.day).padStart(2, '0')}`;
}

export function clearReminders(): void {
  document.querySelectorAll('.challenge-reminder-banner').forEach(el => el.remove());
}

export function removeReminderBanner(challengeId: string): void {
  const banner = document.querySelector(`.challenge-reminder-banner[data-challenge-id="${challengeId}"]`);
  if (banner) {
    banner.classList.add('dismissing');
    setTimeout(() => banner.remove(), 300);
  }
}

export function renderReminders(): void {
  clearReminders();

  const reminders = getActiveReminders();
  if (reminders.length === 0) return;

  const calendarContainer = document.querySelector('.calendar-container');
  const calendarHeader = document.querySelector('.calendar-header');
  if (!calendarContainer || !calendarHeader) return;

  const todayStr = getTodayNepali();

  reminders.forEach(challenge => {
    const banner = document.createElement('div');
    banner.className = 'challenge-reminder-banner';
    banner.dataset.challengeId = challenge.id;

    const icon = document.createElement('span');
    icon.className = 'reminder-icon';
    icon.textContent = challenge.icon;

    const text = document.createElement('span');
    text.className = 'reminder-text';
    text.textContent = `Time to check: ${challenge.name}`;

    const actions = document.createElement('div');
    actions.className = 'reminder-actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'reminder-complete-btn';
    completeBtn.title = 'Mark as done';
    completeBtn.textContent = 'Complete';
    completeBtn.addEventListener('click', () => {
      toggleCompletion(challenge.id, todayStr);
      removeReminderBanner(challenge.id);
    });

    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'reminder-dismiss-btn';
    dismissBtn.title = 'Dismiss';
    dismissBtn.innerHTML = '&times;';
    dismissBtn.addEventListener('click', () => {
      dismissReminder(challenge.id);
      removeReminderBanner(challenge.id);
    });

    actions.appendChild(completeBtn);
    actions.appendChild(dismissBtn);

    banner.appendChild(icon);
    banner.appendChild(text);
    banner.appendChild(actions);

    // Insert after the calendar header
    calendarHeader.insertAdjacentElement('afterend', banner);
  });
}
