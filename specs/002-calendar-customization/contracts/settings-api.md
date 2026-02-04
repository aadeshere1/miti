# Settings API Contract

**Module**: `src/settings/settings-storage.ts`
**Purpose**: Manage user preferences with localStorage persistence

## TypeScript Interface

```typescript
/**
 * Settings Storage API
 * Provides read/write operations for application settings
 */
export interface SettingsAPI {
  /**
   * Get current settings (returns defaults if not set)
   * @returns Settings object with all configuration
   */
  getSettings(): Settings;

  /**
   * Update settings (partial update supported)
   * @param updates - Partial settings object with fields to update
   * @throws ValidationError if invalid values provided
   */
  updateSettings(updates: Partial<Settings>): void;

  /**
   * Reset settings to defaults
   */
  resetSettings(): void;

  /**
   * Get a specific setting value
   * @param key - Setting key
   * @returns Setting value
   */
  getSetting<K extends keyof Settings>(key: K): Settings[K];

  /**
   * Check if weekend is configured for a specific day
   * @param dayOfWeek - 0 (Sunday) to 6 (Saturday)
   * @returns true if day is configured as weekend
   */
  isWeekend(dayOfWeek: number): boolean;
}

/**
 * Weekend configuration options
 */
export type WeekendConfig = 'sunday' | 'saturday' | 'both';

/**
 * Sidebar position options
 */
export type SidebarPosition = 'left' | 'right';

/**
 * Theme type options
 */
export type ThemeType = 'color' | 'image' | 'none';

/**
 * Settings entity
 */
export interface Settings {
  weekend: WeekendConfig;
  sidebarPosition: SidebarPosition;
  sidebarEnabled: boolean;
  themeType: ThemeType;
  backgroundColor?: string;      // Hex color (e.g., "#ffffff")
  backgroundImage?: string;      // Data URL or external URL
}
```

## Default Values

```typescript
export const DEFAULT_SETTINGS: Settings = {
  weekend: 'both',
  sidebarPosition: 'right',
  sidebarEnabled: true,
  themeType: 'none',
  backgroundColor: '#ffffff',
  backgroundImage: undefined
};
```

## Usage Examples

### Get all settings
```typescript
import { getSettings } from './settings-storage';

const settings = getSettings();
console.log('Weekend:', settings.weekend);
console.log('Sidebar:', settings.sidebarEnabled ? 'visible' : 'hidden');
```

### Update settings (partial)
```typescript
import { updateSettings } from './settings-storage';

// Update only weekend configuration
updateSettings({ weekend: 'sunday' });

// Update multiple settings
updateSettings({
  sidebarPosition: 'left',
  sidebarEnabled: false
});
```

### Check if a day is weekend
```typescript
import { isWeekend } from './settings-storage';

// Check if Sunday (0) is weekend
if (isWeekend(0)) {
  console.log('Sunday is configured as weekend');
}

// Check if Saturday (6) is weekend
if (isWeekend(6)) {
  console.log('Saturday is configured as weekend');
}
```

### Reset to defaults
```typescript
import { resetSettings } from './settings-storage';

resetSettings();
console.log('Settings reset to defaults');
```

### Apply theme settings
```typescript
import { getSettings } from './settings-storage';

const settings = getSettings();

if (settings.themeType === 'color' && settings.backgroundColor) {
  document.body.style.backgroundColor = settings.backgroundColor;
} else if (settings.themeType === 'image' && settings.backgroundImage) {
  document.body.style.backgroundImage = `url(${settings.backgroundImage})`;
}
```

## Validation Rules

### Weekend Configuration
```typescript
const validWeekends: WeekendConfig[] = ['sunday', 'saturday', 'both'];

if (!validWeekends.includes(weekend)) {
  throw new ValidationError('Invalid weekend configuration');
}
```

### Sidebar Position
```typescript
const validPositions: SidebarPosition[] = ['left', 'right'];

if (!validPositions.includes(position)) {
  throw new ValidationError('Invalid sidebar position');
}
```

### Background Color
```typescript
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

if (backgroundColor && !hexColorRegex.test(backgroundColor)) {
  throw new ValidationError('Invalid hex color format');
}
```

### Background Image
```typescript
// Validate data URL or HTTP(S) URL
const urlRegex = /^(data:image\/[^;]+;base64,|https?:\/\/).+$/;

if (backgroundImage && !urlRegex.test(backgroundImage)) {
  throw new ValidationError('Invalid image URL format');
}
```

## Storage Format

```json
{
  "miti:settings": {
    "weekend": "both",
    "sidebarPosition": "right",
    "sidebarEnabled": true,
    "themeType": "color",
    "backgroundColor": "#f0f0f0",
    "backgroundImage": null
  }
}
```

## Weekend Day Mapping

Helper function for weekend determination:

```typescript
/**
 * Check if a day of week is configured as weekend
 * @param dayOfWeek - 0 (Sunday) to 6 (Saturday)
 * @param config - Weekend configuration
 * @returns true if day is weekend
 */
export function isWeekendDay(
  dayOfWeek: number,
  config: WeekendConfig
): boolean {
  switch (config) {
    case 'sunday':
      return dayOfWeek === 0;
    case 'saturday':
      return dayOfWeek === 6;
    case 'both':
      return dayOfWeek === 0 || dayOfWeek === 6;
    default:
      return false;
  }
}
```

## Performance Characteristics

- **getSettings**: O(1) - Single localStorage read with JSON parse
- **updateSettings**: O(1) - Read, merge, write
- **resetSettings**: O(1) - Write default values
- **getSetting**: O(1) - Read and extract field
- **isWeekend**: O(1) - Read settings and check day

## Events

Settings changes trigger storage events for multi-tab sync:

```typescript
// Other tabs listen for settings changes
window.addEventListener('storage', (e) => {
  if (e.key === 'miti:settings' && e.newValue) {
    const newSettings = JSON.parse(e.newValue);
    applySettings(newSettings);
  }
});
```
