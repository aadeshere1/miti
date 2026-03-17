# Feature Specification: Daily Challenges

**Feature Branch**: `004-daily-challenges`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Now in the months, lets add feature for challenges such as no junk food, first thing water, no sugar etc. Each challenge should be checkable from the calendar view itself. No need to add separate page just for this. In the setting, we should be able to enable these three challenges or add more custom challenges."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check Off Daily Challenges from Calendar (Priority: P1)

A user opens the Miti calendar and sees small challenge indicators on today's date cell. Each active challenge appears as a compact, checkable item directly within the day cell. The user taps/clicks a challenge to mark it as completed for that day. The challenge visually changes to show completion (e.g., strikethrough or checkmark). The user can also uncheck a challenge if they marked it by mistake. Past days show their challenge completion status as read-only.

**Why this priority**: This is the core interaction — without the ability to check challenges from the calendar view, the feature has no value. This single story delivers a working daily challenge tracker.

**Independent Test**: Can be fully tested by enabling a default challenge in settings, navigating to today's date, checking/unchecking the challenge, and verifying the completion state persists after page reload.

**Acceptance Scenarios**:

1. **Given** the user has at least one challenge enabled, **When** they view the current month's calendar, **Then** today's date cell displays compact challenge indicators (icon + abbreviated name) for each active challenge.
2. **Given** the user sees challenge indicators on today's cell, **When** they click/tap a challenge indicator, **Then** it toggles between completed and incomplete states with a clear visual change.
3. **Given** the user has checked a challenge for today, **When** they reload the page or return later, **Then** the challenge completion state is preserved.
4. **Given** the user views a past date with challenge data, **When** they look at that date cell, **Then** completed challenges show as completed (read-only) and incomplete ones show as missed.
5. **Given** the user views a future date, **When** they look at that date cell, **Then** no challenge indicators are displayed (challenges are only trackable for today and past dates).

---

### User Story 2 - Enable/Disable Default Challenges in Settings (Priority: P2)

A user opens the settings panel and sees a "Daily Challenges" section. Three default challenges are listed: "No Junk Food", "First Thing Water", and "No Sugar". Each has a toggle to enable or disable it. Enabled challenges appear on the calendar day cells; disabled ones are hidden. Changes take effect immediately on the calendar.

**Why this priority**: Users need a way to choose which challenges they want to track. The default challenges provide immediate value without requiring the user to think about what to track.

**Independent Test**: Can be fully tested by opening settings, toggling each default challenge on/off, and verifying the calendar view updates to show/hide the corresponding challenge indicators.

**Acceptance Scenarios**:

1. **Given** the user opens the settings panel, **When** they look at the Daily Challenges section, **Then** they see three default challenges ("No Junk Food", "First Thing Water", "No Sugar") each with an enable/disable toggle.
2. **Given** a challenge is disabled, **When** the user enables it, **Then** the challenge indicator immediately appears on today's date cell in the calendar.
3. **Given** a challenge is enabled, **When** the user disables it, **Then** the challenge indicator is removed from the calendar view, but existing completion data is preserved.
4. **Given** no challenges are enabled (including first-time use, where all defaults start disabled), **When** the user views the calendar, **Then** no challenge indicators appear on any date cells and the calendar looks identical to before this feature.

---

### User Story 3 - Add Custom Challenges (Priority: P3)

A user wants to track a personal challenge beyond the three defaults (e.g., "No Social Media", "30 Min Exercise"). In the settings panel, they click an "Add Challenge" button, enter a challenge name and pick an icon/emoji, and the new custom challenge appears in their challenge list. Custom challenges behave identically to default challenges on the calendar.

**Why this priority**: Custom challenges extend the feature's value for power users who want personalized tracking, but the feature is fully usable with just the three defaults.

**Independent Test**: Can be fully tested by adding a custom challenge in settings, verifying it appears on the calendar, checking it off for today, and confirming it persists after reload.

**Acceptance Scenarios**:

1. **Given** the user is in the Daily Challenges settings section, **When** they click "Add Challenge", **Then** a form appears to enter a challenge name (required, max 30 characters) and select an icon/emoji.
2. **Given** the user fills in a valid challenge name, **When** they save the custom challenge, **Then** it appears in the challenge list and is enabled by default.
3. **Given** a custom challenge exists, **When** the user wants to remove it, **Then** they can delete it from the settings (with a confirmation prompt since this also removes all historical data for that challenge).
4. **Given** a custom challenge exists, **When** the user wants to edit it, **Then** they can update the name and icon.
5. **Given** the user has both default and custom challenges enabled, **When** they view the calendar, **Then** all enabled challenges appear on the date cells in consistent style.

---

### Edge Cases

- What happens when the user has many challenges enabled (e.g., 5+)? The date cell shows a compact summary (e.g., "3/5" completed). Clicking the summary opens a popover listing all challenges with toggles for today (read-only for past dates).
- What happens when the user enables a challenge mid-month? Only today and future dates should show the challenge indicator; past dates before the enable date should not retroactively show missed challenges.
- What happens when challenge data exists but the challenge is later deleted? The historical data is removed along with the challenge (after user confirmation).
- How does the feature behave across month navigation? Past months show challenge completion as read-only history. The current month shows today as interactive and past days as read-only.
- What is the maximum number of challenges a user can have? The system supports up to 10 active challenges to maintain calendar readability.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display challenge indicators on calendar day cells for each enabled challenge, showing completion status for today and past dates.
- **FR-002**: System MUST allow users to toggle challenge completion for the current day directly from the calendar view by clicking/tapping the challenge indicator. Challenge indicators MUST be distinct click targets that do not trigger the existing notes modal; clicking elsewhere on the date cell MUST continue to open the notes modal as before.
- **FR-003**: System MUST persist challenge completion data so that it survives page reloads and browser restarts.
- **FR-004**: System MUST provide three default challenges: "No Junk Food", "First Thing Water", and "No Sugar", each with a distinctive icon/emoji.
- **FR-005**: System MUST allow users to enable or disable each challenge (default and custom) from the settings panel.
- **FR-006**: System MUST allow users to create custom challenges with a name (max 30 characters) and an icon/emoji.
- **FR-007**: System MUST allow users to delete custom challenges, with a confirmation prompt warning that historical data will also be removed.
- **FR-008**: System MUST allow users to edit custom challenge names and icons.
- **FR-009**: System MUST NOT allow challenge interactions (checking/unchecking) for future dates.
- **FR-010**: System MUST show a compact summary view (e.g., "3/5" completed) when more than 4 challenges are active on a date cell. Clicking the compact summary MUST open a popover listing all individual challenges with toggleable status for today (read-only for past dates).
- **FR-011**: System MUST limit the total number of active challenges to 10.
- **FR-012**: System MUST preserve challenge completion data when a challenge is disabled (only delete data when a challenge is fully deleted).
- **FR-013**: When a challenge is enabled mid-month, system MUST only show the challenge from the enable date forward, not retroactively for past dates.

### Key Entities

- **Challenge**: Represents a trackable daily challenge. Attributes: unique identifier, name (display text), icon/emoji, type (default or custom), enabled status, date created.
- **Challenge Completion**: Represents whether a specific challenge was completed on a specific date. Attributes: challenge identifier, date (Nepali date format YYYY-MM-DD), completion status (completed or not), timestamp of last status change.

## Assumptions

- Challenge completion is binary (completed or not) — there is no partial completion.
- The three default challenges cannot be deleted, only disabled. Custom challenges can be deleted.
- All three default challenges start disabled on first use. Users must opt in via settings.
- Challenge icons/emojis for defaults are pre-assigned and not customizable. Custom challenges allow the user to pick from a set of common emojis.
- Challenge data uses the same Nepali date format (YYYY-MM-DD) as existing notes storage.
- Past challenge completions are read-only — users cannot retroactively check/uncheck challenges for past days.

## Clarifications

### Session 2026-03-17

- Q: How should challenge indicator clicks coexist with the existing date cell click (which opens the notes modal)? → A: Challenge indicators are distinct click targets within the cell — clicking an indicator toggles it; clicking elsewhere on the cell opens notes as before.
- Q: Should the three default challenges start enabled or disabled on first use? → A: All defaults start disabled (opt-in). Users must enable them in settings to avoid surprising existing users with new UI elements.
- Q: How should users expand the compact summary when more than 4 challenges are active? → A: Clicking the compact summary opens a small popover listing all challenges with toggles for today.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can enable a challenge and check it off for today within 5 seconds of opening the calendar.
- **SC-002**: Challenge completion data persists correctly across page reloads with 100% reliability.
- **SC-003**: The calendar remains visually clean and readable with up to 4 active challenges, with no overflow or layout breakage.
- **SC-004**: Users can add a custom challenge in under 30 seconds through the settings panel.
- **SC-005**: All challenge interactions (check, uncheck, enable, disable) reflect on the calendar within 1 second without requiring a page reload.
