# Color Palette Extraction & Analysis Logic

## Overview

The color analysis system extracts dominant colors from uploaded images, combines them across multiple images, and generates styling insights. This document explains how each step works.

---

## Part 1: Color Extraction from Single Image

### Process: `extractPalette(imageUrl, colorCount = 6)`

**Location:** `lib/colorAnalysis.ts`

### Step-by-Step Process

#### 1. **Image Loading & Canvas Setup**
```typescript
- Loads image using HTML Image API
- Creates HTML5 Canvas element
- Downscales image to max 200px (for performance)
- Draws image onto canvas
```

**Why downscale?** Processing fewer pixels is faster while maintaining color accuracy.

#### 2. **Pixel Data Extraction**
```typescript
- Gets ImageData from canvas (RGBA values for each pixel)
- Iterates through all pixels (every 4 values = 1 pixel: R, G, B, A)
```

#### 3. **Color Quantization**
```typescript
- Groups similar colors together to reduce noise
- Quantizes RGB values: rounds to nearest 10 (e.g., 127 → 130)
- Example: RGB(127, 45, 201) → RGB(130, 50, 200)
- Skips transparent pixels (alpha < 128)
```

**Why quantize?** Reduces millions of unique colors to manageable groups, eliminating noise from compression artifacts.

#### 4. **Frequency Counting**
```typescript
- Counts how many times each quantized color appears
- Creates a map: { "130,50,200": { rgb: RGB, count: 1523 } }
- Sorts by frequency (most common colors first)
```

#### 5. **Color Refinement**
```typescript
- Takes top (colorCount * 2) candidates
- Removes similar colors to avoid duplicates
- Similarity check:
  - Hue difference < 30° OR > 330° (wraps around color wheel)
  - Saturation difference < 20%
  - Lightness difference < 20%
- Returns top 6 distinct colors
```

**Example:**
- If two colors are both "blue" (hue ~240°) but slightly different shades
- If they're too similar (within thresholds), keep only the more frequent one

#### 6. **Color Information Creation**
For each selected color:
```typescript
- Converts RGB → HEX (#RRGGBB format)
- Converts RGB → HSL (Hue, Saturation, Lightness)
- Generates human-readable label (e.g., "vibrant blue", "muted red")
```

**Color Label Logic:**
- **Hue categories:** red, orange, yellow, green, cyan, blue, purple, pink
- **Tone:** very dark, dark, (normal), light, very light
- **Saturation:** muted, soft, (normal), vibrant
- Example: "vibrant light blue" or "muted dark red"

---

## Part 2: Combining Multiple Image Palettes

### Process: `combinePalettes(palettes: ColorInfo[][])`

**Location:** `lib/colorAnalysis.ts`

### Step-by-Step Process

#### 1. **Flatten All Colors**
```typescript
- Combines all colors from all images into one array
- Example: 3 images × 6 colors each = 18 colors total
```

#### 2. **Calculate Overall Metrics**

**Warm/Cool Balance:**
```typescript
- Warm colors: Hue 0-60° (red/orange/yellow) OR 300-360° (pink/red)
- Cool colors: Hue 180-300° (cyan/blue/purple)
- Balance = (warmCount - coolCount) / totalColors
- Range: -1 (very cool) to +1 (very warm)
```

**Average Saturation:**
```typescript
- Sums all saturation values (0-100%)
- Divides by total colors
- Range: 0 (grayscale) to 1 (very vibrant)
```

**Average Brightness:**
```typescript
- Sums all lightness values (0-100%)
- Divides by total colors
- Range: 0 (very dark) to 1 (very light)
```

**Dominant Hues:**
```typescript
- Groups hues into 30° buckets (0-30, 30-60, 60-90, etc.)
- Counts frequency in each bucket
- Returns top 5 most common hue ranges
```

#### 3. **Create Representative Palette**
```typescript
- Counts frequency of each exact color across all images
- Sorts by frequency (most common colors first)
- Selects up to 8 colors, avoiding similar ones
- Similarity check: hue diff < 30°, saturation diff < 25%, lightness diff < 25%
```

**Result:** `PaletteSummary` with:
- `colors`: Array of 6-8 representative colors
- `warmCoolBalance`: -1 to +1
- `averageSaturation`: 0 to 1
- `averageBrightness`: 0 to 1
- `dominantHues`: Top 5 hue ranges

---

## Part 3: Determining Primary, Secondary, Match, and Avoid Colors

### Location: `lib/mockInsights.ts` → `generateMockInsights()`

### Primary Colors

**How it's determined:**
```typescript
colors.slice(0, 3)  // First 3 colors from combined palette
```

**Logic:**
- These are the **most frequent colors** across all images
- Already sorted by frequency in `combinePalettes()`
- Represent the dominant visual theme

**Display:** Shown as "PRIMARY COLORS" on results page

### Secondary Colors

**How it's determined:**
```typescript
colors.slice(3)  // Remaining colors after primary (4th, 5th, 6th, etc.)
```

**Logic:**
- Colors that appear frequently but less than primary colors
- Still part of the palette but supporting colors
- Up to 5 additional colors

**Display:** Shown as "SECONDARY COLORS" on results page

### Match Colors (Colors to Use)

**How it's determined:**
```typescript
colors.slice(0, 5).map(c => ({ hex: c.hex, label: c.label }))
```

**Logic:**
- **Top 5 colors** from the combined palette
- These are the colors that should be used in styling
- Based on what's actually in the images

**Display:** Shown as "MATCH COLORS" on results page

**Why these?** They represent the actual color scheme from the photos, so using them will create harmony.

### Avoid Colors (Colors to Avoid)

**How it's determined:** More complex logic based on palette characteristics

#### Step 1: Calculate Complementary Colors
```typescript
dominantHues.forEach(hue => {
  const complementary = (hue + 180) % 360;  // Opposite on color wheel
  avoidHues.add(complementary);
})
```

**Example:**
- If dominant hue is 240° (blue)
- Complementary = (240 + 180) % 360 = 60° (yellow/orange)
- These clash with the palette

#### Step 2: Generate Avoid Colors Based on Palette Characteristics

**If palette is warm (warmCoolBalance > 0):**
```typescript
colorsToAvoid.push({ hex: "#0066cc", label: "cool blue" });
colorsToAvoid.push({ hex: "#00cc99", label: "cool teal" });
```
**Reason:** Warm palettes clash with cool colors

**If palette is cool (warmCoolBalance < 0):**
```typescript
colorsToAvoid.push({ hex: "#ff6600", label: "warm orange" });
colorsToAvoid.push({ hex: "#ffcc00", label: "warm yellow" });
```
**Reason:** Cool palettes clash with warm colors

**If palette is highly saturated (averageSaturation > 0.6):**
```typescript
colorsToAvoid.push({ hex: "#808080", label: "muted gray" });
```
**Reason:** Muted colors will look dull next to vibrant colors

**If palette is muted (averageSaturation < 0.6):**
```typescript
colorsToAvoid.push({ hex: "#ff0066", label: "vibrant pink" });
colorsToAvoid.push({ hex: "#00ff00", label: "neon green" });
```
**Reason:** Vibrant colors will overpower muted palettes

**Display:** Shown as "AVOID COLORS" on results page (max 3 colors)

**Why these?** They would create visual discord with the palette, either by clashing (complementary) or by being too different in saturation/brightness.

---

## Visual Flow Diagram

```
┌─────────────────┐
│  Upload Images  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  For each image:                │
│  1. Load & downscale            │
│  2. Extract pixel data          │
│  3. Quantize colors             │
│  4. Count frequency             │
│  5. Refine (remove similar)     │
│  6. Return top 6 colors         │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Combine all palettes:          │
│  1. Flatten all colors          │
│  2. Calculate metrics:          │
│     - Warm/cool balance         │
│     - Avg saturation            │
│     - Avg brightness            │
│     - Dominant hues             │
│  3. Create representative       │
│     palette (6-8 colors)        │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Generate Insights:              │
│                                  │
│  PRIMARY COLORS:                │
│  → colors[0..2] (top 3)         │
│                                  │
│  SECONDARY COLORS:               │
│  → colors[3..] (remaining)      │
│                                  │
│  MATCH COLORS:                   │
│  → colors[0..4] (top 5)         │
│                                  │
│  AVOID COLORS:                   │
│  → Complementary hues           │
│  → Opposite saturation           │
│  → Clashing tones                │
└─────────────────────────────────┘
```

---

## Example Calculation

### Input: 2 Images

**Image 1 Palette:**
- Blue (#3B82F6) - appears 2000 times
- Light blue (#93C5FD) - appears 1500 times
- White (#FFFFFF) - appears 1200 times
- Gray (#9CA3AF) - appears 800 times
- Dark blue (#1E40AF) - appears 600 times
- Navy (#1E3A8A) - appears 400 times

**Image 2 Palette:**
- Blue (#3B82F6) - appears 1800 times
- Light blue (#93C5FD) - appears 1400 times
- Cyan (#06B6D4) - appears 1000 times
- White (#FFFFFF) - appears 900 times
- Teal (#14B8A6) - appears 700 times
- Gray (#9CA3AF) - appears 500 times

### Combined Analysis

**Frequency Count:**
1. Blue (#3B82F6): 3800 times
2. Light blue (#93C5FD): 2900 times
3. White (#FFFFFF): 2100 times
4. Cyan (#06B6D4): 1000 times
5. Gray (#9CA3AF): 1300 times
6. Teal (#14B8A6): 700 times

**Metrics:**
- Warm/Cool Balance: -0.8 (very cool - all blues/cyans)
- Average Saturation: 0.6 (moderately vibrant)
- Average Brightness: 0.7 (fairly light)
- Dominant Hues: [210° (blue), 195° (cyan)]

### Result Categories

**PRIMARY COLORS:**
1. Blue (#3B82F6)
2. Light blue (#93C5FD)
3. White (#FFFFFF)

**SECONDARY COLORS:**
4. Cyan (#06B6D4)
5. Gray (#9CA3AF)
6. Teal (#14B8A6)

**MATCH COLORS:**
1. Blue (#3B82F6)
2. Light blue (#93C5FD)
3. White (#FFFFFF)
4. Cyan (#06B6D4)
5. Gray (#9CA3AF)

**AVOID COLORS:**
- Warm orange (#ff6600) - complementary to blue
- Warm yellow (#ffcc00) - complementary to blue
- Vibrant pink (#ff0066) - too saturated for this palette

---

## Technical Details

### Color Space Conversions

**RGB → HEX:**
```typescript
"#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join("")
```

**RGB → HSL:**
- Uses standard color space conversion algorithm
- Normalizes RGB to 0-1 range
- Calculates hue using color wheel position
- Calculates saturation based on colorfulness
- Calculates lightness as average of max/min RGB

### Performance Optimizations

1. **Image Downscaling:** Reduces pixels from millions to ~40,000
2. **Color Quantization:** Groups similar colors (reduces unique colors by ~90%)
3. **Early Termination:** Stops processing once enough colors found
4. **Similarity Filtering:** Prevents duplicate colors in final palette

### Limitations

1. **Quantization:** May miss subtle color variations
2. **Similarity Thresholds:** Fixed thresholds may not work for all images
3. **Frequency-Based:** Doesn't consider spatial distribution (where colors appear)
4. **Mock Insights:** Avoid colors are rule-based, not AI-generated

---

## Future Improvements

1. **Spatial Analysis:** Consider where colors appear (foreground vs background)
2. **Color Harmony:** Use color theory (triadic, analogous, etc.) for better suggestions
3. **AI Integration:** Replace mock insights with ML model trained on design data
4. **User Preferences:** Allow users to adjust saturation/brightness preferences
5. **Color Accessibility:** Check contrast ratios for readability
