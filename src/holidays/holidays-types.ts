// Holiday entity types

/**
 * Holiday entity
 * Loaded from external JSON file
 */
export interface Holiday {
  name: string;             // Holiday name (Nepali or English)
  date: string;             // Format: YYYY-MM-DD (BS)
  description?: string;     // Optional additional details
}

/**
 * Holiday storage structure
 * Organized by year for efficient lookup
 */
export interface HolidayStorage {
  [year: string]: Holiday[];
}
