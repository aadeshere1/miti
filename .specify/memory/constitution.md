<!--
Sync Impact Report - Version 1.0.0
================================================================================
Version Change: [none] → 1.0.0 (Initial Constitution)
Ratification Date: 2026-02-04

Modified Principles:
- NEW: Calendar Accuracy (NON-NEGOTIABLE)
- NEW: Browser Compatibility
- NEW: Offline-First Architecture
- NEW: Performance & Responsiveness
- NEW: Simplicity & Maintainability

Added Sections:
- Technical Constraints
- Development Workflow
- Governance

Templates Status:
- ✅ plan-template.md - Reviewed, aligned with principles
- ✅ spec-template.md - Reviewed, user story structure supports calendar features
- ✅ tasks-template.md - Reviewed, task structure compatible
- ✅ agent-file-template.md - Reviewed, no conflicts

Follow-up TODOs: None
================================================================================
-->

# Miti Constitution

## Core Principles

### I. Calendar Accuracy (NON-NEGOTIABLE)

The Nepali calendar (Bikram Sambat) system MUST be implemented with complete accuracy:

- Date conversions between Gregorian and Bikram Sambat calendars MUST be mathematically correct
- Month lengths MUST match official Nepali calendar specifications (varying from 29-32 days)
- Festival dates and public holidays MUST align with government-published calendars
- Leap year calculations MUST follow Bikram Sambat rules (not Gregorian)
- Tithi (lunar day) calculations MUST be accurate when displayed

**Rationale**: Calendar accuracy is the core value proposition. Incorrect dates undermine user trust and render the application useless for its primary purpose - planning and tracking dates in the Nepali calendar system.

### II. Browser Compatibility

All calendar functionality MUST work across modern browsers without exceptions:

- Support latest two versions of Chrome, Firefox, Safari, Edge
- Core calendar calculations MUST run entirely in the browser (client-side)
- No server-side dependencies for date rendering or conversion
- Use standard Web APIs only (no proprietary browser features)
- Graceful degradation for older browsers (display message, don't break silently)

**Rationale**: Users access calendars on different devices and browsers. Requiring specific browsers or server connectivity limits accessibility and creates friction. Pure browser-based execution ensures the app works anywhere, anytime.

### III. Offline-First Architecture

Calendar functionality MUST work without network connectivity:

- All calendar calculation logic MUST be embedded in the application
- Calendar data (month structures, conversions) MUST be stored locally or bundled
- Network requests ONLY for optional features (syncing, festival updates)
- Service Worker for offline caching (if PWA features added)
- Clear visual indication when optional online features are unavailable

**Rationale**: A calendar is a daily-use tool that users need reliable access to, regardless of internet availability. Offline-first design ensures the app remains functional even in low-connectivity environments common in many regions.

### IV. Performance & Responsiveness

Calendar operations MUST complete within strict performance budgets:

- Calendar rendering MUST complete in under 100ms (initial paint)
- Date conversions MUST execute in under 10ms per operation
- Month view switching MUST feel instant (under 16ms for 60fps)
- Application bundle size MUST stay under 200KB gzipped
- Memory usage MUST remain under 50MB for typical use

**Rationale**: Calendar interactions are frequent and habitual. Slow rendering or laggy interactions create frustration. Performance budgets ensure the app feels native and responsive, encouraging daily use.

### V. Simplicity & Maintainability

Code architecture MUST prioritize simplicity over premature optimization:

- Use vanilla JavaScript OR a minimal framework (React, Vue, Svelte - under 50KB)
- No unnecessary abstractions - YAGNI (You Aren't Gonna Need It) principle
- Pure functions for calendar calculations (no hidden state)
- Maximum 3 levels of component nesting for UI
- Clear separation: calendar logic (pure) vs. UI rendering (framework)
- Complexity MUST be justified in constitution's complexity tracking if added

**Rationale**: Over-engineering creates maintenance burden and increases bundle size. The calendar domain is well-defined with stable requirements. Simple architecture makes the codebase accessible to contributors and reduces bugs.

## Technical Constraints

### Browser Technology Stack

- **Languages**: HTML5, CSS3, JavaScript (ES2020+) OR TypeScript
- **Framework** (if used): React, Vue, or Svelte - must justify bundle size impact
- **Build Tools**: Vite or Rollup for optimal bundling (optional - can work without build step)
- **Testing**: Manual calendar accuracy testing REQUIRED; automated tests optional
- **No Backend**: Core features must work without server (optional API for festivals/sync only)

### Data Format Standards

- Use ISO 8601 for Gregorian dates in code
- Define standard Bikram Sambat date format (YYYY-MM-DD BS)
- Store calendar conversion data in JSON format
- Document data sources for calendar rules (government publications, established libraries)

### Browser Support Policy

- **Target**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari 14+, Chrome Mobile latest 2 versions
- **Fallback**: Display browser compatibility message for older browsers
- **Testing**: Manual cross-browser testing REQUIRED before release

## Development Workflow

### Feature Development Process

1. **Specification First**: Write feature spec in `.specify/specs/###-feature-name/spec.md`
2. **Calendar Accuracy Review**: For date logic changes, verify against official Nepali calendar
3. **Implementation**: Follow plan.md design from `/speckit.plan`
4. **Manual Testing**: Test across target browsers; verify calendar accuracy for sample dates
5. **Commit**: Use conventional commits (feat:, fix:, docs:, etc.)

### Quality Gates

- **Calendar Accuracy**: New date conversion logic MUST be validated against known correct dates
- **Browser Testing**: Changes to UI MUST be tested in Chrome, Firefox, and Safari minimum
- **Performance**: Bundle size increase MUST be justified; conversions MUST stay under 10ms
- **No Regressions**: Existing calendar calculations MUST not break with new features

### Complexity Justification

If adding complexity that violates principles (e.g., state management library, backend API):

1. Document the problem in plan.md complexity tracking table
2. Explain why simpler alternatives are insufficient
3. Get explicit approval before implementation
4. Update constitution if the complexity becomes permanent policy

## Governance

### Constitutional Authority

- This constitution supersedes all other development practices and guidelines
- All feature specifications, plans, and code reviews MUST verify compliance
- Violations of NON-NEGOTIABLE principles (Calendar Accuracy) block implementation
- Other principle violations require documented justification

### Amendment Process

1. Propose amendment with rationale (GitHub issue or .specify document)
2. Update this constitution document with changes
3. Increment version number using semantic versioning:
   - **MAJOR**: Removing/redefining core principles (backward incompatible)
   - **MINOR**: Adding new principles or sections (new requirements)
   - **PATCH**: Clarifications, wording improvements (no semantic change)
4. Update Last Amended date
5. Propagate changes to affected templates (plan-template.md, spec-template.md, tasks-template.md)
6. Document in Sync Impact Report (HTML comment at top of this file)

### Compliance Review

- **Pre-implementation**: Review plan.md constitution check section before coding
- **Pull Requests**: PR description MUST reference constitution principles addressed
- **Calendar Changes**: Date logic changes REQUIRE accuracy validation checklist
- **Performance**: Bundle size and conversion timing MUST be measured and reported

### Runtime Development Guidance

For day-to-day development guidance (commands, code style, project structure), refer to:
- `.specify/templates/agent-file-template.md` (auto-generated from feature plans)
- Individual feature plans in `.specify/specs/###-feature-name/plan.md`

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
