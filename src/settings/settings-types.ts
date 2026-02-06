// Settings entity types and defaults

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
 * All settings persist in localStorage
 */
export interface Settings {
  weekend: WeekendConfig;
  sidebarPosition: SidebarPosition;
  sidebarEnabled: boolean;
  themeType: ThemeType;
  backgroundColor?: string;      // Hex color (e.g., "#ffffff")
  backgroundImage?: string;      // Data URL or external URL
}

/**
 * Default settings applied on first load
 */
export const DEFAULT_SETTINGS: Settings = {
  weekend: 'both',
  sidebarPosition: 'right',
  sidebarEnabled: true,
  themeType: 'none',
  backgroundColor: '#ffffff',
};
