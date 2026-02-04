// Theme management for calendar customization

import { getSettings } from '../settings/settings-storage';

/**
 * ThemeManager class handles theme application and text legibility (T082)
 */
export class ThemeManager {
  private calendarContainer: HTMLElement | null = null;

  /**
   * Initialize theme manager with calendar container element
   */
  constructor() {
    this.calendarContainer = document.querySelector('.calendar-container');
  }

  /**
   * Apply theme based on current settings (T082)
   */
  applyTheme(): void {
    if (!this.calendarContainer) return;

    const settings = getSettings();

    switch (settings.themeType) {
      case 'color':
        this.applyColorTheme(settings.backgroundColor || '#ffffff');
        break;
      case 'image':
        this.applyImageTheme(settings.backgroundImage || '');
        break;
      case 'none':
      default:
        this.removeTheme();
        break;
    }
  }

  /**
   * Apply color theme to calendar container (T083)
   */
  private applyColorTheme(color: string): void {
    if (!this.calendarContainer) return;

    // Remove image theme
    this.calendarContainer.style.backgroundImage = 'none';

    // Apply color
    this.calendarContainer.style.backgroundColor = color;

    // T086: Check text legibility and add overlay if needed
    this.ensureTextLegibility(color);
  }

  /**
   * Apply image theme to calendar container (T084)
   */
  private applyImageTheme(imageUrl: string): void {
    if (!this.calendarContainer || !imageUrl) return;

    // Remove color theme
    this.calendarContainer.style.backgroundColor = '';

    // Apply image with proper CSS
    this.calendarContainer.style.backgroundImage = `url('${imageUrl}')`;
    this.calendarContainer.style.backgroundSize = 'cover';
    this.calendarContainer.style.backgroundPosition = 'center';
    this.calendarContainer.style.backgroundRepeat = 'no-repeat';

    // T091: Add error handling for failed image loads
    this.validateImageLoad(imageUrl);

    // T086: Add overlay for text legibility
    this.addImageOverlay();
  }

  /**
   * Remove theme and reset to default (T085)
   */
  removeTheme(): void {
    if (!this.calendarContainer) return;

    this.calendarContainer.style.backgroundColor = '';
    this.calendarContainer.style.backgroundImage = 'none';
    this.removeImageOverlay();
  }

  /**
   * Ensure text legibility on colored backgrounds (T086)
   */
  private ensureTextLegibility(color: string): void {
    if (!this.calendarContainer) return;

    // Convert hex to RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return;

    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    // If background is dark (luminance < 0.5), add light overlay
    if (luminance < 0.5) {
      this.calendarContainer.classList.add('dark-theme');
    } else {
      this.calendarContainer.classList.remove('dark-theme');
    }

    this.removeImageOverlay();
  }

  /**
   * Add semi-transparent overlay for image backgrounds (T086)
   */
  private addImageOverlay(): void {
    if (!this.calendarContainer) return;

    this.calendarContainer.classList.add('image-theme');
  }

  /**
   * Remove image overlay
   */
  private removeImageOverlay(): void {
    if (!this.calendarContainer) return;

    this.calendarContainer.classList.remove('image-theme');
  }

  /**
   * Validate image URL loads successfully (T091)
   */
  private validateImageLoad(url: string): void {
    // Only validate HTTP URLs, not data URLs
    if (url.startsWith('data:')) return;

    const img = new Image();
    img.onerror = () => {
      console.error('Failed to load background image:', url);
      // Fall back to color or default
      const settings = getSettings();
      if (settings.backgroundColor) {
        this.applyColorTheme(settings.backgroundColor);
      } else {
        this.removeTheme();
      }
    };
    img.src = url;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();
