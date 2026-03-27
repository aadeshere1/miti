# Feature Specification: Challenge Streaks & Rewards

**Feature Branch**: `006-challenge-streaks-rewards`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "In the challenges part, for today, can you put the challenges checkbox in the top of month box or in the side, but before that you need to commit the work until now. You need to be careful so that the UI doesn't break. Also add motivation quote somewhere in the screen if user has continuously completed the challenges for 3 days 7 days 15 days and 1 month. Give rewards on each and motivate to reach next goal."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Today's Challenge Checklist Above Calendar Grid (Priority: P1)

When the user opens the calendar and has enabled challenges, today's challenge checklist is prominently displayed above the calendar grid (between the month header and the weekday headers). This gives the user an at-a-glance view of their daily challenges with checkboxes to mark them complete, without needing to find today's cell in the grid.

Currently, challenge indicators appear as small emoji icons inside each date cell. For today specifically, the user wants a more prominent, accessible checklist area so they can quickly check off their daily challenges.

**Why this priority**: This is the core usability improvement — users should see and interact with today's challenges immediately upon opening the app, not hunt for them in a grid cell.

**Independent Test**: Enable 2-3 challenges, open the app, verify the today challenge checklist appears above the calendar grid with checkboxes. Check/uncheck a challenge and verify it syncs with the date cell indicators.

**Acceptance Scenarios**:

1. **Given** the user has 2 enabled challenges, **When** they open the app, **Then** a challenge checklist area appears above the calendar grid showing each challenge with its icon, name, and a checkbox
2. **Given** the user checks a challenge in the header checklist, **When** the checkbox is toggled, **Then** the corresponding indicator in today's date cell also updates to show completed
3. **Given** the user has no enabled challenges, **When** they open the app, **Then** no challenge checklist area is shown
4. **Given** the user navigates to a different month (not containing today), **When** they view that month, **Then** the today challenge checklist remains visible since daily challenges are always relevant
5. **Given** the user completes a challenge via the date cell indicator, **When** they look at the header checklist, **Then** it reflects the updated completion state

---

### User Story 2 - Streak Tracking & Display (Priority: P1)

The system tracks how many consecutive days the user has completed ALL their enabled challenges. A streak is defined as consecutive days where every enabled challenge was marked as complete. The current streak count is displayed alongside the today checklist area.

**Why this priority**: Streaks are the foundation for the reward system — without tracking, rewards cannot be awarded. The streak counter also provides immediate motivation.

**Independent Test**: Enable a challenge, complete it for today and verify the streak shows "1 day". Manually set completions for the previous 2 days via localStorage, reload, and verify it shows "3 days".

**Acceptance Scenarios**:

1. **Given** the user has completed all enabled challenges today, **When** they view the calendar, **Then** they see a streak count (e.g., "1 day streak")
2. **Given** the user completed all challenges for 5 consecutive days, **When** they view the calendar, **Then** the streak count shows "5 days"
3. **Given** the user missed one challenge yesterday, **When** they view the calendar today, **Then** the streak count shows 0 (or 1 once they complete today)
4. **Given** the user has no enabled challenges, **When** they view the calendar, **Then** no streak information is shown

---

### User Story 3 - Milestone Rewards & Motivation Quotes (Priority: P2)

When the user reaches streak milestones (3 days, 7 days, 15 days, 30 days), the app displays a congratulatory message with a motivational quote and a reward badge. Between milestones, a progress indicator shows how close the user is to the next goal.

**Why this priority**: This is the engagement/delight feature that makes the streak tracking meaningful. It depends on streak tracking being in place first.

**Independent Test**: Set up completion data for 3 consecutive days, reload the app, and verify a milestone celebration banner appears with a reward badge and motivational quote.

**Acceptance Scenarios**:

1. **Given** the user reaches a 3-day streak, **When** they open the app, **Then** they see a celebration banner with a motivational quote and a reward badge (e.g., "Starter" badge)
2. **Given** the user reaches a 7-day streak, **When** they open the app, **Then** they see an upgraded celebration with a new reward badge (e.g., "Dedicated" badge) and a motivational quote
3. **Given** the user reaches a 15-day streak, **When** they open the app, **Then** they see a celebration with a higher-tier badge (e.g., "Champion" badge) and a motivational quote
4. **Given** the user reaches a 30-day streak, **When** they open the app, **Then** they see the highest-tier celebration (e.g., "Legend" badge) and a motivational quote
5. **Given** the user is between milestones (e.g., at 5 days), **When** they view the calendar, **Then** they see a "next milestone" indicator showing progress toward the next goal (e.g., "2 more days to 7-day streak!")
6. **Given** the user has already seen a milestone celebration, **When** they reopen the app at the same streak level, **Then** the celebration banner is not repeated, but the earned badge remains visible
7. **Given** the user's streak resets, **When** they view the calendar, **Then** previously earned badges are retained as historical achievements

---

### User Story 4 - Badge & Streak Persistence (Priority: P2)

Earned badges and the highest streak ever achieved persist across sessions. The user can see their earned badges and best streak even after a streak breaks.

**Why this priority**: Without persistence, the reward system loses its motivational impact. Users need to feel their accomplishments are permanent.

**Independent Test**: Earn a 3-day badge, break the streak, reload the app, and verify the badge is still visible and the "best streak" stat is preserved.

**Acceptance Scenarios**:

1. **Given** the user earned a 3-day badge, **When** they close and reopen the app, **Then** the badge is still displayed
2. **Given** the user had a best streak of 10 days, **When** they view the streak area, **Then** they see "Best: 10 days" alongside "Current: X days"

---

### Edge Cases

- What happens when the user changes which challenges are enabled mid-streak? The streak continues based on whether all challenges that were enabled on each day were completed. Days before a challenge was enabled don't require that challenge.
- What happens when the user has zero enabled challenges? No streak, checklist, or reward UI is shown.
- What happens when the user hasn't completed today's challenges yet? The streak counts up to yesterday. If yesterday was complete, the current streak reflects that, and completing today extends it.
- What happens when the user deletes a custom challenge? The streak recalculates based on remaining enabled challenges.
- What happens when the user has only 1 enabled challenge? Streaks still work — completing that one challenge counts as "all challenges complete."
- What happens on a fresh install with no history? Streak starts at 0, no badges shown, next milestone shows "3 more days to 3-day streak!"

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a challenge checklist area above the calendar grid (between month header and weekday headers) showing each enabled challenge with its icon, name, and a toggleable checkbox for today's completion status
- **FR-002**: System MUST synchronize completion state between the header checklist and the date cell challenge indicators bidirectionally — completing in either location updates both
- **FR-003**: System MUST hide the challenge checklist area when no challenges are enabled
- **FR-004**: System MUST calculate a "current streak" by counting consecutive Nepali calendar days (ending today or yesterday) where ALL enabled challenges were marked as complete
- **FR-005**: System MUST display the current streak count near the challenge checklist area
- **FR-006**: System MUST define four streak milestones: 3 days, 7 days, 15 days, and 30 days
- **FR-007**: System MUST display a one-time celebration banner with a motivational quote and reward badge when the user first reaches each milestone
- **FR-008**: System MUST show a "next milestone" progress indicator between milestones (e.g., "2 more days to reach 7-day streak!")
- **FR-009**: System MUST persist earned badges in browser storage so they survive across sessions
- **FR-010**: System MUST persist the user's best (highest) streak count
- **FR-011**: System MUST NOT repeat a milestone celebration banner if the user has already seen it at that streak level
- **FR-012**: System MUST retain previously earned badges even after a streak breaks
- **FR-013**: System MUST include at least 4 unique motivational quotes, one for each milestone tier
- **FR-014**: System MUST ensure the challenge checklist area does not cause the calendar to scroll or overflow the viewport
- **FR-015**: System MUST support dark theme and image theme for the challenge checklist area, streak display, and milestone banners
- **FR-016**: System MUST display the user's best streak alongside the current streak

### Key Entities

- **Streak**: A count of consecutive Nepali calendar days where all enabled challenges were completed. Has a current value and a best-ever value.
- **Milestone**: A predefined streak threshold (3, 7, 15, 30 days) with an associated badge name, emoji icon, and motivational quote.
- **Badge**: A reward marker earned by reaching a milestone. Once earned, it persists permanently. Has a tier, name, and icon.
- **Streak Stats**: Persistent record storing current streak, best streak, earned milestone IDs, and seen celebration IDs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and toggle today's challenge completions from the checklist area in under 2 seconds after page load
- **SC-002**: Streak count updates correctly within 1 second of completing or uncompleting a challenge
- **SC-003**: 100% of milestone celebrations display the correct badge and motivational quote at the correct streak threshold
- **SC-004**: Earned badges and best streak persist across browser sessions with zero data loss
- **SC-005**: The challenge checklist area and all reward UI elements render correctly across light theme, dark theme, and image theme
- **SC-006**: The calendar view with challenge checklist area fits within the viewport without vertical scrolling on standard screen sizes (1024px+ height)

## Assumptions

- Streak calculation is based on Nepali calendar dates, consistent with the rest of the app
- "Consecutive days" means no gap — if the user misses one day, the streak breaks
- A day's challenges are considered "complete" only if ALL enabled challenges have been checked off
- The challenge checklist area appears even when navigating to months other than the current month, since today's challenges are always relevant
- Motivational quotes are hardcoded (not fetched from an external service), keeping the app offline-capable
- The celebration banner for a milestone is shown once per milestone achievement (tracked via localStorage), not on every page load
- Badges use emoji icons to stay consistent with the challenge icon system
- The existing date cell challenge indicators remain for all dates including today — the header checklist is an additional prominent UI element, not a replacement
