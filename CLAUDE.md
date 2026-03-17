# miti Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-04

## Active Technologies
- TypeScript → JavaScript (ES2020+) + @remotemerge/nepali-date-converter (1.8 KB), Vite (build only) (002-calendar-customization)
- Browser localStorage for notes, settings, and holiday data (002-calendar-customization)
- TypeScript (compiled to ES2020+ JavaScript) — matches existing codebase + @remotemerge/nepali-date-converter (1.8 KB gzipped), Vite (build only) — no new dependencies (004-daily-challenges)
- Browser localStorage — `miti:challenges` for definitions, `miti:challenge-completions:YYYY-MM-DD` for daily data (004-daily-challenges)

- TypeScript (compiled to ES2020+ JavaScript) - Resolved in research.md: type safety critical for date calculations, zero runtime overhead + @remotemerge/nepali-date-converter (1.8 KB gzipped) - Resolved in research.md: smallest, accurate, TypeScript-supported library; no framework (vanilla JS output) (001-calendar-month-view)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (compiled to ES2020+ JavaScript) - Resolved in research.md: type safety critical for date calculations, zero runtime overhead: Follow standard conventions

## Recent Changes
- 004-daily-challenges: Added TypeScript (compiled to ES2020+ JavaScript) — matches existing codebase + @remotemerge/nepali-date-converter (1.8 KB gzipped), Vite (build only) — no new dependencies
- 002-calendar-customization: Added TypeScript → JavaScript (ES2020+) + @remotemerge/nepali-date-converter (1.8 KB), Vite (build only)

- 001-calendar-month-view: Added TypeScript (compiled to ES2020+ JavaScript) - Resolved in research.md: type safety critical for date calculations, zero runtime overhead + @remotemerge/nepali-date-converter (1.8 KB gzipped) - Resolved in research.md: smallest, accurate, TypeScript-supported library; no framework (vanilla JS output)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
