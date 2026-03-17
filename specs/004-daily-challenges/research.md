# Research: Daily Challenges

**Feature**: 004-daily-challenges
**Date**: 2026-03-17

## R1: Challenge Data Storage Strategy

**Decision**: Use localStorage with `miti:challenges` key for challenge definitions and `miti:challenge-completions:YYYY-MM-DD` keys for daily completion data.

**Rationale**: Follows the existing storage patterns exactly — settings use a single key (`miti:settings`), notes use per-date keys (`miti:notes:YYYY-MM-DD`). Challenge definitions are few and static (like settings), while completions are per-date (like notes). This keeps reads efficient — loading a month's completions requires at most 32 key lookups, same as notes.

**Alternatives considered**:
- Single key for all completions: Would grow unbounded over time, slow to parse, and risks hitting the 5MB quota faster.
- IndexedDB: Overkill for this data volume (max 10 challenges × 365 days/year = ~3650 records/year, each ~50 bytes). Adds complexity without benefit.

## R2: Challenge Identifier Strategy

**Decision**: Use short string IDs for default challenges (`no-junk-food`, `first-thing-water`, `no-sugar`) and UUID v4 for custom challenges (using existing `uuid.ts` utility).

**Rationale**: Fixed IDs for defaults ensure stability across sessions and make code references clean. UUIDs for custom challenges follow the existing pattern used by notes. The existing `generateUUID()` function in `src/utils/uuid.ts` is already available.

**Alternatives considered**:
- Numeric auto-increment IDs: Fragile across deletions; harder to reference defaults in code.
- All UUIDs: Defaults would get different IDs per install, making them harder to identify programmatically.

## R3: Challenge Indicator UI Approach

**Decision**: Render challenge indicators as small emoji-based icons within the date cell, positioned below the Nepali date. Each indicator is a clickable element with `stopPropagation()` to prevent triggering the notes modal click handler. When >4 challenges are active, show a compact "3/5" summary badge that opens a popover on click.

**Rationale**: The date cell has a minimum height of 60px with the Nepali date at top (1.25rem) and Gregorian date at bottom-right (0.75rem). There's approximately 25-30px of vertical space available for challenge indicators. Small emoji icons (14-16px) fit comfortably for up to 4 challenges in a horizontal row.

**Alternatives considered**:
- Text labels: Too wide for the cell width; would overflow.
- Separate row below the cell: Breaks the existing grid layout and CSS.
- Dots/colors only: Not distinctive enough to tell challenges apart at a glance.

## R4: Settings UI Integration

**Decision**: Add a "Daily Challenges" section to the existing settings modal, positioned after the Theme section. Use toggle switches for enable/disable (matching existing checkbox patterns), an "Add Challenge" button for custom challenges, and inline edit/delete controls.

**Rationale**: The settings modal already handles multiple sections (Weekend, Sidebar, Theme) with consistent patterns. Adding a new section follows the established architecture. No need for a separate modal or page.

**Alternatives considered**:
- Separate challenges settings page: User explicitly requested no separate page.
- Dropdown/accordion in settings: Adds UI complexity for minimal benefit with only 3-10 items.

## R5: Emoji Picker for Custom Challenges

**Decision**: Provide a curated grid of ~30 common health/habit emojis (e.g., 🏃 💪 🥗 🧘 💧 🚫 ⏰ 📚 🎯 etc.) as a simple clickable grid, rather than a full emoji picker library.

**Rationale**: A full emoji picker library (e.g., emoji-mart at 40KB+) would significantly impact bundle size, violating the constitution's <200KB gzipped constraint. A curated set of ~30 relevant emojis covers the common use cases and renders as a lightweight HTML grid with zero additional dependencies.

**Alternatives considered**:
- Full emoji picker library: Too heavy for bundle size budget.
- Native OS emoji picker: Inconsistent across browsers/platforms; no programmatic trigger in all browsers.
- Text-only (no emoji): Less visually appealing; harder to distinguish challenges at small sizes.

## R6: Default Challenge Emoji Assignment

**Decision**: Assign fixed emojis to the three default challenges:
- "No Junk Food" → 🍔 (with strikethrough styling when completed)
- "First Thing Water" → 💧
- "No Sugar" → 🍬 (with strikethrough styling when completed)

**Rationale**: These emojis are universally recognizable, render consistently across all target browsers, and are visually distinct from each other at small sizes. Using food/drink emojis creates immediate association with the challenge topic.

**Alternatives considered**:
- Abstract icons (checkmarks, circles): Less descriptive; harder to identify which challenge is which.
- SVG custom icons: Adds asset management complexity and bundle size.

## R7: Completion Data Structure

**Decision**: Store completions per date as a simple object mapping challenge IDs to boolean values: `{ "no-junk-food": true, "first-thing-water": false, "abc-uuid": true }`. Only store entries for dates where at least one challenge was interacted with.

**Rationale**: Simple, fast to read/write, minimal storage footprint. A typical day with 3 challenges uses ~80 bytes. Missing keys implicitly mean "not completed" — no need to store false values for challenges the user hasn't interacted with yet.

**Alternatives considered**:
- Array of completed challenge IDs: Harder to look up individual challenge status; requires indexOf.
- Full objects with timestamps: Over-engineered for binary completion tracking; timestamps add no user-visible value.

## R8: Multi-tab Sync

**Decision**: Use the existing `storage` event listener pattern (already in `storage-sync.ts`) to detect challenge data changes from other tabs and trigger a calendar re-render.

**Rationale**: The app already handles multi-tab sync for notes and settings via `window.addEventListener('storage', ...)`. Challenge data stored in localStorage will automatically fire these events. The existing `refreshCalendar()` function can be extended to also refresh challenge indicators.

**Alternatives considered**:
- BroadcastChannel API: More complex; storage events already work and are the established pattern.
- No sync: Would show stale data in other tabs, inconsistent with existing behavior.

## R9: Challenge Enable Date Tracking

**Decision**: Store `enabledDate` (Nepali date string YYYY-MM-DD) on each challenge definition. When rendering past dates, only show challenge indicators for dates on or after the challenge's `enabledDate`. When a challenge is disabled and re-enabled, update `enabledDate` to the new enable date.

**Rationale**: FR-013 requires that mid-month enables don't retroactively show missed challenges. Storing the enable date is the simplest way to determine which past dates should display the challenge. Updating on re-enable prevents showing gaps from the disabled period.

**Alternatives considered**:
- Track enable/disable history: Over-engineered; users don't need to see historical enable/disable patterns.
- No tracking (show on all past dates): Violates FR-013; would incorrectly show challenges as "missed" before they were enabled.

## R10: Popover Implementation for Compact Summary

**Decision**: Implement the popover as a lightweight positioned `<div>` with absolute positioning relative to the date cell. It appears on click of the compact summary badge, closes on click outside or Escape key, and contains a list of all challenges with toggle checkboxes for today.

**Rationale**: No external library needed. The app already uses a similar pattern for modals (positioned overlays with backdrop click-to-close). A simple popover follows the same pattern at smaller scale. CSS positioning relative to the cell ensures correct placement.

**Alternatives considered**:
- Popover API (native): Not universally supported across all target browsers yet.
- Reuse existing Modal class: Too heavy for a small inline popup; modals are full-screen overlays.
- Tooltip on hover: Not accessible on touch devices; can't contain interactive toggles.
