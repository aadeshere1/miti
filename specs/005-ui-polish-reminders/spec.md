# Feature Specification: UI Polish & Challenge Reminders

**Feature Branch**: `005-ui-polish-reminders`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "Make the next and previous month button fixed. Currently the previous button is fixed but next button keeps changing based on size of month name. Make the calendar view bit bigger as well but still should fit in the screen. In the calendar and notes list there should be some gap. If the challenges are enabled, the app should remind user for updating the checklist. Each type of challenge can have its own reminding time."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fixed Navigation Buttons (Priority: P1)

A user navigates between months and notices the previous and next month buttons stay in consistent, predictable positions regardless of which month name is displayed. Month names like "Baishakh" and "Magh" have different character lengths, but neither button shifts position.

**Why this priority**: Navigation buttons that jump around create a poor user experience and make the app feel unpolished. This is the most immediately visible issue.

**Independent Test**: Can be fully tested by navigating through all 12 Nepali months and verifying both nav buttons remain in the same horizontal position throughout.

**Acceptance Scenarios**:

1. **Given** the calendar displays "Baishakh 2082" (long name), **When** the user navigates to "Magh 2082" (short name), **Then** the previous and next buttons remain in the same fixed positions.
2. **Given** any month is displayed, **When** the user resizes the browser window, **Then** the navigation buttons remain symmetrically placed on either side of the month title.
3. **Given** the calendar is viewed on mobile, **When** any month is displayed, **Then** both navigation buttons are in consistent, reachable positions.

---

### User Story 2 - Larger Calendar View (Priority: P1)

A user opens the Miti calendar and sees a comfortably sized calendar grid that makes good use of available screen space. The entire calendar, including the header, grid, and Today button, fits within the viewport without scrolling.

**Why this priority**: The calendar is the primary interface element. Making it larger improves readability and usability, especially when challenge indicators and holiday names are shown inside cells.

**Independent Test**: Can be tested by opening the calendar on desktop, tablet, and mobile screens and verifying the grid is larger than before while the full calendar (header through Today button) fits without vertical scrolling.

**Acceptance Scenarios**:

1. **Given** a desktop screen (1025px+), **When** the calendar loads, **Then** the calendar grid is visibly larger than the current dimensions while the full calendar fits within the viewport.
2. **Given** a tablet screen (641px-1024px), **When** the calendar loads, **Then** the calendar grid is proportionally larger while fitting the viewport.
3. **Given** a mobile screen (320px-640px), **When** the calendar loads, **Then** the calendar grid is proportionally larger while fitting the viewport.
4. **Given** any screen size, **When** the calendar loads, **Then** no vertical scrollbar appears to view the complete calendar (header, weekday row, grid, and Today button).

---

### User Story 3 - Visual Gap Between Calendar and Notes Sidebar (Priority: P1)

A user sees the calendar and notes sidebar as two distinct visual sections with clear spacing between them, rather than being flush against each other.

**Why this priority**: Visual separation between the calendar and sidebar improves readability and creates a cleaner, more organized layout.

**Independent Test**: Can be tested by viewing the app with the sidebar visible and confirming a clear visual gap separates the calendar from the notes list.

**Acceptance Scenarios**:

1. **Given** the notes sidebar is visible on the right, **When** the user views the app, **Then** there is a visible gap between the calendar container and the sidebar.
2. **Given** the notes sidebar is configured on the left, **When** the user views the app, **Then** the same visual gap is present between the sidebar and calendar.
3. **Given** the app is viewed on mobile (stacked layout), **When** the sidebar appears below the calendar, **Then** there is a visible gap between the calendar and the sidebar.

---

### User Story 4 - Challenge Reminder at Tab Open (Priority: P2)

A user who has enabled daily challenges opens a new browser tab (or loads the calendar page). If the current time matches a challenge's reminder window and the user hasn't yet completed that challenge for today, the app displays a friendly, non-intrusive reminder prompting the user to check off their challenge.

**Why this priority**: Reminders are the key mechanism for making challenges actionable. Without reminders, users may forget to update their challenge checklist.

**Independent Test**: Can be tested by enabling a challenge with a morning reminder, opening the app during morning hours, and confirming a reminder appears for that incomplete challenge.

**Acceptance Scenarios**:

1. **Given** a user has "First Thing Water" enabled with a morning reminder, **When** the user opens the app between 5:00 AM and 10:00 AM and hasn't completed it today, **Then** a reminder is displayed for "First Thing Water".
2. **Given** a user has already completed "First Thing Water" today, **When** the user opens the app during the morning reminder window, **Then** no reminder appears for that challenge.
3. **Given** a user has no enabled challenges, **When** the user opens the app at any time, **Then** no challenge reminders are displayed.
4. **Given** multiple challenges have overlapping reminder windows, **When** the user opens the app, **Then** all applicable incomplete challenges show reminders.

---

### User Story 5 - Per-Challenge Reminder Time Configuration (Priority: P2)

Each challenge has a configurable reminder time window that determines when the reminder appears. Default challenges come with sensible pre-set reminder times based on their nature, and users can adjust these times for any challenge.

**Why this priority**: Different challenges are relevant at different times of day. A "drink water" reminder is useful in the morning, while "no junk food" or "no sugar" reminders are most useful in the evening when temptation is highest.

**Independent Test**: Can be tested by changing a challenge's reminder time in settings and verifying the reminder appears at the newly configured time.

**Acceptance Scenarios**:

1. **Given** the default challenges exist, **When** the user views challenge settings, **Then** "First Thing Water" defaults to morning (5:00 AM - 10:00 AM), "No Junk Food" defaults to evening (5:00 PM - 10:00 PM), and "No Sugar" defaults to evening (5:00 PM - 10:00 PM).
2. **Given** a user creates a custom challenge, **When** they set it up, **Then** the reminder time defaults to "All Day" (reminders appear whenever the app is opened and the challenge is incomplete).
3. **Given** a user changes "First Thing Water" reminder from morning to evening, **When** the user opens the app in the morning, **Then** no reminder appears for that challenge; it appears in the evening instead.
4. **Given** a challenge has "No Reminder" configured, **When** the user opens the app at any time, **Then** no reminder appears for that challenge regardless of completion status.

---

### User Story 6 - Dismissing Reminders (Priority: P3)

A user sees a challenge reminder and can dismiss it for the current session without completing the challenge. The reminder reappears the next time the app is opened (e.g., opening a new tab) during the reminder window if the challenge remains incomplete.

**Why this priority**: Users should not be forced to act on reminders immediately. Dismissing prevents annoyance while still providing future nudges.

**Independent Test**: Can be tested by dismissing a reminder, confirming it doesn't reappear in the same session, then opening a new tab and confirming it returns.

**Acceptance Scenarios**:

1. **Given** a reminder is displayed, **When** the user dismisses it, **Then** the reminder disappears with a smooth transition.
2. **Given** a reminder was dismissed, **When** the user navigates months or interacts with the calendar in the same session, **Then** the reminder does not reappear.
3. **Given** a reminder was dismissed but the challenge is still incomplete, **When** the user opens a new tab (new session), **Then** the reminder appears again if still within the reminder window.

---

### Edge Cases

- What happens when the user's system clock is set incorrectly? Reminders still trigger based on the system time; the app does not validate clock accuracy.
- What happens if a user changes their challenge reminder time while a reminder is already displayed? The currently displayed reminder remains; the new time takes effect on the next app load.
- What happens when the user disables a challenge that currently has a visible reminder? The reminder for that challenge is immediately removed.
- What happens on the first day a challenge is enabled? Reminders apply starting from the current session onward.
- What happens when a very long custom challenge name is used in the reminder? The reminder text truncates gracefully with an ellipsis.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation Layout**

- **FR-001**: The previous and next month navigation buttons MUST remain in fixed positions regardless of the displayed month name length.
- **FR-002**: The month title area MUST accommodate the longest possible Nepali month name ("Baishakh") plus a 4-digit year without causing button displacement.

**Calendar Sizing**

- **FR-003**: The calendar grid MUST be larger than its current dimensions while the complete calendar (header, weekday row, grid, Today button) fits within the viewport without scrolling.
- **FR-004**: The calendar MUST scale proportionally across desktop (1025px+), tablet (641px-1024px), and mobile (320px-640px) breakpoints.

**Layout Spacing**

- **FR-005**: There MUST be a visible gap between the calendar container and the notes sidebar in all layout configurations (left, right, and stacked mobile).

**Challenge Reminders**

- **FR-006**: When challenges are enabled, the app MUST display a non-intrusive reminder for each incomplete challenge whose reminder window includes the current time.
- **FR-007**: Each challenge MUST have a configurable reminder time window with these options: Morning (5:00 AM - 10:00 AM), Afternoon (11:00 AM - 4:00 PM), Evening (5:00 PM - 10:00 PM), All Day, No Reminder.
- **FR-008**: Default challenges MUST have pre-set reminder times: "First Thing Water" = Morning, "No Junk Food" = Evening, "No Sugar" = Evening.
- **FR-009**: Custom challenges MUST default to "All Day" reminder time.
- **FR-010**: Reminders MUST NOT appear for challenges that have already been completed for the current day.
- **FR-011**: Users MUST be able to dismiss a reminder for the current session.
- **FR-012**: Dismissed reminders MUST reappear on the next app session (new tab open) if the challenge is still incomplete and within the reminder window.
- **FR-013**: Reminder time preferences MUST persist across sessions.
- **FR-014**: The reminder display MUST show the challenge icon, name, and a prompt to complete the challenge.

### Key Entities

- **Reminder Time Window**: A time-of-day range associated with a challenge that determines when reminders are shown. Options: Morning (5 AM - 10 AM), Afternoon (11 AM - 4 PM), Evening (5 PM - 10 PM), All Day, No Reminder.
- **Reminder Dismissal**: A per-session (in-memory) flag for each challenge indicating the user has dismissed its reminder for the current page session.
- **Challenge (extended)**: The existing challenge entity gains a new `reminderTime` attribute representing the configured reminder window.

## Assumptions

- **Inline reminders**: Reminders are shown within the calendar UI (e.g., a banner or toast at the top of the page) when the app is opened. Push/system notifications are out of scope since the app is a new tab override and the simplest UX is to show reminders when the user naturally sees the page.
- **Session scope**: A "session" is a single page load. Opening a new tab creates a new session.
- **Time source**: The app uses the user's local system time for reminder scheduling.
- **Reminder window boundaries**: The specified hour ranges are inclusive of the start hour and exclusive of the end hour (e.g., Morning = 5:00 AM to 9:59 AM).
- **Calendar sizing**: "Bigger" means increasing the grid height and container max-width while maintaining the constraint of fitting within a single viewport (no scrolling required for the calendar area).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Both navigation buttons remain in identical horizontal positions across all 12 Nepali months on all screen sizes.
- **SC-002**: The calendar grid is at least 15% taller than the current dimensions on each breakpoint while the full calendar fits within the viewport without vertical scrolling.
- **SC-003**: A visible gap of at least 16px separates the calendar and notes sidebar in all layout configurations.
- **SC-004**: When an enabled challenge is incomplete and the current time is within its reminder window, a reminder appears within 1 second of page load.
- **SC-005**: Completed challenges never trigger reminders.
- **SC-006**: Dismissed reminders do not reappear during the same page session.
- **SC-007**: Each challenge's reminder time preference persists correctly across browser sessions.
