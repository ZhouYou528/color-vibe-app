/**
 * Types for Gemini AI analysis results
 * Used for wedding/event design inspiration analysis
 */

export interface GeminiAnalysis {
  colorLanguage?: string; // Aesthetic color description (not RGB)
  compositionLighting?: string; // Warm/cool ratio, brightness, contrast guidance
  wardrobeSuggestions?: string; // Designer/client language (e.g., cream, cool white, wheat)
  styleKeywords: string[]; // Editable keywords (e.g., "clean skin tone", "moody", "high contrast", "airy")
}
