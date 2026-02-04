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
