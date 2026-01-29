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
 * Debug function to analyze color extraction issues
 * Returns detailed information about the color extraction process
 */
export async function debugColorExtraction(
  imageUrl: string,
  colorCount: number = 6
): Promise<{
  totalPixels: number;
  uniqueColors: number;
  topColors: Array<{ hex: string; count: number; percentage: number }>;
  extractedColors: ColorInfo[];
  imageSize: { width: number; height: number };
  processedSize: { width: number; height: number };
}> {
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

      const originalSize = { width: img.width, height: img.height };
      
      // Same downscaling logic as main function
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const processedSize = { width: canvas.width, height: canvas.height };

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const colorMap = new Map<string, { rgb: RGB; count: number }>();
      let totalPixels = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 128) continue;
        totalPixels++;

        const qr = Math.round(r / 6) * 6;
        const qg = Math.round(g / 6) * 6;
        const qb = Math.round(b / 6) * 6;
        const key = `${qr},${qg},${qb}`;

        if (colorMap.has(key)) {
          colorMap.get(key)!.count++;
        } else {
          colorMap.set(key, { rgb: { r: qr, g: qg, b: qb }, count: 1 });
        }
      }

      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1].count - a[1].count);

      const topColors = sortedColors.slice(0, 20).map(([, { rgb, count }]) => ({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        count,
        percentage: Math.round((count / totalPixels) * 100 * 100) / 100
      }));

      // Run the actual extraction
      extractPalette(imageUrl, colorCount).then(extractedColors => {
        resolve({
          totalPixels,
          uniqueColors: colorMap.size,
          topColors,
          extractedColors,
          imageSize: originalSize,
          processedSize
        });
      }).catch(reject);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
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
 * Extract dominant colors from an image using Color Thief library
 * Color Thief uses median cut algorithm for more accurate color extraction
 */
export async function extractPalette(
  imageUrl: string,
  colorCount: number = 6
): Promise<ColorInfo[]> {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        // Wait a tick to ensure image is fully loaded and dimensions are set
        await new Promise(resolve => setTimeout(resolve, 10));

        // Color Thief's CanvasImage class uses naturalWidth/naturalHeight internally
        // These must be valid integers > 0
        // IMPORTANT: Color Thief expects an IMAGE element, not a canvas
        // It will create its own canvas internally using naturalWidth/naturalHeight
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        // Validate natural dimensions (Color Thief requires these)
        if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) {
          // Try fallback to width/height
          const fallbackWidth = img.width;
          const fallbackHeight = img.height;
          if (!fallbackWidth || !fallbackHeight || fallbackWidth <= 0 || fallbackHeight <= 0) {
            reject(new Error(`Invalid image dimensions: naturalWidth=${imgWidth}, naturalHeight=${imgHeight}, width=${fallbackWidth}, height=${fallbackHeight}`));
            return;
          }
          // If natural dimensions are missing, the image may not be fully loaded
          reject(new Error("Image natural dimensions not available - image may not be fully loaded"));
          return;
        }

        // Ensure dimensions are integers (Color Thief's CanvasImage uses them directly)
        if (!Number.isInteger(imgWidth) || !Number.isInteger(imgHeight)) {
          reject(new Error(`Image dimensions must be integers: ${imgWidth}x${imgHeight}`));
          return;
        }

        // Dynamically import Color Thief (browser-only library)
        const ColorThief = (await import("colorthief")).default;
        const colorThief = new ColorThief();

        // Color Thief works with image element directly
        // It creates its own internal canvas using naturalWidth/naturalHeight
        // The quality parameter controls sampling (1 = all pixels, higher = faster)
        // For very large images, use quality > 1 to improve performance
        const quality = imgWidth * imgHeight > 1000000 ? 5 : 1; // Use quality 5 for images > 1MP
        
        // Get color palette using Color Thief's median cut algorithm
        // MUST pass image element (not canvas) - Color Thief needs naturalWidth/naturalHeight
        const palette: number[][] = colorThief.getPalette(img, colorCount, quality);

        // Convert Color Thief results to our ColorInfo format
        const refinedColors: ColorInfo[] = palette.map(([r, g, b]) => {
          const rgb: RGB = { r, g, b };
          const hex = rgbToHex(r, g, b);
          const hsl = rgbToHsl(r, g, b);

          return {
            rgb,
            hex,
            hsl,
            label: getColorLabel(hsl),
          };
        });

        resolve(refinedColors);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to extract colors"));
      }
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

  // Improved color clustering for representative palette
  const representativeColors: ColorInfo[] = [];

  // Count frequency of each exact color across all images
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

  // Adaptive color selection based on available colors
  const minColors = Math.min(6, allColors.length);
  const maxColors = Math.min(10, allColors.length); // Increased max for better representation
  
  // Dynamic similarity thresholds based on color diversity
  const colorDiversity = colorFrequency.size / allColors.length;
  const baseHueThreshold = colorDiversity > 0.3 ? 35 : 25; // More strict when diverse
  const baseSatThreshold = colorDiversity > 0.3 ? 30 : 20;
  const baseLightThreshold = colorDiversity > 0.3 ? 30 : 20;

  for (const { color } of sortedByFreq) {
    if (representativeColors.length >= maxColors) break;

    // Adaptive similarity check based on color characteristics
    const isSimilar = representativeColors.some((existing) => {
      const hDiff = Math.abs(existing.hsl.h - color.hsl.h);
      const sDiff = Math.abs(existing.hsl.s - color.hsl.s);
      const lDiff = Math.abs(existing.hsl.l - color.hsl.l);
      
      // Adjust thresholds based on the specific colors being compared
      const hueThreshold = (color.hsl.s < 15 || existing.hsl.s < 15) ? 
        baseHueThreshold + 15 : baseHueThreshold; // More lenient for grays
      const satThreshold = (color.hsl.l > 85 || color.hsl.l < 15) ? 
        baseSatThreshold + 10 : baseSatThreshold; // More lenient for very light/dark
      const lightThreshold = (color.hsl.s < 15) ? 
        baseLightThreshold + 10 : baseLightThreshold; // More lenient for muted colors
      
      return (
        (hDiff < hueThreshold || hDiff > (360 - hueThreshold)) && 
        sDiff < satThreshold && 
        lDiff < lightThreshold
      );
    });

    if (!isSimilar) {
      representativeColors.push(color);
    }
  }

  // Enhanced fallback to ensure minimum colors
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
