export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  rgb: RGB;
  hex: string;
  hsl: HSL;
  label: string;
}

export interface PaletteSummary {
  colors: ColorInfo[];
  warmCoolBalance: number; // -1 (cool) to 1 (warm)
  averageSaturation: number; // 0 to 1
  averageBrightness: number; // 0 to 1
  dominantHues: number[]; // HSL hue values
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Get a human-readable color label
 */
function getColorLabel(hsl: HSL): string {
  const { h, s, l } = hsl;

  // Determine hue category
  let hueLabel = "";
  if (h < 15 || h >= 345) hueLabel = "red";
  else if (h < 45) hueLabel = "orange";
  else if (h < 75) hueLabel = "yellow";
  else if (h < 165) hueLabel = "green";
  else if (h < 195) hueLabel = "cyan";
  else if (h < 255) hueLabel = "blue";
  else if (h < 285) hueLabel = "purple";
  else hueLabel = "pink";

  // Determine tone
  let toneLabel = "";
  if (l < 20) toneLabel = "very dark";
  else if (l < 40) toneLabel = "dark";
  else if (l < 60) toneLabel = "";
  else if (l < 80) toneLabel = "light";
  else toneLabel = "very light";

  // Determine saturation
  let saturationLabel = "";
  if (s < 20) saturationLabel = "muted";
  else if (s < 50) saturationLabel = "soft";
  else if (s > 80) saturationLabel = "vibrant";

  const parts = [saturationLabel, toneLabel, hueLabel].filter(Boolean);
  return parts.join(" ") || "neutral";
}

/**
 * Extract dominant colors from an image using a simple quantization approach
 */
export async function extractPalette(
  imageUrl: string,
  colorCount: number = 6
): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Downscale for performance
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Collect all RGB values
      const colorMap = new Map<string, { rgb: RGB; count: number }>();

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors to reduce noise
        const qr = Math.round(r / 10) * 10;
        const qg = Math.round(g / 10) * 10;
        const qb = Math.round(b / 10) * 10;
        const key = `${qr},${qg},${qb}`;

        if (colorMap.has(key)) {
          colorMap.get(key)!.count++;
        } else {
          colorMap.set(key, { rgb: { r: qr, g: qg, b: qb }, count: 1 });
        }
      }

      // Sort by frequency and get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, colorCount * 3); // Get more candidates for better results (increased from 2x to 3x)

      // Further refine by removing very similar colors
      const refinedColors: ColorInfo[] = [];
      for (const [, { rgb }] of sortedColors) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

        // Skip colors that are too similar to already selected ones
        const isSimilar = refinedColors.some((existing) => {
          const hDiff = Math.abs(existing.hsl.h - hsl.h);
          const sDiff = Math.abs(existing.hsl.s - hsl.s);
          const lDiff = Math.abs(existing.hsl.l - hsl.l);
          return (
            (hDiff < 30 || hDiff > 330) && sDiff < 20 && lDiff < 20
          );
        });

        if (!isSimilar) {
          refinedColors.push({
            rgb,
            hex,
            hsl,
            label: getColorLabel(hsl),
          });

          if (refinedColors.length >= colorCount) break;
        }
      }

      // If we don't have enough colors, add remaining ones even if similar
      // This ensures we always return the requested number of colors
      if (refinedColors.length < colorCount && sortedColors.length > refinedColors.length) {
        for (const [, { rgb }] of sortedColors) {
          if (refinedColors.length >= colorCount) break;
          
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          
          // Only add if not already in the list (exact match)
          const alreadyExists = refinedColors.some(
            (existing) => existing.hex === hex
          );
          
          if (!alreadyExists) {
            refinedColors.push({
              rgb,
              hex,
              hsl,
              label: getColorLabel(hsl),
            });
          }
        }
      }

      resolve(refinedColors);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

/**
 * Combine palettes from multiple images and create a summary
 */
export function combinePalettes(
  palettes: ColorInfo[][]
): PaletteSummary {
  const allColors = palettes.flat();

  // Calculate average metrics
  let warmCount = 0;
  let coolCount = 0;
  let totalSaturation = 0;
  let totalBrightness = 0;
  const hueCounts = new Map<number, number>();

  allColors.forEach((color) => {
    const { h, s, l } = color.hsl;

    // Classify warm vs cool
    if ((h >= 0 && h < 60) || (h >= 300 && h < 360)) {
      warmCount++;
    } else if (h >= 180 && h < 300) {
      coolCount++;
    }

    totalSaturation += s / 100;
    totalBrightness += l / 100;

    // Track dominant hues (quantized)
    const hueBucket = Math.floor(h / 30) * 30;
    hueCounts.set(hueBucket, (hueCounts.get(hueBucket) || 0) + 1);
  });

  const total = allColors.length;
  const warmCoolBalance =
    total > 0 ? (warmCount - coolCount) / total : 0;
  const averageSaturation = total > 0 ? totalSaturation / total : 0;
  const averageBrightness = total > 0 ? totalBrightness / total : 0;

  // Get dominant hues
  const dominantHues = Array.from(hueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hue]) => hue);

  // Cluster similar colors to get representative palette
  const representativeColors: ColorInfo[] = [];
  const used = new Set<string>();

  // Sort by frequency in original palettes
  const colorFrequency = new Map<string, { color: ColorInfo; count: number }>();
  allColors.forEach((color) => {
    const key = color.hex;
    if (colorFrequency.has(key)) {
      colorFrequency.get(key)!.count++;
    } else {
      colorFrequency.set(key, { color, count: 1 });
    }
  });

  const sortedByFreq = Array.from(colorFrequency.values()).sort(
    (a, b) => b.count - a.count
  );

  // Determine minimum colors needed (at least 6, or all available if fewer)
  const minColors = Math.min(6, allColors.length);
  const maxColors = Math.min(8, allColors.length);
  
  // Adjust similarity thresholds based on available colors
  // If we have few colors, be less strict to ensure we get enough
  const hueThreshold = allColors.length <= 6 ? 20 : 30; // Stricter when we have more options
  const saturationThreshold = allColors.length <= 6 ? 30 : 25;
  const lightnessThreshold = allColors.length <= 6 ? 30 : 25;

  for (const { color } of sortedByFreq) {
    if (representativeColors.length >= maxColors) break;

    // Check if similar color already exists
    const isSimilar = representativeColors.some((existing) => {
      const hDiff = Math.abs(existing.hsl.h - color.hsl.h);
      const sDiff = Math.abs(existing.hsl.s - color.hsl.s);
      const lDiff = Math.abs(existing.hsl.l - color.hsl.l);
      return (
        (hDiff < hueThreshold || hDiff > (360 - hueThreshold)) && 
        sDiff < saturationThreshold && 
        lDiff < lightnessThreshold
      );
    });

    if (!isSimilar) {
      representativeColors.push(color);
    }
  }

  // If we still don't have enough colors, add remaining colors even if similar
  // This ensures we always have at least minColors
  if (representativeColors.length < minColors) {
    for (const { color } of sortedByFreq) {
      if (representativeColors.length >= minColors) break;
      
      // Only add if not already in the list (exact match)
      const alreadyExists = representativeColors.some(
        (existing) => existing.hex === color.hex
      );
      
      if (!alreadyExists) {
        representativeColors.push(color);
      }
    }
  }

  return {
    colors: representativeColors,
    warmCoolBalance,
    averageSaturation,
    averageBrightness,
    dominantHues,
  };
}
