import { PaletteSummary } from "./colorAnalysis";
import { InsightData, generateMockInsights } from "./mockInsights";

/**
 * Main function to get insights from a palette summary
 * This abstraction allows us to swap in a real AI backend later
 * 
 * Future API signature (for reference):
 * POST /api/insights
 * Body: { paletteSummary: PaletteSummary, imagesMetaOnly?: { width: number, height: number }[] }
 * Returns: InsightData
 */
export async function getInsights(
  paletteSummary: PaletteSummary
): Promise<InsightData> {
  // Currently uses mock insights
  // TODO: Replace with real AI API call when backend is ready
  // Example:
  // const response = await fetch('/api/insights', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ paletteSummary })
  // });
  // return await response.json();

  return generateMockInsights(paletteSummary);
}
