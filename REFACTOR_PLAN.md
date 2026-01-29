# Refactoring Plan: Better Folder Organization

## Current Issues

1. **Large page files:** `app/page.tsx` is 491 lines - too much logic in one file
2. **Constants in pages:** `LIGHT_TAGS`, `MOOD_TAGS`, `SCENE_TAGS` are in `card-details/page.tsx`
3. **Inline components:** Large JSX blocks in pages could be extracted
4. **No feature grouping:** All components are flat in `components/`

## Proposed Refactoring

### Phase 1: Extract Constants

**Create:** `constants/tags.ts`
```typescript
export const LIGHT_TAGS = [...];
export const MOOD_TAGS = [...];
export const SCENE_TAGS = [...];
```

**Update:** `app/card-details/page.tsx` to import from constants

### Phase 2: Extract Page Components

**From `app/page.tsx`:**
- Extract `LandingView` component
- Extract `ResultsView` component  
- Extract `LoadingSpinner` component
- Extract `ErrorMessage` component

**From `app/select-photos/page.tsx`:**
- Extract `PhotoGrid` component
- Extract `PhotoUploader` component
- Extract `SelectionCounter` component

**From `app/card-details/page.tsx`:**
- Extract `CardDetailsForm` component
- Extract `TagSection` component

### Phase 3: Organize Components Folder

**New structure:**
```
components/
├── layout/
│   └── AppHeader.tsx
├── landing/
│   ├── LandingView.tsx
│   └── SourceOptionCard.tsx
├── photo-selection/
│   ├── PhotoGrid.tsx
│   └── PhotoUploader.tsx
├── card-details/
│   ├── CardDetailsForm.tsx
│   └── TagPill.tsx
├── results/
│   ├── ResultsView.tsx
│   ├── PaletteDisplay.tsx
│   └── ImagePreview.tsx
└── ui/
    ├── LoadingSpinner.tsx
    └── ErrorMessage.tsx
```

### Phase 4: Thin Out Pages

**Goal:** Pages should be ~50-100 lines, mostly imports and routing

**Example `app/page.tsx`:**
```typescript
import LandingView from "@/components/landing/LandingView";
import ResultsView from "@/components/results/ResultsView";
// ... minimal logic, mostly routing
```

## Implementation Order

1. ✅ Extract constants (low risk)
2. ✅ Extract UI components (LoadingSpinner, ErrorMessage)
3. ✅ Extract feature components (LandingView, ResultsView)
4. ✅ Reorganize components folder
5. ✅ Update all imports
6. ✅ Test everything works

## Benefits

- **Maintainability:** Easier to find and modify code
- **Reusability:** Components can be reused elsewhere
- **Testing:** Easier to test individual components
- **Scalability:** Easy to add new features
- **Readability:** Pages are cleaner and easier to understand
