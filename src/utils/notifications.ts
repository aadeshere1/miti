// User notification utilities

/**
 * Show error notification (T107)
 * @param message Error message to display
 * @param duration Duration in ms (0 = manual close only)
 */
export function showErrorNotification(message: string, duration: number = 5000): void {
  const notification = document.getElementById('error-notification');
  const messageElement = document.getElementById('error-message');
  const closeButton = document.getElementById('error-close');

  if (!notification || !messageElement) return;

  // Set message
  messageElement.textContent = message;

  // Show notification
  notification.style.display = 'flex';

  // Set up close handler
  const closeHandler = () => {
    notification.style.display = 'none';
  };

  closeButton?.removeEventListener('click', closeHandler);
  closeButton?.addEventListener('click', closeHandler);

  // Auto-hide after duration (if specified)
  if (duration > 0) {
    setTimeout(() => {
      notification.style.display = 'none';
    }, duration);
  }
}

/**
 * Hide error notification
 */
export function hideErrorNotification(): void {
  const notification = document.getElementById('error-notification');
  if (notification) {
    notification.style.display = 'none';
  }
}
