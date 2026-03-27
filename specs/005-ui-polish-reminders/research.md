# Research: UI Polish & Challenge Reminders

**Feature**: 005-ui-polish-reminders
**Date**: 2026-03-19

## R1: Fixed Navigation Button Layout

**Decision**: Use CSS `flex: 1` on the month title to absorb variable width, keeping buttons in fixed positions.

**Rationale**: The current `.calendar-header` uses `justify-content: space-between` with the month title (`<h1>`) having natural/auto width. Since Nepali month names vary from 4 characters ("Magh") to 8 characters ("Baishakh"), the next button shifts position. Setting the title to `flex: 1` with `text-align: center` makes it absorb all available space, pinning the nav buttons and settings button to fixed positions.

**Alternatives considered**:
- `min-width` on the title → fragile, depends on font rendering
- Grid layout → unnecessary complexity for a simple 4-item row
- Fixed-width container for title → doesn't adapt to responsive breakpoints

## R2: Calendar Grid Sizing Strategy

**Decision**: Use CSS `calc()` with viewport height (`100vh`) to size the calendar grid dynamically, ensuring it fills available space without scrolling.

**Rationale**: Currently the grid uses fixed pixel heights (480px default, 500px desktop, 420px tablet, 360px mobile). These arbitrary values don't adapt to actual viewport size. Using `calc(100vh - header - weekdays - padding - todayBtn)` ensures the grid fills available vertical space without causing scrollbar. The `max-height` can cap it for very tall screens.

**Alternatives considered**:
- Increasing fixed pixel values by 15% → still arbitrary, may scroll on smaller viewports
- `flex-grow` on grid → harder to control exact spacing
- `100vh` with `overflow: hidden` → would clip content

**Key measurements** (current heights to subtract from 100vh):
- Calendar header: ~60px
- Weekday headers: ~36px
- Container padding: 2rem (32px) × 2 = 64px
- Today button: ~36px + margin 2rem (32px) = 68px
- App padding: 1rem (16px) × 2 = 32px
- Total non-grid: ~260px
- Available for grid on 900px viewport: ~640px (current: 480-500px)

## R3: Calendar-Sidebar Gap

**Decision**: Add `gap` value to `.app-container` flex container.

**Rationale**: The `.app-container` currently has `gap: 0`. Adding `gap: 1.5rem` (24px) creates clean visual separation without affecting either component's internal layout. This works automatically with the flex direction (horizontal on desktop, vertical on mobile).

**Alternatives considered**:
- Margin on sidebar → needs separate handling for left vs right position
- Padding on calendar container → changes internal spacing too
- Border/divider line only → doesn't create breathing room

## R4: Reminder Time Window Design

**Decision**: Use a simple enum-style `ReminderTimeWindow` type with 5 predefined options. Store the preference as part of the existing `Challenge` object in localStorage.

**Rationale**: The user specified specific time-of-day associations (morning for water, evening for junk food/sugar). A set of predefined windows (Morning, Afternoon, Evening, All Day, No Reminder) is simpler than a custom time picker and matches the user's mental model. Storing on the Challenge entity avoids a separate storage key.

**Time window definitions**:
- Morning: 5:00 AM – 9:59 AM (hours 5–9)
- Afternoon: 11:00 AM – 3:59 PM (hours 11–15)
- Evening: 5:00 PM – 9:59 PM (hours 17–21)
- All Day: 0:00 AM – 11:59 PM (always active)
- No Reminder: never active

**Alternatives considered**:
- Custom time picker (HH:MM) → over-engineered for the use case, per constitution Principle V
- Browser Notifications API → requires additional permissions, background service worker, out of scope per spec assumptions
- Single global reminder time → user specifically requested per-challenge times

## R5: Reminder Display Mechanism

**Decision**: Show a non-intrusive banner at the top of the calendar container (below the header, above the weekday row) with challenge icon, name, and action buttons. Multiple reminders stack vertically.

**Rationale**: A banner inside the calendar fits naturally in the existing layout without overlaying content. It's visible immediately on page load without being disruptive. The existing `showErrorNotification` pattern proves fixed-position notifications work, but a banner integrated into the calendar flow is less obtrusive for recurring reminders.

**Alternatives considered**:
- Fixed-position toast → disappears too quickly for actionable reminders
- Modal dialog → too intrusive for daily reminders
- Sidebar integration → sidebar may be hidden/disabled
- Bottom bar → less visible, user may not notice

## R6: Reminder Dismissal Strategy

**Decision**: Use an in-memory `Set<string>` (challenge IDs) to track dismissed reminders. Reset on every page load (new session).

**Rationale**: The spec defines a "session" as a single page load. Dismissed state does NOT need persistence (new tab = new session = reminders reappear). An in-memory Set is the simplest solution — no localStorage writes, no cleanup needed.

**Alternatives considered**:
- `sessionStorage` → persists across page refreshes within a tab, which is slightly different from "new page load" but acceptable. Not needed since in-memory is simpler.
- localStorage with timestamps → over-engineered, per constitution Principle V

## R7: Settings UI for Reminder Time

**Decision**: Add a dropdown (`<select>`) for reminder time next to each challenge in the existing settings modal challenge list.

**Rationale**: The settings modal already has a challenge management section with enable/disable toggles. Adding a reminder time dropdown next to each challenge keeps all configuration in one place. This is the minimal addition needed.

**Alternatives considered**:
- Separate "Reminders" settings tab → too much UI for a simple dropdown
- Inline editing in the calendar → not discoverable
- Per-challenge settings modal → too many modal levels
