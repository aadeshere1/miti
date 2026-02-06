// Note entity types and constants

export interface Note {
  id: string;              // UUID v4
  text: string;            // Max 5000 characters
  timestamp: number;       // Last modified (Unix ms)
  created: number;         // Creation time (Unix ms)
  modified: number;        // Last modified (Unix ms)
}

/**
 * Maximum character limit for note text
 * Per FR-030: 5,000 characters per note
 */
export const MAX_NOTE_LENGTH = 5000;
