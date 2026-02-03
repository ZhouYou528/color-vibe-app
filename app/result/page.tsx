"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { ColorInfo } from "@/lib/colorAnalysis";
import { InsightData } from "@/lib/mockInsights";
import { dataUrlToFile } from "@/lib/imageStorage";

const STORAGE_KEY = "analysisResult";

interface CardDetails {
  title: string;
  lightTags: string[];
  moodTags: string[];
  sceneTags: string[];
  notes: string;
}

interface StoredResult {
  cardDetails: CardDetails;
  combinedPalette: ColorInfo[];
  insights: InsightData;
  imagePreviews: string[];
}

export default function ResultPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [combinedPalette, setCombinedPalette] = useState<ColorInfo[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const data: StoredResult = JSON.parse(stored);
      if (!data.cardDetails || !Array.isArray(data.combinedPalette) || !data.insights) {
        router.replace("/");
        return;
      }
      setCardDetails(data.cardDetails);
      setCombinedPalette(data.combinedPalette);
      setInsights(data.insights);
      setImagePreviews(Array.isArray(data.imagePreviews) ? data.imagePreviews : []);
    } catch (e) {
      console.error("Failed to load result", e);
      sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/");
    } finally {
      setReady(true);
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("cardDetails");
    router.push("/");
  };

  const handleSaveCard = async () => {
    if (!isAuthenticated || !cardDetails || !combinedPalette.length || !insights) return;
    if (imagePreviews.length === 0) {
      setError("No images to save. Go back and create a new card.");
      setShowMessage(true);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { compressImages } = await import("@/lib/compressImage");
      const files = await Promise.all(
        imagePreviews.map((dataUrl, i) => dataUrlToFile(dataUrl, `preview_${i}.webp`))
      );
      const compressedBlobs = await compressImages(files, 400, 0.8);

      const formData = new FormData();
      const payload = {
        title: cardDetails.title,
        cardDetails: cardDetails,
        palette: combinedPalette,
        insights: insights,
      };
      formData.append("payload", JSON.stringify(payload));
      compressedBlobs.forEach((blob, index) => {
        formData.append(`preview_${index}`, blob, `preview_${index}.webp`);
      });

      const response = await fetch("/api/cards", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save card");
      }

      setSaved(true);
      setShowMessage(true);
    } catch (err) {
      console.error("Failed to save card", err);
      setError(err instanceof Error ? err.message : "Failed to save card. Please try again.");
      setShowMessage(true);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (saved || (error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save")))) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => {
          if (error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save"))) {
            setError(null);
          }
        }, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saved, error]);

  if (!ready || !cardDetails || !insights) {
    return (
      <main className="min-h-screen bg-white">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />

      <button
        onClick={handleBack}
        className="fixed left-3 top-20 z-40 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 sm:left-4 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Back"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={`max-w-4xl mx-auto px-10 sm:px-14 pt-28 ${isAuthenticated ? "pb-32" : "pb-24"}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {cardDetails.title}
        </h2>

        {(cardDetails.lightTags.length > 0 || cardDetails.moodTags.length > 0 || cardDetails.sceneTags.length > 0) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {cardDetails.lightTags.map((tag) => (
                <span key={`light-${tag}`} className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize">
                  {tag}
                </span>
              ))}
              {cardDetails.moodTags.map((tag) => (
                <span key={`mood-${tag}`} className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize">
                  {tag}
                </span>
              ))}
              {cardDetails.sceneTags.map((tag) => (
                <span key={`scene-${tag}`} className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize">
                  {tag}
                </span>
              ))}
            </div>
            {cardDetails.notes && cardDetails.notes.trim() && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{cardDetails.notes}</p>
              </div>
            )}
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                >
                  <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 uppercase text-gray-900">PALETTE</h2>

          {combinedPalette.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">PRIMARY COLORS</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {combinedPalette.slice(0, 3).map((color, index) => {
                  const percentage = Math.round(100 / Math.min(combinedPalette.length, 3));
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded border-2 border-gray-300 mb-2" style={{ backgroundColor: color.hex }} />
                      <span className="text-xs font-mono text-gray-700">{color.hex}</span>
                      <span className="text-xs text-gray-600 mt-1">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex h-4 rounded overflow-hidden">
                {combinedPalette.slice(0, 3).map((color, index) => {
                  const percentage = Math.round(100 / Math.min(combinedPalette.length, 3));
                  return (
                    <div key={index} className="h-full" style={{ width: `${percentage}%`, backgroundColor: color.hex }} />
                  );
                })}
              </div>
            </div>
          )}

          {combinedPalette.length > 3 && (
            <div className="mb-8">
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">SECONDARY COLORS</h3>
              <div className="flex flex-wrap gap-4">
                {combinedPalette.slice(3).map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded border-2 border-gray-300 mb-2" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-mono text-gray-700">{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.colorsToUse.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">MATCH COLORS</h3>
              <div className="flex flex-wrap gap-4">
                {insights.colorsToUse.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded border-2 border-gray-300 mb-2" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-mono text-gray-700">{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.colorsToAvoid.length > 0 && (
            <div>
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">AVOID COLORS</h3>
              <div className="flex flex-wrap gap-4">
                {insights.colorsToAvoid.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded border-2 border-gray-300 mb-2" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-mono text-gray-700">{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 pb-2">
          {saved && (
            <div
              className={`px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium flex items-center gap-2 border border-green-200 shadow-lg transition-opacity duration-500 ease-out ${showMessage ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved to Library</span>
            </div>
          )}
          {error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save") || error.includes("No images")) && (
            <div
              className={`px-6 py-3 bg-red-50 text-red-700 rounded-lg font-medium flex items-center gap-2 border border-red-200 shadow-lg max-w-md transition-opacity duration-500 ease-out ${showMessage ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
          {!saved && (!error || (!error.toLowerCase().includes("save") && !error.includes("No images"))) && (
            <button
              onClick={handleSaveCard}
              disabled={isSaving || imagePreviews.length === 0}
              className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save to Library</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
