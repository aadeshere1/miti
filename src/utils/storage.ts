// localStorage wrapper utilities with quota checking and error handling
// Per FR-028: Graceful handling of localStorage quota errors

/**
 * Storage quota estimate
 */
export interface StorageEstimate {
  used: number;    // Bytes used
  total: number;   // Total bytes available (estimated)
  percentage: number;  // Usage percentage
}

/**
 * Get approximate localStorage usage for miti: keys
 * @returns Storage estimate with used, total, and percentage
 */
export function getStorageEstimate(): StorageEstimate {
  let used = 0;

  // Calculate size of all miti: keys
  for (let key in localStorage) {
    if (key.startsWith('miti:')) {
      // Each character in UTF-16 is 2 bytes
      used += (localStorage[key].length + key.length) * 2;
    }
  }

  // Conservative estimate: 5MB total (varies by browser, typically 5-10MB)
  const total = 5 * 1024 * 1024;
  const percentage = (used / total) * 100;

  return { used, total, percentage };
}

/**
 * Check if storage has capacity for additional data
 * @param additionalBytes Bytes to check
 * @returns true if capacity available, false if would exceed limit
 */
export function canStore(additionalBytes: number): boolean {
  const { used, total } = getStorageEstimate();
  return (used + additionalBytes) < total;
}

/**
 * Safe wrapper for localStorage.setItem with quota error handling
 * @param key localStorage key
 * @param value Value to store (will be stringified if object)
 * @throws Error with user-friendly message if quota exceeded
 */
export function setItem(key: string, value: any): void {
  try {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valueStr);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage is full. Please delete old notes or background images to free up space.');
    }
    throw e;
  }
}

/**
 * Safe wrapper for localStorage.getItem with parsing
 * @param key localStorage key
 * @param defaultValue Default value if key not found
 * @returns Parsed value or default
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue ?? null;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value) as T;
    } catch {
      // Return as-is if not valid JSON
      return value as unknown as T;
    }
  } catch (e) {
    console.error(`Error reading from localStorage: ${key}`, e);
    return defaultValue ?? null;
  }
}

/**
 * Safe wrapper for localStorage.removeItem
 * @param key localStorage key
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing from localStorage: ${key}`, e);
  }
}

/**
 * Check if localStorage is available and enabled
 * @returns true if localStorage is accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = 'miti:storage-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check localStorage usage and warn if at or over 80% capacity (T118)
 * @returns true if usage is within acceptable limits, false if at/over 80%
 */
export function checkStorageUsage(): boolean {
  const { used, total, percentage } = getStorageEstimate();

  if (percentage >= 80) {
    const usedMB = (used / 1024 / 1024).toFixed(2);
    const totalMB = (total / 1024 / 1024).toFixed(2);

    console.warn(
      `⚠️  localStorage usage is at ${percentage.toFixed(1)}% ` +
      `(${usedMB} MB / ${totalMB} MB). ` +
      `Consider deleting old notes or clearing theme images to free up space.`
    );

    return false;
  }

  return true;
}

/**
 * Format bytes to human-readable string (T118)
 * @param bytes Number of bytes
 * @returns Formatted string (e.g., "1.5 MB", "512 KB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
