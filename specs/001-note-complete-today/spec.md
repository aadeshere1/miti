# Feature Specification: Note Completion & Today Highlight

**Feature Branch**: `001-note-complete-today`
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description: "Add feature to mark note as completed. also the todays note should be highlighted."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Today's Date Highlighted in Calendar (Priority: P1)

A user opens the calendar and can immediately identify today's date because it is visually distinct from other dates. If today's date has a note, the note indicator also reflects this highlight, making it easy to see today's context at a glance.

**Why this priority**: Identifying today is the most common calendar interaction. This is foundational orientation that helps users know where they are in time before taking any other action.

**Independent Test**: Open the calendar on any day. Today's date cell must be visually distinct from all other date cells regardless of whether a note exists for today.

**Acceptance Scenarios**:

1. **Given** the calendar is open, **When** the user views the current month, **Then** today's date cell is visually distinct (different color, border, or background) from all other date cells.
2. **Given** today has a note, **When** the user views the calendar, **Then** today's date cell shows both the today-highlight and the note indicator together.
3. **Given** the user navigates to a different month and returns, **When** the current month is displayed, **Then** today's date is still highlighted correctly.
4. **Given** today has no note, **When** the user views the calendar, **Then** today's date is still highlighted (the highlight is not dependent on having a note).

---

### User Story 2 - Mark a Note as Completed (Priority: P2)

A user who has written a note for a specific date can mark that note as "completed" to indicate the task or reminder associated with that day has been handled. The completion status is visually reflected on the calendar date cell so the user can see their progress without opening the note.

**Why this priority**: Note completion adds actionable value on top of existing note-taking, turning the calendar into a light task-tracking tool. It depends on the note system already existing.

**Independent Test**: Create a note for any date, then toggle completion on that note. The date cell must show a completed visual state, and the state must persist after page reload.

**Acceptance Scenarios**:

1. **Given** a date has a note, **When** the user opens the note and marks it as completed, **Then** the date cell shows a completed visual indicator (e.g., checkmark or strikethrough style).
2. **Given** a note is marked as completed, **When** the user reopens the note, **Then** the note is shown in its completed state with an option to undo completion.
3. **Given** a note is marked as completed, **When** the user marks it as incomplete again, **Then** the date cell reverts to the normal note-has-content state.
4. **Given** a completed note exists, **When** the user reloads the calendar, **Then** the note remains in its completed state (completion persists across sessions).
5. **Given** a date has no note, **When** the user views that date, **Then** no completion control is shown.

---

### Edge Cases

- What happens when today's note is also marked as completed? Both the today-highlight and the completed indicator must be visible simultaneously without either obscuring the other.
- What happens when the user views a past month — do completed notes still show their completed state? Yes, completion state must be preserved across all months and years.
- What if a completed note's text is fully deleted? The completion state should be cleared when the note content is removed.
- What if the date changes at midnight while the app is open? Today's highlight must reflect the new current date on next render or page load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calendar MUST visually distinguish today's date cell from all other date cells at all times.
- **FR-002**: The today highlight MUST be visible whether or not today has an associated note.
- **FR-003**: The today highlight MUST update correctly when the user navigates between months and returns to the current month.
- **FR-004**: Users MUST be able to mark a note as completed from within the note editing interface.
- **FR-005**: Users MUST be able to undo note completion (toggle back to incomplete) from within the note editing interface.
- **FR-006**: A date cell with a completed note MUST display a distinct visual indicator on the calendar grid, separate from the standard note indicator.
- **FR-007**: Note completion state MUST persist across page reloads and browser sessions.
- **FR-008**: The completion control MUST only appear for dates that have note content; dates without notes MUST NOT show a completion option.
- **FR-009**: When a note's content is fully deleted, the completion state for that date MUST be cleared automatically.
- **FR-010**: When today's note is completed, BOTH the today highlight and the completion indicator MUST be visible simultaneously on the date cell.

### Key Entities

- **Note**: A text entry associated with a specific calendar date. Key attributes: date (Nepali BS format), content (text), completion status (boolean).
- **Completion Status**: A per-note boolean flag indicating whether the note has been marked done. Stored alongside the note entry and persisted across sessions.
- **Today Indicator**: A visual state applied to the date cell matching the current date, computed at render time from the system clock.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify today's date on the calendar in under 2 seconds without scanning — the highlight provides immediate visual orientation.
- **SC-002**: Users can mark a note as completed in 3 or fewer interactions from the calendar view.
- **SC-003**: Completion state is reliably preserved — completed notes remain in their completed state after every page reload with no data loss.
- **SC-004**: Today's highlight is always accurate — the correct date cell is highlighted on every calendar render with no incorrect date highlighted.
- **SC-005**: Both the today highlight and completion indicator are simultaneously visible when today's note is completed, with neither hiding the other.

## Assumptions

- Notes are free-form text entries (not structured to-do lists), so "mark as completed" applies to the entire note for a given date, not individual lines within a note.
- Completion state is stored locally alongside existing note data with no external sync required.
- The today highlight is determined by comparing the system clock date against the Nepali calendar date — no user configuration is needed.
- Completed notes remain editable; completion is a status flag, not a content lock.
- The visual design for completion and today-highlight will follow the existing calendar theme system and respect the user's chosen color theme.
