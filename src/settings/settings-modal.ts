// Settings Modal component for app configuration

import { Modal } from '../components/Modal';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from './settings-storage';
import type { Settings, WeekendConfig, SidebarPosition } from './settings-types';

/**
 * SettingsModal class for managing app settings (T048)
 */
export class SettingsModal extends Modal {
  private onSettingsChangeCallback?: () => void;

  constructor() {
    super('settings-modal');
    this.setupModalContent();
  }

  /**
   * Open the settings modal
   */
  public open(): void {
    this.loadSettings();
    super.open();
  }

  /**
   * Register callback for settings changes
   */
  public onSettingsChange(callback: () => void): void {
    this.onSettingsChangeCallback = callback;
  }

  /**
   * Setup modal content structure (T048)
   */
  protected setupModalContent(): void {
    const content = this.getContentElement();

    content.innerHTML = `
      <div class="modal-header">
        <h2 id="settings-modal-title">Settings</h2>
        <button class="modal-close" aria-label="Close settings">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Sidebar Configuration Section (T049) -->
        <section class="settings-section">
          <h3>Sidebar Configuration</h3>

          <div class="setting-group">
            <label class="setting-label">Position</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="sidebar-position" value="left" />
                <span>Left</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="sidebar-position" value="right" />
                <span>Right</span>
              </label>
            </div>
          </div>

          <div class="setting-group">
            <label class="checkbox-label">
              <input type="checkbox" id="sidebar-enabled" />
              <span>Show sidebar</span>
            </label>
          </div>
        </section>

        <!-- Weekend Configuration Section -->
        <section class="settings-section">
          <h3>Weekend Configuration</h3>

          <div class="setting-group">
            <label class="setting-label">Weekend Days</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="weekend-config" value="sunday" />
                <span>Sunday only</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="weekend-config" value="saturday" />
                <span>Saturday only</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="weekend-config" value="both" />
                <span>Both</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Theme Customization Section (T075) -->
        <section class="settings-section">
          <h3>Theme Customization</h3>

          <div class="setting-group">
            <label class="setting-label">Theme Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="theme-type" value="none" />
                <span>None (Default)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="theme-type" value="color" />
                <span>Background Color</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="theme-type" value="image" />
                <span>Background Image</span>
              </label>
            </div>
          </div>

          <!-- T076: Color picker -->
          <div class="setting-group" id="color-theme-group">
            <label class="setting-label" for="theme-color">Background Color</label>
            <input type="color" id="theme-color" class="color-picker" value="#ffffff" />
          </div>

          <!-- T077: Image URL input -->
          <div class="setting-group" id="image-url-group">
            <label class="setting-label" for="theme-image-url">Image URL</label>
            <input type="url" id="theme-image-url" class="modal-input" placeholder="https://example.com/image.jpg" />
          </div>

          <!-- T078: File upload -->
          <div class="setting-group" id="image-upload-group">
            <label class="setting-label" for="theme-image-file">Upload Image (max 2MB)</label>
            <input type="file" id="theme-image-file" class="file-input" accept="image/*" />
            <div class="file-input-note">JPG, PNG, or GIF - max 2MB</div>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button class="modal-button" id="reset-settings-btn">
          Reset to Defaults
        </button>
        <button class="modal-button modal-button-primary" id="close-settings-btn">
          Close
        </button>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to form elements
   */
  private attachEventListeners(): void {
    const content = this.getContentElement();

    // Close button
    content.querySelector('.modal-close')?.addEventListener('click', () => this.close());
    content.querySelector('#close-settings-btn')?.addEventListener('click', () => this.close());

    // Reset button
    content.querySelector('#reset-settings-btn')?.addEventListener('click', () => this.handleReset());

    // Sidebar position radio buttons (T050)
    const positionRadios = content.querySelectorAll('input[name="sidebar-position"]');
    positionRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleSidebarPositionChange(e));
    });

    // Sidebar visibility checkbox (T051)
    const enabledCheckbox = content.querySelector('#sidebar-enabled') as HTMLInputElement;
    enabledCheckbox?.addEventListener('change', (e) => this.handleSidebarVisibilityToggle(e));

    // Weekend configuration radio buttons
    const weekendRadios = content.querySelectorAll('input[name="weekend-config"]');
    weekendRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleWeekendChange(e));
    });

    // Theme type radio buttons (T075)
    const themeTypeRadios = content.querySelectorAll('input[name="theme-type"]');
    themeTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleThemeTypeChange(e));
    });

    // T079: Color picker
    const colorInput = content.querySelector('#theme-color') as HTMLInputElement;
    colorInput?.addEventListener('change', (e) => this.handleColorChange(e));

    // T080: Image URL input
    const imageUrlInput = content.querySelector('#theme-image-url') as HTMLInputElement;
    imageUrlInput?.addEventListener('change', (e) => this.handleImageUrlChange(e));

    // T081: File upload
    const imageFileInput = content.querySelector('#theme-image-file') as HTMLInputElement;
    imageFileInput?.addEventListener('change', (e) => this.handleImageUpload(e));
  }

  /**
   * Load current settings into form (T048)
   */
  private loadSettings(): void {
    const settings = getSettings();
    const content = this.getContentElement();

    // Set sidebar position
    const positionRadio = content.querySelector(
      `input[name="sidebar-position"][value="${settings.sidebarPosition}"]`
    ) as HTMLInputElement;
    if (positionRadio) positionRadio.checked = true;

    // Set sidebar visibility
    const enabledCheckbox = content.querySelector('#sidebar-enabled') as HTMLInputElement;
    if (enabledCheckbox) enabledCheckbox.checked = settings.sidebarEnabled;

    // Set weekend configuration
    const weekendRadio = content.querySelector(
      `input[name="weekend-config"][value="${settings.weekend}"]`
    ) as HTMLInputElement;
    if (weekendRadio) weekendRadio.checked = true;

    // Set theme type
    const themeTypeRadio = content.querySelector(
      `input[name="theme-type"][value="${settings.themeType}"]`
    ) as HTMLInputElement;
    if (themeTypeRadio) themeTypeRadio.checked = true;

    // Set theme values
    const colorInput = content.querySelector('#theme-color') as HTMLInputElement;
    if (colorInput && settings.backgroundColor) {
      colorInput.value = settings.backgroundColor;
    }

    const imageUrlInput = content.querySelector('#theme-image-url') as HTMLInputElement;
    if (imageUrlInput && settings.backgroundImage && !settings.backgroundImage.startsWith('data:')) {
      imageUrlInput.value = settings.backgroundImage;
    }

    // Update theme inputs visibility
    this.updateThemeInputsVisibility(settings.themeType);
  }

  /**
   * Handle sidebar position change (T050)
   */
  private handleSidebarPositionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const position = input.value as SidebarPosition;

    updateSettings({ sidebarPosition: position });
    this.notifyChange();
  }

  /**
   * Handle sidebar visibility toggle (T051)
   */
  private handleSidebarVisibilityToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const enabled = input.checked;

    updateSettings({ sidebarEnabled: enabled });
    this.notifyChange();
  }

  /**
   * Handle weekend configuration change
   */
  private handleWeekendChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const weekend = input.value as WeekendConfig;

    updateSettings({ weekend });
    this.notifyChange();
  }

  /**
   * Handle theme type change (T075)
   */
  private handleThemeTypeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const themeType = input.value as 'none' | 'color' | 'image';

    updateSettings({ themeType });
    this.updateThemeInputsVisibility(themeType);
    this.notifyChange();
  }

  /**
   * Handle color picker change (T079)
   */
  private handleColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;

    // Basic hex color validation
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      updateSettings({ backgroundColor: color, themeType: 'color' });
      this.notifyChange();
    }
  }

  /**
   * Handle image URL change (T080)
   */
  private handleImageUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value.trim();

    if (url) {
      try {
        new URL(url); // Validate URL
        updateSettings({ backgroundImage: url, themeType: 'image' });
        this.notifyChange();
      } catch (error) {
        alert('Please enter a valid URL');
      }
    }
  }

  /**
   * Handle image file upload (T081)
   */
  private async handleImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Check file size (2MB limit)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert('Image file is too large. Maximum size is 2MB.');
      input.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, or GIF).');
      input.value = '';
      return;
    }

    // Convert to data URL using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateSettings({ backgroundImage: dataUrl, themeType: 'image' });
      this.notifyChange();
    };
    reader.onerror = () => {
      alert('Failed to read image file. Please try again.');
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  /**
   * Update visibility of theme input groups based on theme type
   */
  private updateThemeInputsVisibility(themeType: string): void {
    const content = this.getContentElement();
    const colorGroup = content.querySelector('#color-theme-group') as HTMLElement;
    const imageUrlGroup = content.querySelector('#image-url-group') as HTMLElement;
    const imageUploadGroup = content.querySelector('#image-upload-group') as HTMLElement;

    if (colorGroup && imageUrlGroup && imageUploadGroup) {
      colorGroup.style.display = themeType === 'color' ? 'block' : 'none';
      imageUrlGroup.style.display = themeType === 'image' ? 'block' : 'none';
      imageUploadGroup.style.display = themeType === 'image' ? 'block' : 'none';
    }
  }

  /**
   * Handle reset to defaults
   */
  private handleReset(): void {
    if (confirm('Reset all settings to defaults?')) {
      updateSettings(DEFAULT_SETTINGS);
      this.loadSettings();
      this.notifyChange();
    }
  }

  /**
   * Notify that settings have changed
   */
  private notifyChange(): void {
    if (this.onSettingsChangeCallback) {
      this.onSettingsChangeCallback();
    }
  }
}
