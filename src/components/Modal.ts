// Reusable Modal base class with accessibility features
// Implements: backdrop, ESC key, focus trap, ARIA attributes

export class Modal {
  protected modalElement: HTMLElement;
  protected backdropElement: HTMLElement;
  protected contentElement: HTMLElement;
  protected isOpen: boolean = false;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(modalId: string) {
    // Create modal structure
    this.modalElement = document.createElement('div');
    this.modalElement.id = modalId;
    this.modalElement.className = 'modal';
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('aria-hidden', 'true');

    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'modal-backdrop';
    this.backdropElement.addEventListener('click', () => this.close());

    // Create content container
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'modal-content';
    this.contentElement.addEventListener('click', (e) => e.stopPropagation());

    // Assemble modal
    this.modalElement.appendChild(this.backdropElement);
    this.modalElement.appendChild(this.contentElement);

    // Add to DOM
    document.body.appendChild(this.modalElement);

    // Bind keyboard events
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Open the modal
   */
  public open(): void {
    if (this.isOpen) return;

    // Store currently focused element
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Show modal
    this.isOpen = true;
    this.modalElement.classList.add('visible');
    this.modalElement.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    // Focus first focusable element
    this.trapFocus();

    // Add keyboard listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Close the modal
   */
  public close(): void {
    if (!this.isOpen) return;

    // Hide modal
    this.isOpen = false;
    this.modalElement.classList.remove('visible');
    this.modalElement.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  /**
   * Get the content container element
   * Subclasses can add their content here
   */
  protected getContentElement(): HTMLElement {
    return this.contentElement;
  }

  /**
   * Handle keyboard events (ESC key)
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }

    // Handle Tab for focus trapping
    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  /**
   * Trap focus within modal
   */
  private trapFocus(): void {
    const focusableElements = this.modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  /**
   * Handle Tab key for focus cycling
   */
  private handleTabKey(event: KeyboardEvent): void {
    const focusableElements = this.modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab: cycle backwards
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab: cycle forwards
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Destroy the modal (remove from DOM)
   */
  public destroy(): void {
    if (this.isOpen) {
      this.close();
    }
    this.modalElement.remove();
  }
}
