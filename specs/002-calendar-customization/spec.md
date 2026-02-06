# Feature Specification: Calendar Customization and Note-Taking

**Feature Branch**: `002-calendar-customization`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "Implement calendar customization and note-taking features: 1. Weekend Configuration: Allow users to select which days are weekends (Sunday only, Saturday only, or both Saturday and Sunday). Display weekends in red color. 2. Theme Customization: Allow users to customize the calendar appearance with either a background color (color picker) or background image (image URL or file upload). Settings should persist across sessions. 3. Holiday Display: Load holidays from a JSON file for the current year. Display holiday names on the calendar. Show holidays in red color. JSON format should support multiple years with holiday name, date, and optional description. 4. Notes/Memo System: When user clicks on any date, open a modal or popup to add, edit, or delete notes for that date. Notes should be saved to browser localStorage. Support multiple notes per date with timestamps. 5. Chrome Extension: Convert the calendar app into a Chrome extension that loads on the browser's new tab page (landing page). Include proper manifest.json, icons, and extension permissions. 6. Notes Sidebar: Display a list of all notes for the currently displayed month in a sidebar panel. Allow configuration to: Choose sidebar position (left or right side), Enable or disable the notes list, Click on note to jump to that date. Settings should persist in localStorage. All settings and data should be stored in browser localStorage for persistence. The calendar should maintain all existing functionality (month view, navigation, date conversion) while adding these new features."

## User Scenarios & Testing

### User Story 1 - Personal Note Taking (Priority: P1)

As a calendar user, I want to click on any date and add personal notes or memos so that I can remember important events, tasks, or information associated with specific dates.

**Why this priority**: This is the core value proposition of the enhancement - transforming a read-only calendar into a personal organizational tool. Without notes functionality, the other features (sidebar, highlighting) have no content to display.

**Independent Test**: Can be fully tested by clicking any date, adding a note with text content, saving it, closing and reopening the browser, and verifying the note persists and displays correctly when clicking that date again.

**Acceptance Scenarios**:

1. **Given** I am viewing the calendar, **When** I click on any date cell, **Then** a modal/popup opens showing any existing notes for that date and an interface to add new notes
2. **Given** the notes modal is open, **When** I enter text and save a note, **Then** the note is stored in localStorage with a timestamp and the date cell shows a visual indicator that notes exist
3. **Given** I have added notes to a date, **When** I close and reopen the browser, **Then** the notes persist and are displayed when I click on that date again
4. **Given** I have multiple notes for one date, **When** I view that date's notes, **Then** all notes are displayed in chronological order with timestamps
5. **Given** I am viewing a note, **When** I choose to edit or delete it, **Then** the note is updated or removed from localStorage and the display updates accordingly

---

### User Story 2 - Month Notes Overview (Priority: P1)

As a calendar user, I want to see all notes for the current month in a sidebar panel so that I can quickly review my tasks and events without clicking through individual dates.

**Why this priority**: Provides essential discoverability and quick access to notes. Without this, users must remember which dates have notes and click each one individually. This is critical for the notes system to be practical.

**Independent Test**: Can be tested by adding notes to multiple dates in a month, verifying they all appear in the sidebar list, clicking a note in the sidebar to jump to that date, and testing that notes update in real-time when added/edited/deleted.

**Acceptance Scenarios**:

1. **Given** I have added notes to dates in the current month, **When** I view the calendar, **Then** a sidebar panel displays a list of all notes for that month with date labels
2. **Given** the notes sidebar is visible, **When** I click on a note entry in the sidebar, **Then** the calendar highlights that date and opens the notes modal for that date
3. **Given** I navigate to a different month, **When** the month changes, **Then** the sidebar updates to show only notes for the newly displayed month
4. **Given** I have no notes for the current month, **When** I view the sidebar, **Then** it displays a message indicating no notes exist for this month
5. **Given** I add, edit, or delete a note, **When** the note operation completes, **Then** the sidebar immediately updates to reflect the change

---

### User Story 3 - Sidebar Configuration (Priority: P2)

As a calendar user, I want to configure the notes sidebar position and visibility so that I can customize the layout to match my preferences and screen space.

**Why this priority**: Enhances usability and accommodates different user preferences and screen sizes, but the sidebar can function with default settings, making configuration secondary to core functionality.

**Independent Test**: Can be tested by accessing settings, changing sidebar position from right to left and back, toggling sidebar visibility on/off, refreshing the browser to verify settings persist, and confirming the calendar layout adjusts appropriately.

**Acceptance Scenarios**:

1. **Given** I access the sidebar configuration settings, **When** I select "Left" or "Right" for sidebar position, **Then** the sidebar immediately moves to the selected side and the setting persists in localStorage
2. **Given** I access the sidebar configuration, **When** I toggle "Enable/Disable" notes list, **Then** the sidebar visibility changes immediately and the setting persists across sessions
3. **Given** I have configured sidebar preferences, **When** I refresh the browser or navigate between months, **Then** my sidebar settings remain unchanged
4. **Given** the sidebar is disabled, **When** I add notes to dates, **Then** notes are still saved and accessible by clicking date cells, only the sidebar panel is hidden

---

### User Story 4 - Visual Date Highlighting (Priority: P2)

As a calendar user, I want weekends and holidays displayed in red color so that I can quickly identify non-working days and special occasions when planning.

**Why this priority**: Improves visual scanning and planning efficiency, but doesn't affect core functionality. Users can still use the calendar effectively without color coding.

**Independent Test**: Can be tested by configuring weekend settings (Sunday only, Saturday only, or both), verifying those days appear in red, loading a holiday JSON file, and confirming holidays display in red with their names visible.

**Acceptance Scenarios**:

1. **Given** I have configured weekend days, **When** I view any month, **Then** all weekend dates are displayed with red text color
2. **Given** a holiday JSON file is loaded, **When** I view a month containing holidays, **Then** holiday dates appear in red and display the holiday name
3. **Given** a date is both a weekend and a holiday, **When** I view that date, **Then** it displays in red showing the holiday name
4. **Given** a date has notes and is a weekend/holiday, **When** I view the calendar, **Then** the red color is preserved along with the notes indicator

---

### User Story 5 - Weekend Configuration (Priority: P2)

As a calendar user, I want to select which days are weekends (Sunday, Saturday, or both) so that the calendar reflects my work schedule and cultural context.

**Why this priority**: Important for international users and different work schedules, but a reasonable default (Saturday and Sunday) can be assumed, making explicit configuration a secondary enhancement.

**Independent Test**: Can be tested by accessing weekend settings, selecting "Sunday only", verifying only Sundays are highlighted in red, changing to "Saturday only", verifying the change, then selecting "Both" and confirming both days are highlighted, with settings persisting across browser sessions.

**Acceptance Scenarios**:

1. **Given** I access weekend configuration settings, **When** I select "Sunday only", **Then** only Sundays appear in red on the calendar and the setting persists in localStorage
2. **Given** I access weekend configuration, **When** I select "Saturday only", **Then** only Saturdays appear in red on the calendar and the setting persists
3. **Given** I access weekend configuration, **When** I select "Both Saturday and Sunday", **Then** both days appear in red and the setting persists
4. **Given** I have configured weekend preferences, **When** I navigate between months, **Then** the weekend highlighting remains consistent with my settings

---

### User Story 6 - Theme Customization (Priority: P3)

As a calendar user, I want to customize the calendar appearance with a background color or image so that I can personalize the visual experience to match my aesthetic preferences.

**Why this priority**: Pure aesthetic enhancement that doesn't affect functionality. Users can fully utilize all features with the default theme, making this the lowest priority.

**Independent Test**: Can be tested by selecting a background color via color picker and verifying it applies to the calendar container, then switching to an image background by entering a URL and confirming the image displays, with settings persisting in localStorage across sessions.

**Acceptance Scenarios**:

1. **Given** I access theme settings, **When** I select a background color using the color picker, **Then** the calendar container background changes to that color and the setting persists in localStorage
2. **Given** I access theme settings, **When** I enter a background image URL, **Then** the calendar container displays that image as the background and the setting persists
3. **Given** I access theme settings, **When** I upload a background image file, **Then** the image is stored in localStorage (as data URL) and applied as the background
4. **Given** I have a custom background, **When** I switch between background color and image, **Then** the new setting overrides the previous one and the calendar remains readable
5. **Given** I have customized the theme, **When** text needs to be displayed over the background, **Then** text remains legible with appropriate contrast or overlays

---

### User Story 7 - Holiday Management (Priority: P3)

As a calendar user, I want holidays loaded from a JSON file so that I can see relevant holidays for my region and year without manually entering them.

**Why this priority**: Convenient but not essential for core functionality. Users can track holidays using the notes system if automatic holiday loading isn't available.

**Independent Test**: Can be tested by loading a JSON file containing holidays for multiple years, navigating to months with holidays, verifying holiday names display on the correct dates in red, and confirming the JSON structure supports holiday name, date, and optional description fields.

**Acceptance Scenarios**:

1. **Given** a valid holiday JSON file is provided, **When** the calendar loads, **Then** holidays for the current year are parsed and stored
2. **Given** holidays are loaded, **When** I view a month containing holidays, **Then** each holiday date displays the holiday name and appears in red
3. **Given** I click on a holiday date, **When** the date modal opens, **Then** the holiday description (if available) is displayed along with any user notes
4. **Given** the JSON contains multiple years, **When** I navigate to different years, **Then** the appropriate holidays for each year are displayed
5. **Given** an invalid JSON file is provided, **When** the calendar attempts to load it, **Then** an error message is displayed and the calendar functions normally without holidays

---

### User Story 8 - Chrome Extension (Priority: P3)

As a calendar user, I want the calendar available as a Chrome extension on my new tab page so that I have immediate access to my calendar whenever I open a new browser tab.

**Why this priority**: Distribution mechanism rather than core functionality. The web app provides all features; the extension simply changes how users access it. This can be implemented last after all features are stable.

**Independent Test**: Can be tested by packaging the calendar as a Chrome extension, loading it in developer mode, opening a new tab to verify the calendar displays, testing that all features (notes, settings, navigation) work identically to the web app, and confirming the manifest.json includes proper permissions for localStorage.

**Acceptance Scenarios**:

1. **Given** the Chrome extension is installed, **When** I open a new browser tab, **Then** the Nepali calendar displays as the new tab page
2. **Given** the extension is active, **When** I add notes or change settings, **Then** all data persists in localStorage and is available across all new tabs
3. **Given** the extension is installed, **When** I use any calendar feature (navigation, notes, settings), **Then** all features function identically to the standalone web app
4. **Given** the extension requires permissions, **When** I install it, **Then** only necessary permissions are requested (storage for localStorage)
5. **Given** the extension is packaged, **When** I examine the extension files, **Then** it includes a valid manifest.json (v3 format), appropriate icons (multiple sizes), and all necessary assets

---

### Edge Cases

- What happens when localStorage is full or disabled? Display an error message to the user indicating that notes and settings cannot be saved, and provide guidance to enable localStorage or clear browser data.
- How does the system handle extremely long notes (e.g., 10,000+ characters)? Implement a character limit (e.g., 5,000 characters per note) with a visible counter and validation message.
- What happens when multiple notes are added to the same date in rapid succession? Notes should be stored with unique timestamps (millisecond precision) to maintain order and prevent overwrites.
- How does the system handle invalid holiday JSON format or malformed dates? Validate JSON schema on load; display an error message for invalid format; skip individual malformed entries while loading valid ones.
- What happens when a user uploads a very large background image (e.g., 10MB)? Implement file size validation (e.g., max 2MB); reject large files with a clear error message; recommend appropriate image sizes.
- How does the sidebar handle months with many notes (e.g., 50+ notes)? Implement scrolling within the sidebar panel with a maximum height; consider pagination or "show more" functionality if performance degrades.
- What happens when a user navigates to a date far in the past or future where holidays don't exist? Display dates normally without holiday highlighting; the notes system should still function for any date.
- How does the calendar handle concurrent edits if the user has multiple tabs open? Use localStorage events to sync changes across tabs; when a note is added/edited/deleted in one tab, other tabs update their display automatically.
- What happens when the user's selected background image URL is no longer accessible (404 error)? Fall back to the default background or the previously selected background color; provide a notification that the image failed to load.
- How does the system handle date formatting differences between Nepali and Gregorian dates in the notes system? Store notes using a consistent key format (e.g., Nepali date as YYYY-MM-DD) to ensure reliable retrieval regardless of date system.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to click on any calendar date cell to open a modal/popup interface for managing notes
- **FR-002**: System MUST support adding, editing, and deleting text notes for any calendar date
- **FR-003**: System MUST store each note with a timestamp (date and time when created or last modified)
- **FR-004**: System MUST persist all notes in browser localStorage with a structured key-value format
- **FR-005**: System MUST support multiple notes per date, displaying them in chronological order
- **FR-006**: System MUST display a visual indicator on date cells that have associated notes
- **FR-007**: System MUST provide a sidebar panel that lists all notes for the currently displayed month
- **FR-008**: System MUST allow users to click on a note in the sidebar to navigate to that date and open its notes modal
- **FR-009**: System MUST update the sidebar in real-time when notes are added, edited, or deleted
- **FR-010**: System MUST provide configuration options for sidebar position (left or right)
- **FR-011**: System MUST provide configuration to enable or disable the notes sidebar visibility
- **FR-012**: System MUST persist all sidebar configuration settings in localStorage
- **FR-013**: System MUST provide configuration options to select weekend days (Sunday only, Saturday only, or both)
- **FR-014**: System MUST display weekend dates with red text color based on user's weekend configuration
- **FR-015**: System MUST load holiday data from a JSON file containing holiday name, date, and optional description
- **FR-016**: System MUST support multiple years in the holiday JSON format
- **FR-017**: System MUST display holiday dates with red text color and show the holiday name on the calendar
- **FR-018**: System MUST persist weekend configuration settings in localStorage
- **FR-019**: System MUST provide theme customization options for background color selection via color picker
- **FR-020**: System MUST provide theme customization options for background image via URL input
- **FR-021**: System MUST provide theme customization options for background image via file upload
- **FR-022**: System MUST persist theme settings (color or image) in localStorage
- **FR-023**: System MUST ensure text remains legible when custom backgrounds are applied
- **FR-024**: System MUST be packageable as a Chrome extension with a valid manifest.json file
- **FR-025**: System MUST function as a new tab replacement page when installed as a Chrome extension
- **FR-026**: System MUST maintain all existing calendar functionality (month view, navigation, date conversion) while adding new features
- **FR-027**: System MUST synchronize notes and settings across multiple browser tabs using localStorage events
- **FR-028**: System MUST validate and handle localStorage quota errors gracefully with user-friendly error messages
- **FR-029**: System MUST validate holiday JSON format and handle parsing errors without breaking calendar functionality
- **FR-030**: System MUST implement character limits for notes (5,000 characters) with visible feedback

### Key Entities

- **Note**: Represents a user-created text memo associated with a specific calendar date. Attributes include note text content, associated date (Nepali format), timestamp (creation/modification), and unique identifier. A date can have multiple notes.

- **Holiday**: Represents a special occasion or public holiday. Attributes include holiday name, date (Nepali format), optional description, and year. Loaded from external JSON file and displayed on the calendar.

- **Settings**: Represents user preferences for calendar customization. Attributes include weekend configuration (Sunday/Saturday/Both), sidebar position (left/right), sidebar visibility (enabled/disabled), background color, and background image URL/data. All settings persist in localStorage.

- **CalendarDate**: Extension of existing calendar date entity. Now includes additional attributes: hasNotes (boolean), isWeekend (boolean based on settings), isHoliday (boolean), and holidayName (string, if applicable).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a note to any date and retrieve it within 2 seconds of clicking the date
- **SC-002**: Notes and settings persist across browser sessions with 100% reliability (no data loss)
- **SC-003**: The notes sidebar updates within 500ms when notes are added, edited, or deleted
- **SC-004**: Users can customize weekend settings and see visual changes reflected immediately (within 100ms)
- **SC-005**: Users can apply theme customization and see changes reflected immediately (within 200ms)
- **SC-006**: The calendar displays holidays from JSON file with 100% accuracy for dates within the supported range
- **SC-007**: The Chrome extension installs successfully and displays the calendar as the new tab page without errors
- **SC-008**: All calendar features (navigation, notes, settings) function identically in both web app and Chrome extension modes
- **SC-009**: The notes modal opens and closes within 300ms of user interaction
- **SC-010**: The calendar handles at least 100 notes per month without performance degradation (rendering remains under 500ms)
- **SC-011**: Settings changes (sidebar position, weekend config, theme) persist across browser restarts with 100% reliability
- **SC-012**: The calendar remains fully functional when localStorage is disabled, displaying appropriate error messages for features requiring storage
