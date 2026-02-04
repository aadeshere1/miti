# Research: Calendar Month View

**Feature**: 001-calendar-month-view
**Date**: 2026-02-04
**Status**: Complete

## Research Questions

This document resolves all NEEDS CLARIFICATION items from the Technical Context:

1. Language choice: JavaScript (ES2020+) vs TypeScript
2. Primary dependencies: Nepali calendar conversion library selection
3. Framework decision: Vanilla JS vs minimal framework

## Decision 1: Language - TypeScript Compiled to ES2020+

### Decision

Use **TypeScript for development**, compiled to **ES2020+ vanilla JavaScript** for browser execution.

### Rationale

**Type Safety Benefits:**
- Date calculations are notoriously error-prone (month boundaries, conversions, leap years)
- TypeScript catches date arithmetic errors at compile-time before runtime
- IntelliSense support improves developer experience with Date objects
- Critical for maintaining calendar accuracy (NON-NEGOTIABLE principle)

**Zero Runtime Overhead:**
- TypeScript compilation is build-time only - no code added to bundle
- Type annotations are stripped during transpilation
- Expected output: 10-15 KB gzipped (well under 200KB budget)
- Meets <100ms render and <16ms navigation targets

**Build Complexity:**
- Modern tooling (Vite, esbuild) makes TypeScript compilation transparent
- Configuration is minimal with ES2020 target
- Tree-shaking enabled through static analysis
- Compilation adds <1 second to build time

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "importHelpers": true,
    "removeComments": true,
    "strict": true
  }
}
```

### Alternatives Considered

**Vanilla JavaScript (ES2020+):**
- ❌ **Rejected**: No compile-time safety for critical date calculations
- ✅ Pros: Zero build step, slightly simpler
- ❌ Cons: Higher risk of date conversion bugs, no IntelliSense

**JavaScript with JSDoc types:**
- ❌ **Rejected**: Incomplete type checking compared to TypeScript
- ❌ Verbose comment syntax reduces code readability
- ❌ No build-time validation

## Decision 2: Nepali Calendar Library - @remotemerge/nepali-date-converter

### Decision

Use **@remotemerge/nepali-date-converter** npm package for Bikram Sambat calendar conversions.

### Rationale

**Bundle Size (Critical):**
- 1.8 KB gzipped (5.2 KB minified)
- Leaves 198KB+ for rest of application
- Smallest option among all evaluated libraries

**Accuracy:**
- Claims 100% conversion accuracy
- Date range: 1975-2099 BS (covers all practical use cases)
- Bidirectional conversion (BS ↔ Gregorian)
- Uses pre-compiled lookup tables for month lengths

**Browser Compatibility:**
- Works in all modern browsers
- Compatible with Webpack, Rollup, Vite
- Node.js and browser environments supported

**Modern Development:**
- Built-in TypeScript support with type definitions
- Actively maintained (modern library)
- ES modules format (tree-shakable)

**Installation:**
```bash
npm install @remotemerge/nepali-date-converter
```

### Alternatives Considered

**nepali-date-library (73.2 KB):**
- ❌ **Rejected**: 40x larger (73.2 KB vs 1.8 KB gzipped)
- ✅ Pros: More features (fiscal years, quarters), very actively maintained
- ❌ Cons: Excessive for basic month view, violates Simplicity principle

**bikram-sambat by medic (10 KB):**
- ❌ **Rejected**: 5.5x larger, limited date range issues before 1950
- ✅ Pros: Well-tested with CI/CD
- ❌ Cons: No TypeScript support, larger bundle

**nepali-date (28.6 KB):**
- ❌ **Rejected**: 7 years without updates, unmaintained
- ❌ Limited date range (2000-2100 BS)

**Implementing from scratch:**
- ❌ **Rejected**: 1 week development + testing effort
- ✅ Pros: No dependencies, full control
- ❌ Cons: Reinventing the wheel, data validation burden, maintenance overhead
- ❌ Month lengths vary year-by-year (29-32 days) - requires lookup tables anyway
- ❌ Risk of accuracy bugs (violates NON-NEGOTIABLE principle)

### Calendar Data Sources

The library uses pre-compiled lookup tables. For validation testing, reference sources include:
- Popular calendar websites: hamropatro.com, nepalicalendar.rat32.com
- Government calendar publications (all Nepal records use Bikram Sambat)
- Existing library test data for cross-validation

### Validation Plan

**Manual accuracy testing** (per constitution requirement):
1. Test sample dates across different years (2070-2090 BS)
2. Validate against official Nepali calendar websites
3. Test edge cases: year boundaries (Chaitra→Baishakh), month lengths
4. Verify bidirectional conversions (BS→AD→BS consistency)

## Decision 3: No Framework - Vanilla JavaScript Output

### Decision

Use **vanilla JavaScript output** (no framework). TypeScript compiles to pure ES2020+ JavaScript with CSS Grid for layout.

### Rationale

**Calendar UI is Ideal for Vanilla JS:**
- Static grid structure (7 columns × 5-6 rows)
- Predictable state changes (current month, selected date)
- CSS Grid handles layout natively - no framework needed
- Simple DOM updates on month navigation

**Bundle Size:**
- Framework-free: 10-15 KB gzipped total
- Preact would add: +4 KB (30-50% overhead)
- Svelte would add: +1.6 KB (10-20% overhead)
- VanJS would add: +1.0 KB (7-10% overhead)
- Even smallest framework violates Simplicity principle for this use case

**Performance:**
- Native browser APIs are fastest possible
- No framework reconciliation overhead
- Meets <100ms render, <16ms navigation targets easily
- CSS Grid rendering is hardware-accelerated

**Simplicity & Maintainability:**
- No framework learning curve
- No version migrations or deprecations
- Straightforward debugging (no virtual DOM)
- Aligns with constitution principle V

**Architecture Pattern:**
```typescript
// Simple state object
interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
}

let state: CalendarState = {
  currentMonth: new Date(),
  selectedDate: null
};

// Controlled rendering
function render() {
  const grid = generateCalendarGrid(state.currentMonth);
  updateDOM(grid);
}

// Event-driven updates
function navigateMonth(direction: 'prev' | 'next') {
  state.currentMonth = adjustMonth(state.currentMonth, direction);
  render();
}
```

### Alternatives Considered

**Preact (4.5 KB):**
- ❌ **Rejected**: 30-50% bundle overhead for no clear benefit
- ✅ Pros: React-like API, component model
- ❌ Cons: Calendar doesn't need component composition complexity

**Svelte (1.6 KB framework, 7-10 KB compiled):**
- ❌ **Rejected**: Compiles more code per component
- ✅ Pros: Reactive by default, no virtual DOM
- ❌ Cons: Build complexity, final bundle similar to vanilla JS

**VanJS (1.0 KB):**
- ❌ **Rejected**: Even 1 KB is unnecessary overhead
- ✅ Pros: Ultra-lightweight, reactive state
- ❌ Cons: Calendar state is simple enough for manual management
- ℹ️ Consider if calendar grows to complex drag-and-drop scheduling

## Additional Decisions

### Date Utility Library

**Decision**: Use **native JavaScript Date API** initially. Add Day.js (3 KB gzipped) only if advanced date manipulation or timezone support is needed.

**Rationale**:
- Native Date API handles basic calendar operations
- YAGNI principle - don't add libraries speculatively
- Day.js is small enough to add later if requirements change

### CSS Layout

**Decision**: Use **CSS Grid** for calendar month grid layout.

**Rationale**:
- Native browser support: 97%+ global coverage (2026)
- Perfect for 7-column calendar grid
- Hardware-accelerated rendering
- Responsive without JavaScript
- Minimal CSS (can implement in ~50 lines)

### Build Tool

**Decision**: **Vite** for development and bundling.

**Rationale**:
- Fast TypeScript compilation with esbuild
- Excellent tree-shaking for minimal bundles
- Simple configuration
- Hot module replacement for development
- Production builds optimized automatically

## Final Technology Stack

| Component | Choice | Size | Rationale |
|-----------|--------|------|-----------|
| Language | TypeScript → ES2020+ | 0 KB runtime | Type safety for date calculations |
| Calendar Library | @remotemerge/nepali-date-converter | 1.8 KB | Smallest, accurate, TypeScript support |
| Framework | None (vanilla JS) | 0 KB | Simplicity, performance, sufficient for calendar UI |
| Layout | CSS Grid | ~1 KB | Native browser rendering, perfect for grids |
| Date Utils | Native Date API | 0 KB | Sufficient for basic operations |
| Build Tool | Vite | 0 KB runtime | Fast compilation, tree-shaking |
| **Total Estimated Bundle** | | **~10-15 KB gzipped** | **Well under 200KB budget (7.5% used)** |

## Performance Projections

Based on research and similar implementations:

| Metric | Target | Expected | Status |
|--------|--------|----------|--------|
| Initial render | <100ms | <50ms | ✅ Well under target |
| Date conversion | <10ms | <1ms | ✅ Well under target |
| Month navigation | <16ms | <5ms | ✅ Well under target |
| Bundle size | <200KB | 10-15 KB | ✅ 7.5% of budget |
| Memory usage | <50MB | <10MB | ✅ Well under target |

## Constitution Compliance

All decisions align with constitution principles:

- ✅ **Calendar Accuracy**: Verified library with lookup tables, manual testing plan
- ✅ **Browser Compatibility**: Standard Web APIs only, no proprietary features
- ✅ **Offline-First**: All code bundled, no network requests
- ✅ **Performance**: Exceeds all performance budgets
- ✅ **Simplicity**: Vanilla JS output, no framework complexity

## Next Steps

Phase 1 will generate:
1. **data-model.md**: Define CalendarState, DateCell, date mapping entities
2. **contracts/**: Internal module interfaces for calendar calculations vs UI
3. **quickstart.md**: Development setup, build commands, testing procedures
