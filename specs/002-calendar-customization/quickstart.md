# Quickstart: Calendar Customization and Note-Taking

**Feature**: 002-calendar-customization
**Branch**: `002-calendar-customization`
**Date**: 2026-02-04

## Overview

This guide helps you implement calendar customization and note-taking features. These features extend the existing Nepali calendar with personalization and user data storage.

## Prerequisites

- Completed feature 001-calendar-month-view (baseline calendar functionality)
- Node.js 16+ and npm installed
- TypeScript 5.0+ configured
- Vite build tool set up
- Modern browser for testing (Chrome, Firefox, or Safari)

## Project Setup

```bash
# 1. Ensure you're on the feature branch
git checkout 002-calendar-customization

# 2. Install dependencies (no new dependencies needed)
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000
```

## Implementation Phases

### Phase 1: Notes System (Priority P1)

**Goal**: Allow users to add, edit, and delete notes for any date.

**Files to Create**:
```
src/notes/
├── notes-types.ts       # Note interface and types
├── notes-storage.ts     # localStorage CRUD operations
├── notes-modal.ts       # Modal UI component
└── notes-ui.ts          # Visual indicator on calendar cells
```

**Steps**:

1. **Create Note Types** (`src/notes/notes-types.ts`):
```typescript
export interface Note {
  id: string;
  text: string;
  timestamp: number;
  created: number;
  modified: number;
}

export const MAX_NOTE_LENGTH = 5000;
```

2. **Implement Storage Layer** (`src/notes/notes-storage.ts`):
```typescript
import { Note } from './notes-types';
import { v4 as uuidv4 } from 'uuid';  // Or implement simple UUID generator

export function getNotesForDate(nepaliDate: string): Note[] {
  const key = `miti:notes:${nepaliDate}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

export function addNote(nepaliDate: string, text: string): Note {
  if (text.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note exceeds ${MAX_NOTE_LENGTH} character limit`);
  }

  const notes = getNotesForDate(nepaliDate);
  const now = Date.now();

  const note: Note = {
    id: uuidv4(),
    text,
    timestamp: now,
    created: now,
    modified: now
  };

  notes.push(note);

  const key = `miti:notes:${nepaliDate}`;
  try {
    localStorage.setItem(key, JSON.stringify(notes));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage full. Please delete old notes.');
    }
    throw e;
  }

  return note;
}

// Implement updateNote, deleteNote, hasNotes, etc.
```

3. **Create Modal Component** (`src/notes/notes-modal.ts`):
```typescript
export class NotesModal {
  private modal: HTMLElement;
  private backdrop: HTMLElement;
  private currentDate: string | null = null;

  constructor() {
    this.createModalStructure();
    this.attachEventListeners();
  }

  open(nepaliDate: string): void {
    this.currentDate = nepaliDate;
    this.loadNotes();
    this.modal.classList.add('visible');
    document.body.classList.add('modal-open');
  }

  close(): void {
    this.modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    this.currentDate = null;
  }

  private createModalStructure(): void {
    // Create modal HTML structure
    // Include: header, notes list, add note form, close button
  }

  private loadNotes(): void {
    if (!this.currentDate) return;
    const notes = getNotesForDate(this.currentDate);
    this.renderNotesList(notes);
  }

  // Implement renderNotesList, handleAddNote, handleEditNote, etc.
}
```

4. **Add Visual Indicators** (`src/notes/notes-ui.ts`):
```typescript
import { hasNotes, getNotesCount } from './notes-storage';

export function addNotesIndicator(
  dateCell: HTMLElement,
  nepaliDate: string
): void {
  if (hasNotes(nepaliDate)) {
    const indicator = document.createElement('div');
    indicator.classList.add('notes-indicator');
    indicator.textContent = `${getNotesCount(nepaliDate)}`;
    dateCell.appendChild(indicator);
  }
}
```

5. **Integrate with Calendar Grid** (`src/components/CalendarGrid.ts`):
```typescript
// Add imports
import { addNotesIndicator } from '../notes/notes-ui';
import { NotesModal } from '../notes/notes-modal';

// Initialize modal once
const notesModal = new NotesModal();

// In renderCalendarGrid function, add click handlers
dateCell.addEventListener('click', () => {
  notesModal.open(cell.nepaliDateString);
});

// Add indicators after creating date cells
addNotesIndicator(dateCell, cell.nepaliDateString);
```

6. **Add CSS** (`src/styles/calendar.css`):
```css
/* Notes indicator */
.notes-indicator {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #0066cc;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  z-index: 1000;
}

.modal.visible {
  opacity: 1;
  visibility: visible;
}

/* More modal styles... */
```

**Testing**:
- Click any date → modal opens
- Add note → saves to localStorage
- Refresh page → notes persist
- Edit/delete notes → updates localStorage
- Visual indicator appears on dates with notes

---

### Phase 2: Notes Sidebar (Priority P1)

**Goal**: Display all notes for current month in a sidebar panel.

**Files to Create**:
```
src/sidebar/
├── sidebar-component.ts   # Sidebar rendering
├── sidebar-state.ts       # Sidebar configuration
└── sidebar-ui.ts          # Click handlers for jumping to dates
```

**Steps**:

1. **Create Sidebar Component** (`src/sidebar/sidebar-component.ts`):
```typescript
import { getNotesForMonth } from '../notes/notes-storage';

export class NotesSidebar {
  private container: HTMLElement;
  private currentYear: number;
  private currentMonth: number;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  render(year: number, month: number): void {
    this.currentYear = year;
    this.currentMonth = month;

    const monthNotes = getNotesForMonth(year, month);

    if (monthNotes.size === 0) {
      this.renderEmptyState();
    } else {
      this.renderNotesList(monthNotes);
    }
  }

  private renderNotesList(monthNotes: Map<string, Note[]>): void {
    // Render list of notes grouped by date
    // Add click handlers to jump to date
  }

  private renderEmptyState(): void {
    this.container.innerHTML = `
      <div class="sidebar-empty">
        <p>No notes for this month</p>
      </div>
    `;
  }
}
```

2. **Add Sidebar to HTML** (`index.html`):
```html
<div class="app-container">
  <!-- Existing calendar -->
  <div class="calendar-container">
    <!-- Calendar content -->
  </div>

  <!-- New sidebar -->
  <aside id="notes-sidebar" class="notes-sidebar">
    <!-- Sidebar content rendered by JavaScript -->
  </aside>
</div>
```

3. **Update Main Render** (`src/main.ts`):
```typescript
import { NotesSidebar } from './sidebar/sidebar-component';

const sidebar = new NotesSidebar('notes-sidebar');

export function render(): void {
  const state = getState();
  const calendarMonth = generateCalendarGrid(state.currentMonth);

  renderWeekdayHeaders();
  renderMonthHeader(...);
  renderCalendarGrid(calendarMonth);

  // Render sidebar with current month notes
  sidebar.render(calendarMonth.nepaliYear, calendarMonth.nepaliMonth);
}
```

4. **Add Sidebar CSS** (`src/styles/calendar.css`):
```css
.app-container {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.notes-sidebar {
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notes-sidebar.position-left {
  order: -1;
}

.notes-sidebar.position-right {
  order: 1;
}

/* More sidebar styles... */
```

**Testing**:
- Add notes to multiple dates → appear in sidebar
- Click note in sidebar → jumps to that date and opens modal
- Navigate months → sidebar updates
- Real-time updates when notes added/edited

---

### Phase 3: Settings & Weekend Configuration (Priority P2)

**Goal**: Allow users to configure weekends and sidebar preferences.

**Files to Create**:
```
src/settings/
├── settings-types.ts      # Settings interface
├── settings-storage.ts    # localStorage for settings
└── settings-modal.ts      # Settings UI
```

**Steps**:

1. **Create Settings Types** (`src/settings/settings-types.ts`):
```typescript
export type WeekendConfig = 'sunday' | 'saturday' | 'both';
export type SidebarPosition = 'left' | 'right';
export type ThemeType = 'color' | 'image' | 'none';

export interface Settings {
  weekend: WeekendConfig;
  sidebarPosition: SidebarPosition;
  sidebarEnabled: boolean;
  themeType: ThemeType;
  backgroundColor?: string;
  backgroundImage?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  weekend: 'both',
  sidebarPosition: 'right',
  sidebarEnabled: true,
  themeType: 'none',
  backgroundColor: '#ffffff'
};
```

2. **Implement Settings Storage** (`src/settings/settings-storage.ts`):
```typescript
import { Settings, DEFAULT_SETTINGS } from './settings-types';

const SETTINGS_KEY = 'miti:settings';

export function getSettings(): Settings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
}

export function updateSettings(updates: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

export function isWeekend(dayOfWeek: number): boolean {
  const settings = getSettings();
  switch (settings.weekend) {
    case 'sunday': return dayOfWeek === 0;
    case 'saturday': return dayOfWeek === 6;
    case 'both': return dayOfWeek === 0 || dayOfWeek === 6;
  }
}
```

3. **Apply Weekend Highlighting** (`src/components/CalendarGrid.ts`):
```typescript
import { isWeekend } from '../settings/settings-storage';

// In renderCalendarGrid function
if (isWeekend(cell.dayOfWeek)) {
  dateCell.classList.add('weekend');
}
```

4. **Add Weekend CSS** (`src/styles/calendar.css`):
```css
.date-cell.weekend .nepali-date {
  color: #dc2626;  /* Red color */
}

.date-cell.weekend .gregorian-date {
  color: #dc2626;
}
```

**Testing**:
- Change weekend setting → dates update color
- Toggle sidebar → visibility changes
- Change sidebar position → moves left/right
- Settings persist across refreshes

---

### Phase 4: Holidays (Priority P3)

**Goal**: Load and display holidays from JSON file.

**Files to Create**:
```
src/holidays/
├── holidays-types.ts     # Holiday interface
├── holidays-loader.ts    # JSON file loading
└── holidays-storage.ts   # Holiday queries

public/holidays/
└── holidays.json         # Holiday data file
```

**Implementation**: Follow similar pattern to notes system.

---

### Phase 5: Theme Customization (Priority P3)

**Goal**: Allow background color/image customization.

**Implementation**: Extend settings modal with color picker and file upload.

---

### Phase 6: Chrome Extension (Priority P3)

**Goal**: Package as Chrome extension for new tab page.

**Files to Create**:
```
extension/
├── manifest.json
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

**Steps**:

1. Create manifest.json with new tab override
2. Build app: `npm run build`
3. Copy manifest and icons to `dist/`
4. Load unpacked extension in Chrome

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Preview production build
npm run preview
```

## Testing Checklist

- [ ] Notes persist across browser sessions
- [ ] Modal opens/closes smoothly (<300ms)
- [ ] Sidebar updates in real-time
- [ ] Weekend highlighting works for all three configurations
- [ ] Settings persist across sessions
- [ ] Holidays load from JSON without errors
- [ ] Theme customization applies immediately
- [ ] localStorage quota errors handled gracefully
- [ ] Multi-tab synchronization works
- [ ] Chrome extension installs and functions correctly

## Debugging Tips

### Check localStorage
```javascript
// View all miti data
for (let key in localStorage) {
  if (key.startsWith('miti:')) {
    console.log(key, localStorage[key]);
  }
}

// Clear all data
for (let key in localStorage) {
  if (key.startsWith('miti:')) {
    localStorage.removeItem(key);
  }
}
```

### Monitor Storage Events
```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.oldValue, e.newValue);
});
```

### Check Bundle Size
```bash
npm run build
ls -lh dist/assets/*.js
```

## Performance Monitoring

Monitor these metrics during implementation:

- **Modal Open**: Should be <300ms
- **Sidebar Render**: Should be <500ms with 100 notes
- **Settings Apply**: Should be <200ms
- **Bundle Size**: Should stay under 200KB gzipped

## Support

For questions or issues:
1. Review [spec.md](spec.md) for requirements
2. Check [data-model.md](data-model.md) for entity definitions
3. Reference [contracts/](contracts/) for API interfaces
4. Consult [research.md](research.md) for technical decisions

## Next Steps

After completing implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Follow tasks.md for step-by-step implementation
3. Test across Chrome, Firefox, and Safari
4. Measure bundle size and performance metrics
5. Create pull request with constitution compliance check
