# Research: Calendar Customization and Note-Taking

**Feature**: 002-calendar-customization
**Date**: 2026-02-04
**Status**: Complete

## Research Questions

This document captures technical research and decisions for implementing notes, settings, holidays, and Chrome extension features.

## 1. localStorage Architecture for Notes and Settings

### Decision: Structured Key-Value Schema

**Chosen Approach**:
- Use prefixed keys for different data types: `miti:notes:`, `miti:settings:`, `miti:holidays:`
- Store notes with composite keys: `miti:notes:{nepali-date-YYYY-MM-DD}`
- Store settings as single JSON object: `miti:settings`
- Store holidays as single JSON object: `miti:holidays`

**Rationale**:
- Prefix prevents key collisions with other apps on same domain
- Nepali date format (YYYY-MM-DD) in keys ensures consistent retrieval
- Single settings object reduces localStorage operations
- Structured schema allows easy iteration over notes by prefix

**Data Structures**:
```typescript
// Note storage format
{
  "miti:notes:2082-09-15": [
    {
      "id": "uuid-v4-string",
      "text": "Note content",
      "timestamp": 1738665600000,  // Unix timestamp
      "created": 1738665600000,
      "modified": 1738665600000
    }
  ]
}

// Settings storage format
{
  "miti:settings": {
    "weekend": "both",  // "sunday" | "saturday" | "both"
    "sidebarPosition": "right",  // "left" | "right"
    "sidebarEnabled": true,
    "themeType": "color",  // "color" | "image"
    "backgroundColor": "#ffffff",
    "backgroundImage": "data:image/png;base64,..." // or URL
  }
}

// Holidays storage format
{
  "miti:holidays": {
    "2082": [
      {
        "name": "नयाँ वर्ष (New Year)",
        "date": "2082-01-01",
        "description": "Nepali New Year"
      }
    ]
  }
}
```

**Alternatives Considered**:
- ❌ IndexedDB: Too complex for simple key-value storage, async API adds complexity
- ❌ Separate localStorage keys per note: Would hit key limit faster, harder to iterate
- ❌ Single monolithic JSON: Would require parsing/serializing entire dataset on every operation

**Storage Quota Management**:
- localStorage typically has 5-10MB limit per origin
- Implement quota check before writes
- Character limit (5,000 chars/note) keeps individual items small
- Image limit (2MB) prevents single large items
- Estimated capacity: ~1000-2000 notes before quota issues

## 2. Modal Implementation (Vanilla JavaScript)

### Decision: Custom Modal Component with Event Delegation

**Chosen Approach**:
- Create reusable modal class: `Modal` with open/close methods
- Use CSS classes for show/hide animations
- Event delegation on modal backdrop for click-outside-to-close
- Escape key handler for accessibility
- Focus trap within modal when open

**Implementation Pattern**:
```typescript
class Modal {
  private element: HTMLElement;
  private backdrop: HTMLElement;

  constructor(content: HTMLElement) {
    // Create modal structure
    // Attach event listeners
  }

  open(): void {
    // Show modal with fade-in
    // Trap focus
    // Prevent body scroll
  }

  close(): void {
    // Fade out
    // Restore focus
    // Re-enable body scroll
  }
}
```

**Accessibility**:
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus management: trap focus within modal, restore on close
- Keyboard: Escape to close, Tab for focus cycling
- Screen reader: Announce modal opening

**Rationale**:
- No framework dependency (maintains constitution principle V)
- Reusable for both notes modal and settings modal
- Performance: Direct DOM manipulation, no virtual DOM overhead
- Full control over animations and behavior

**Alternatives Considered**:
- ❌ `<dialog>` element: Limited browser support in Safari 14 (target baseline)
- ❌ Third-party library (e.g., micromodal.js): Adds 4-5KB, unnecessary for simple use case
- ❌ CSS-only modal: Lacks programmatic control and accessibility features

## 3. Chrome Extension Manifest v3 Requirements

### Decision: Minimal Manifest with New Tab Override

**Chosen Approach**:
- Use Manifest v3 (current standard as of 2024)
- Override `chrome_url_overrides.newtab` to point to bundled index.html
- Request only `storage` permission (for localStorage API)
- Include icons at required sizes: 16x16, 48x48, 128x128

**Manifest Structure**:
```json
{
  "manifest_version": 3,
  "name": "Miti - Nepali Calendar",
  "version": "1.0.0",
  "description": "Nepali calendar with notes and customization",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ],
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

**Build Process**:
1. Build web app with Vite: `npm run build` → `dist/`
2. Copy manifest.json and icons to `dist/`
3. Package `dist/` as extension: `chrome://extensions` → Load unpacked

**Rationale**:
- New tab override is simplest extension type, no background scripts needed
- localStorage works identically in extensions as in web apps
- Minimal permissions reduce security review friction
- Extension is essentially a distribution wrapper around web app

**Alternatives Considered**:
- ❌ Browser action with popup: Requires clicking icon, not always visible
- ❌ Background service worker: Unnecessary for static calendar app
- ❌ Firefox add-on: Limit to Chrome first, expand later if needed

## 4. Holiday JSON Schema Design

### Decision: Year-Grouped Array Schema with Optional Descriptions

**Chosen Approach**:
- Group holidays by Nepali year (BS calendar)
- Support multiple years in single file
- Include optional description field
- Use Nepali date format: YYYY-MM-DD (BS)

**Schema**:
```typescript
{
  "holidays": {
    "2082": [
      {
        "name": "नयाँ वर्ष",
        "date": "2082-01-01",
        "description": "Nepali New Year"  // Optional
      },
      {
        "name": "Dashain",
        "date": "2082-06-23"
      }
    ],
    "2083": [
      // Holidays for 2083 BS
    ]
  }
}
```

**Validation Rules**:
- Year must be 4-digit number (e.g., 2082)
- Date must match format YYYY-MM-DD
- Name is required string
- Description is optional string
- Invalid entries are skipped with console warning

**Loading Strategy**:
- Attempt to fetch from `public/holidays/holidays.json`
- Parse and validate JSON structure
- Store in localStorage: `miti:holidays`
- If file missing or invalid: Calendar functions normally without holidays
- Update mechanism: User replaces holidays.json file and refreshes

**Rationale**:
- Year grouping allows efficient lookup for current year
- Optional description supports basic holidays and detailed religious dates
- Nepali date format aligns with calendar's internal representation
- Graceful degradation: Missing holidays don't break calendar

**Alternatives Considered**:
- ❌ Gregorian dates: Would require conversion on every lookup
- ❌ Flat array: Year-grouped lookup is O(n) vs O(holidays-per-year)
- ❌ API endpoint: Violates offline-first principle
- ❌ Built-in holidays: Requires maintenance for regional variations

## 5. Image Storage in localStorage (Data URLs)

### Decision: File Reader API with Data URL Conversion and Size Validation

**Chosen Approach**:
- Use FileReader API to read uploaded images
- Convert to base64 data URL: `data:image/png;base64,...`
- Store data URL directly in localStorage settings
- Validate file size before conversion (max 2MB)
- Support common formats: PNG, JPEG, GIF, WebP

**Implementation Flow**:
```typescript
async function handleImageUpload(file: File): Promise<string> {
  // Validate size
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image must be under 2MB');
  }

  // Validate type
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image format');
  }

  // Convert to data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**Size Considerations**:
- Base64 encoding increases size by ~33%
- 2MB file → ~2.66MB data URL
- localStorage limit: 5-10MB total (varies by browser)
- Image + notes should stay well under limit

**Rationale**:
- Data URLs are self-contained, no external requests
- Works offline without file system access
- Simple CSS: `background-image: url(data:...)`
- No additional dependencies

**Alternatives Considered**:
- ❌ Blob URLs: Don't persist across sessions
- ❌ IndexedDB: Too complex for single image
- ❌ External URL: Requires network, may break offline
- ❌ File System API: Limited browser support, requires permissions

## 6. localStorage Quota Management

### Decision: Proactive Checking with User Feedback

**Chosen Approach**:
- Check quota before large operations (notes, images)
- Catch QuotaExceededError on all writes
- Calculate approximate storage usage
- Display warning at 80% capacity
- Provide clear error messages with remediation steps

**Quota Checking**:
```typescript
function getStorageEstimate(): { used: number; total: number } {
  let used = 0;
  for (let key in localStorage) {
    if (key.startsWith('miti:')) {
      used += localStorage[key].length * 2; // UTF-16 chars = 2 bytes each
    }
  }
  const total = 5 * 1024 * 1024; // Assume 5MB (conservative)
  return { used, total };
}

function canStore(additionalBytes: number): boolean {
  const { used, total } = getStorageEstimate();
  return (used + additionalBytes) < total;
}
```

**Error Handling**:
```typescript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    showError('Storage full. Please delete old notes or background images.');
  }
}
```

**Rationale**:
- Prevents silent failures
- Gives users control over their data
- Warns before hitting limits
- Aligns with FR-028 requirement

**Alternatives Considered**:
- ❌ Navigator.storage API: Async, not available in all browsers
- ❌ Automatic pruning: User should control what gets deleted
- ❌ Ignore limits: Poor UX, data loss

## 7. Multi-Tab Synchronization

### Decision: Storage Event Listener Pattern

**Chosen Approach**:
- Listen for `storage` event on window
- Event fires when localStorage is modified in another tab
- Re-render affected UI components when relevant keys change
- Debounce updates to prevent thrashing

**Implementation**:
```typescript
window.addEventListener('storage', (e: StorageEvent) => {
  // Only respond to miti: keys
  if (!e.key || !e.key.startsWith('miti:')) return;

  if (e.key.startsWith('miti:notes:')) {
    // Refresh sidebar and notes indicator
    refreshSidebar();
    refreshCalendarIndicators();
  } else if (e.key === 'miti:settings') {
    // Reapply settings
    applySettings(JSON.parse(e.newValue));
  } else if (e.key === 'miti:holidays') {
    // Refresh holiday highlighting
    refreshHolidayHighlights();
  }
});
```

**Rationale**:
- Browser built-in mechanism, no polling needed
- Automatic synchronization across tabs
- Minimal performance impact
- Meets FR-027 requirement

**Edge Cases**:
- Same-tab changes: storage event doesn't fire in origin tab, handle locally
- Rapid changes: Debounce render updates (e.g., 100ms delay)
- Deleted items: Check for null newValue

**Alternatives Considered**:
- ❌ BroadcastChannel API: Not supported in Safari 14
- ❌ Polling: Inefficient, battery drain
- ❌ No sync: Poor UX, confusing for users with multiple tabs

## Research Summary

All technical questions resolved. Key decisions:
1. ✅ Prefixed localStorage keys with structured schema
2. ✅ Custom modal component for reusability and accessibility
3. ✅ Minimal Chrome extension manifest with new tab override
4. ✅ Year-grouped holiday JSON with optional descriptions
5. ✅ Data URL conversion for image storage with 2MB limit
6. ✅ Proactive quota checking with user feedback
7. ✅ Storage event listener for multi-tab sync

**No NEEDS CLARIFICATION items remain**. Ready for Phase 1 (Design & Contracts).
