import { PaletteSummary } from "./colorAnalysis";

export interface InsightData {
  vibeTags: string[];
  colorsToUse: Array<{ hex: string; label: string }>;
  colorsToAvoid: Array<{ hex: string; label: string }>;
  decorIdeas: string[];
  makeupIdeas: string[];
  wardrobeIdeas: string[];
  photoDirection: string[];
}

/**
 * Generate mock AI insights based on palette analysis
 * This is deterministic and rule-based, designed to be replaced with real AI later
 */
export function generateMockInsights(
  summary: PaletteSummary
): InsightData {
  const { colors, warmCoolBalance, averageSaturation, averageBrightness, dominantHues } = summary;

  // Determine vibe tags
  const vibeTags: string[] = [];

  if (averageBrightness > 0.7) {
    vibeTags.push("airy");
    vibeTags.push("light");
  } else if (averageBrightness < 0.3) {
    vibeTags.push("moody");
    vibeTags.push("dramatic");
  } else {
    vibeTags.push("balanced");
  }

  if (averageSaturation < 0.3) {
    vibeTags.push("muted");
    vibeTags.push("soft");
  } else if (averageSaturation > 0.7) {
    vibeTags.push("vibrant");
    vibeTags.push("bold");
  }

  if (warmCoolBalance > 0.3) {
    vibeTags.push("warm");
    vibeTags.push("cozy");
  } else if (warmCoolBalance < -0.3) {
    vibeTags.push("cool");
    vibeTags.push("calm");
  } else {
    vibeTags.push("harmonious");
  }

  // Check for specific color themes
  const hasPink = dominantHues.some((h) => (h >= 330 || h < 30) && h !== 0);
  const hasBlue = dominantHues.some((h) => h >= 180 && h < 255);
  const hasGreen = dominantHues.some((h) => h >= 75 && h < 165);
  const hasOrange = dominantHues.some((h) => h >= 15 && h < 45);

  if (hasPink && averageSaturation > 0.5) {
    vibeTags.push("romantic");
  }
  if (hasBlue && averageBrightness > 0.6) {
    vibeTags.push("serene");
  }
  if (hasGreen && averageSaturation < 0.4) {
    vibeTags.push("natural");
  }
  if (hasOrange && warmCoolBalance > 0.2) {
    vibeTags.push("energetic");
  }

  // Colors to use (top colors from palette)
  const colorsToUse = colors.slice(0, 5).map((c) => ({
    hex: c.hex,
    label: c.label,
  }));

  // Colors to avoid (complementary/contrasting)
  const colorsToAvoid: Array<{ hex: string; label: string }> = [];
  const avoidHues = new Set<number>();

  dominantHues.forEach((hue) => {
    // Add complementary colors (opposite on color wheel)
    const complementary = (hue + 180) % 360;
    avoidHues.add(Math.floor(complementary / 30) * 30);
  });

  // Generate example colors to avoid
  if (warmCoolBalance > 0) {
    colorsToAvoid.push({ hex: "#0066cc", label: "cool blue" });
    colorsToAvoid.push({ hex: "#00cc99", label: "cool teal" });
  } else if (warmCoolBalance < 0) {
    colorsToAvoid.push({ hex: "#ff6600", label: "warm orange" });
    colorsToAvoid.push({ hex: "#ffcc00", label: "warm yellow" });
  }

  if (averageSaturation > 0.6) {
    colorsToAvoid.push({ hex: "#808080", label: "muted gray" });
  } else {
    colorsToAvoid.push({ hex: "#ff0066", label: "vibrant pink" });
    colorsToAvoid.push({ hex: "#00ff00", label: "neon green" });
  }

  // Decor ideas
  const decorIdeas: string[] = [];
  if (averageBrightness > 0.7) {
    decorIdeas.push("Use light, airy fabrics like linen and cotton");
    decorIdeas.push("Incorporate white or cream as base colors");
    decorIdeas.push("Choose furniture with light wood tones");
  } else if (averageBrightness < 0.3) {
    decorIdeas.push("Create depth with rich, dark textures");
    decorIdeas.push("Use warm lighting to balance the mood");
    decorIdeas.push("Add metallic accents for contrast");
  }

  if (warmCoolBalance > 0.2) {
    decorIdeas.push("Add warm-toned accessories like brass or copper");
    decorIdeas.push("Use natural materials like wood and rattan");
  } else if (warmCoolBalance < -0.2) {
    decorIdeas.push("Incorporate cool-toned metals like silver or chrome");
    decorIdeas.push("Use glass and crystal elements");
  }

  if (averageSaturation < 0.4) {
    decorIdeas.push("Keep patterns subtle and textures soft");
    decorIdeas.push("Layer similar tones for depth");
  }

  // Makeup ideas
  const makeupIdeas: string[] = [];
  if (averageBrightness > 0.6) {
    makeupIdeas.push("Opt for dewy, fresh-looking foundation");
    makeupIdeas.push("Use soft, blended eyeshadow in similar tones");
  } else {
    makeupIdeas.push("Create definition with deeper contouring");
    makeupIdeas.push("Use matte finishes for a sophisticated look");
  }

  if (hasPink) {
    makeupIdeas.push("Incorporate rosy blush and lip tones");
  }
  if (hasBlue) {
    makeupIdeas.push("Add subtle cool-toned highlights");
  }
  if (warmCoolBalance > 0.2) {
    makeupIdeas.push("Use warm bronzer and peachy tones");
  }

  if (averageSaturation > 0.6) {
    makeupIdeas.push("Bold lip colors will complement this palette");
  } else {
    makeupIdeas.push("Keep makeup soft and natural-looking");
  }

  // Wardrobe ideas
  const wardrobeIdeas: string[] = [];
  wardrobeIdeas.push(`Build outfits around ${colors[0]?.label || "your dominant"} tones`);
  
  if (averageSaturation < 0.4) {
    wardrobeIdeas.push("Mix muted tones for a sophisticated look");
    wardrobeIdeas.push("Add one statement piece in a slightly brighter shade");
  } else {
    wardrobeIdeas.push("Embrace bold color combinations");
    wardrobeIdeas.push("Use neutral pieces to ground vibrant colors");
  }

  if (warmCoolBalance > 0.2) {
    wardrobeIdeas.push("Incorporate warm accessories like gold jewelry");
  } else if (warmCoolBalance < -0.2) {
    wardrobeIdeas.push("Pair with silver or platinum accessories");
  }

  if (averageBrightness > 0.7) {
    wardrobeIdeas.push("Light, flowy fabrics work well with this palette");
  }

  // Photography direction
  const photoDirection: string[] = [];
  if (averageBrightness > 0.7) {
    photoDirection.push("Use soft, natural lighting");
    photoDirection.push("Consider bright, airy backgrounds");
    photoDirection.push("Shoot during golden hour for warmth");
  } else if (averageBrightness < 0.3) {
    photoDirection.push("Create moody atmosphere with low-key lighting");
    photoDirection.push("Use dramatic shadows for depth");
    photoDirection.push("Consider darker, textured backdrops");
  }

  if (warmCoolBalance > 0.2) {
    photoDirection.push("Warm-toned lighting will enhance the palette");
    photoDirection.push("Sunset or candlelight settings work well");
  } else if (warmCoolBalance < -0.2) {
    photoDirection.push("Cool, even lighting complements these tones");
    photoDirection.push("Consider overcast or blue-hour settings");
  }

  if (averageSaturation > 0.6) {
    photoDirection.push("High contrast settings will make colors pop");
  } else {
    photoDirection.push("Soft, diffused lighting maintains the muted feel");
    photoDirection.push("Avoid harsh shadows that create too much contrast");
  }

  return {
    vibeTags: vibeTags.slice(0, 4), // Limit to 4 tags
    colorsToUse,
    colorsToAvoid: colorsToAvoid.slice(0, 3), // Limit to 3
    decorIdeas: decorIdeas.slice(0, 4),
    makeupIdeas: makeupIdeas.slice(0, 4),
    wardrobeIdeas: wardrobeIdeas.slice(0, 4),
    photoDirection: photoDirection.slice(0, 4),
  };
}
