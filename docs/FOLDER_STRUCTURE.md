# Folder Structure Guide

## Current Structure

### `app/` Folder (Next.js App Router)
**Purpose:** Contains routes and pages that define your application's URL structure.

**What goes here:**
- Route files (`page.tsx`, `layout.tsx`)
- Route-specific logic and state management
- Route metadata and configuration

**Current files:**
- `app/page.tsx` - Home page (`/`)
- `app/select-photos/page.tsx` - Photo selection page (`/select-photos`)
- `app/card-details/page.tsx` - Card details page (`/card-details`)
- `app/layout.tsx` - Root layout (wraps all pages)
- `app/globals.css` - Global styles

### `components/` Folder
**Purpose:** Contains reusable UI components that can be used across multiple pages.

**What goes here:**
- Reusable UI components
- Components used in multiple places
- Shared UI elements

**Current files:**
- `components/AppHeader.tsx` - Header used on multiple pages
- `components/SourceOptionCard.tsx` - Card component for options
- `components/TagPill.tsx` - Tag/pill component for selections

## Key Differences

| Aspect | `app/` Folder | `components/` Folder |
|--------|---------------|---------------------|
| **Purpose** | Routes/Pages (URL structure) | Reusable UI components |
| **Routing** | Defines URLs (`/`, `/select-photos`) | No routing, just components |
| **Reusability** | Page-specific, not reusable | Reusable across pages |
| **Next.js** | Special folder (App Router) | Regular folder |
| **File naming** | Must be `page.tsx` for routes | Any name |

## Proposed Better Organization

### Option 1: Feature-Based Components (Recommended)

```
color-vibe-app/
├── app/                          # Routes only
│   ├── layout.tsx
│   ├── page.tsx                  # Home page (thin, imports components)
│   ├── select-photos/
│   │   └── page.tsx              # Photo selection page (thin)
│   ├── card-details/
│   │   └── page.tsx              # Card details page (thin)
│   └── globals.css
│
├── components/                   # Organized by feature/domain
│   ├── layout/                   # Layout components
│   │   └── AppHeader.tsx
│   │
│   ├── landing/                  # Landing page components
│   │   ├── LandingView.tsx
│   │   ├── SourceOptionCard.tsx
│   │   └── SourceOptions.tsx
│   │
│   ├── photo-selection/          # Photo selection components
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── SelectionCounter.tsx
│   │
│   ├── card-details/             # Card details components
│   │   ├── CardDetailsForm.tsx
│   │   ├── TagSection.tsx
│   │   └── TagPill.tsx
│   │
│   ├── results/                  # Results page components
│   │   ├── ResultsView.tsx
│   │   ├── PaletteDisplay.tsx
│   │   ├── ColorSwatch.tsx
│   │   └── ImagePreview.tsx
│   │
│   └── ui/                       # Generic UI components
│       ├── Button.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
│
├── lib/                          # Utilities and helpers
│   ├── colorAnalysis.ts
│   ├── insights.ts
│   └── mockInsights.ts
│
├── contexts/                      # React contexts
│   └── PhotoContext.tsx
│
└── constants/                    # Constants and configs
    └── tags.ts                    # LIGHT_TAGS, MOOD_TAGS, etc.
```

### Option 2: Simpler Organization (Current + Minor Improvements)

```
color-vibe-app/
├── app/                          # Routes (keep as is)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── select-photos/page.tsx
│   ├── card-details/page.tsx
│   └── globals.css
│
├── components/                   # Better organized
│   ├── layout/                   # Layout-related
│   │   └── AppHeader.tsx
│   │
│   ├── cards/                    # Card components
│   │   └── SourceOptionCard.tsx
│   │
│   ├── forms/                    # Form components
│   │   └── TagPill.tsx
│   │
│   └── results/                  # Results components (future)
│       └── PaletteDisplay.tsx
│
├── lib/                          # Utilities
├── contexts/                      # Contexts
└── constants/                    # Constants
    └── tags.ts
```

## Benefits of Better Organization

1. **Easier to Find:** Components grouped by feature/domain
2. **Better Scalability:** Easy to add new features without clutter
3. **Clearer Separation:** Routes vs. reusable components
4. **Maintainability:** Related components are together
5. **Team Collaboration:** Multiple developers can work on different features

## Migration Strategy

1. **Start Small:** Create subfolders gradually
2. **Move Components:** Extract large page logic into components
3. **Extract Constants:** Move constants to separate files
4. **Update Imports:** Update import paths as you move files

## Best Practices

### ✅ DO:
- Keep `app/` pages thin (mostly imports and routing logic)
- Extract complex UI into `components/`
- Group related components together
- Use feature-based folders for larger apps

### ❌ DON'T:
- Put reusable components in `app/` folder
- Put route-specific logic in `components/`
- Create too many nested folders (keep it simple)
- Mix routing logic with UI components
