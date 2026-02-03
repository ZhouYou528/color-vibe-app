"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useAuth } from "@/contexts/AuthContext";
import SourceOptionCard from "@/components/SourceOptionCard";
import AppHeader from "@/components/AppHeader";
import { extractPalette, combinePalettes, ColorInfo } from "@/lib/colorAnalysis";
import { getInsights } from "@/lib/insights";
import { InsightData } from "@/lib/mockInsights";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedImages, setSelectedImages } = usePhotoContext();
  const { isAuthenticated } = useAuth();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [combinedPalette, setCombinedPalette] = useState<ColorInfo[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggeredAnalysis, setHasTriggeredAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [cardDetails, setCardDetails] = useState<{
    title: string;
    lightTags: string[];
    moodTags: string[];
    sceneTags: string[];
    notes: string;
  } | null>(null);

  // Load card details from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("cardDetails");
    if (stored) {
      try {
        const details = JSON.parse(stored);
        setCardDetails(details);
      } catch (e) {
        console.error("Failed to load card details", e);
      }
    }
  }, []);

  // Check if returning from card details (generate flow)
  useEffect(() => {
    const generateParam = searchParams?.get("generate");
    
    if (generateParam === "true" && !hasTriggeredAnalysis) {
      // Ensure card details are loaded
      const stored = sessionStorage.getItem("cardDetails");
      if (stored && !cardDetails) {
        try {
          const details = JSON.parse(stored);
          setCardDetails(details);
        } catch (e) {
          console.error("Failed to load card details", e);
        }
      }
      
      // Check if we have images in context
      if (selectedImages.length === 0) {
        setError("No images found. Please go back and select photos.");
        router.replace("/");
        return;
      }
      
      // Load images from context and automatically start analysis
      const imagesToAnalyze = [...selectedImages];
      setImages(imagesToAnalyze);
      setHasTriggeredAnalysis(true);
      
      // Clear the URL parameter immediately
      router.replace("/");
      
      // Automatically trigger analysis
      const analyzeImages = async () => {
        if (imagesToAnalyze.length === 0) {
          setError("No images to analyze");
          setIsAnalyzing(false);
          return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
          // Extract palette for each image
          const palettes: ColorInfo[][] = [];

          for (const img of imagesToAnalyze) {
            try {
              const palette = await extractPalette(img.preview, 6);
              palettes.push(palette);
            } catch (err) {
              console.error(`Failed to analyze image ${img.id}:`, err);
              // Continue with other images even if one fails
            }
          }

          if (palettes.length === 0) {
            throw new Error("Failed to analyze any images");
          }

          // Combine palettes and get summary
          const summary = combinePalettes(palettes);
          setCombinedPalette(summary.colors);

          // Get insights
          const insightData = await getInsights(summary);
          setInsights(insightData);
          
          // Ensure card details are loaded after analysis completes
          const cardDetailsStored = sessionStorage.getItem("cardDetails");
          if (cardDetailsStored) {
            try {
              const details = JSON.parse(cardDetailsStored);
              setCardDetails(details);
            } catch (e) {
              console.error("Failed to load card details", e);
            }
          }
          
          // Clear context after successful analysis
          setSelectedImages([]);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to analyze images"
          );
          setIsAnalyzing(false);
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      analyzeImages();
    } else if (generateParam === "true" && selectedImages.length === 0) {
      // If generate param is true but no images, show error
      setError("No images found. Please go back and select photos.");
      router.replace("/");
    }
  }, [searchParams, router, selectedImages, hasTriggeredAnalysis, setSelectedImages, cardDetails]);


  const handleReset = () => {
    // Clean up object URLs
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setCombinedPalette([]);
    setInsights(null);
    setError(null);
    setHasTriggeredAnalysis(false);
    setCardDetails(null);
    setSelectedImages([]);
    setSaved(false);
    sessionStorage.removeItem("cardDetails");
    router.push("/");
  };

  const handleSaveCard = async () => {
    if (!isAuthenticated || !cardDetails || !combinedPalette.length || !insights) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Import compression utility dynamically
      const { compressImages } = await import("@/lib/compressImage");

      // Compress all images
      const imageFiles = images.map((img) => img.file);
      const compressedBlobs = await compressImages(imageFiles, 400, 0.8);

      // Create form data
      const formData = new FormData();
      
      // Add payload as JSON string
      const payload = {
        title: cardDetails.title,
        cardDetails: cardDetails,
        palette: combinedPalette,
        insights: insights,
      };
      formData.append("payload", JSON.stringify(payload));

      // Add compressed images
      compressedBlobs.forEach((blob, index) => {
        formData.append(`preview_${index}`, blob, `preview_${index}.webp`);
      });

      // POST to API
      const response = await fetch("/api/cards", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save card");
      }

      const result = await response.json();
      setSaved(true);
      setShowMessage(true);
    } catch (error) {
      console.error("Failed to save card", error);
      setError(error instanceof Error ? error.message : "Failed to save card. Please try again.");
      setShowMessage(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (saved || (error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save")))) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        // Clear error after fade-out completes
        setTimeout(() => {
          if (error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save"))) {
            setError(null);
          }
        }, 500); // Wait for fade-out animation to complete
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(true);
    }
  }, [saved, error]);

  // Determine current view state
  const isLanding = images.length === 0 && !insights && !isAnalyzing && !hasTriggeredAnalysis;
  const hasResults = insights !== null;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader />
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isAuthenticated && !saved ? 'pb-32' : 'pb-24'} ${hasResults ? 'pt-16' : 'pt-28'}`}>

        {/* Landing View - Card Selection */}
        {isLanding && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-left space-y-4 px-4">
              <h2 className="text-3xl text-gray-900 font-bold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                New Card
              </h2>
              <p className="text-sm text-gray-500 max-w-xl">
                Choose where to source your inspiration images
              </p>
            </div>

            {/* Source Option Cards */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <SourceOptionCard
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                title="From Photo Album"
                subtitle="Select 1-20 photos from your device"
                onClick={() => router.push("/select-photos")}
              />
              <SourceOptionCard
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                }
                title="From Pinterest"
                subtitle="Browse and select pins from your boards"
                comingSoon={true}
              />
            </div>
          </div>
        )}


        {/* Loading State */}
        {isAnalyzing && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              Analyzing your images...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Results Section */}
        {hasResults && insights && (
          <div className="w-full pl-20">
            {/* Floating Back Button */}
            <button
              onClick={handleReset}
              className="fixed left-4 top-20 z-40 flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Card Title */}
            {cardDetails && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {cardDetails.title}
              </h2>
            )}

            {/* Selected Pills */}
            {cardDetails && (cardDetails.lightTags.length > 0 ||
              cardDetails.moodTags.length > 0 ||
              cardDetails.sceneTags.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {cardDetails.lightTags.map((tag) => (
                    <span
                      key={`light-${tag}`}
                      className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                  {cardDetails.moodTags.map((tag) => (
                    <span
                      key={`mood-${tag}`}
                      className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                  {cardDetails.sceneTags.map((tag) => (
                    <span
                      key={`scene-${tag}`}
                      className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Notes */}
                {cardDetails.notes && cardDetails.notes.trim() && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {cardDetails.notes}
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* Horizontally Scrollable Image Previews */}
            {images.length > 0 && (
              <div className="mb-8">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${img.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PALETTE Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 uppercase text-gray-900">
                PALETTE
              </h2>

              {/* Primary Colors */}
              {combinedPalette.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                    PRIMARY COLORS
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {combinedPalette.slice(0, 3).map((color, index) => {
                      const percentage = Math.round(100 / Math.min(combinedPalette.length, 3));
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-16 h-16 rounded border-2 border-gray-300 mb-2"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs font-mono text-gray-700">
                            {color.hex}
                          </span>
                          <span className="text-xs text-gray-600 mt-1">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Visual bar representation */}
                  <div className="flex h-4 rounded overflow-hidden">
                    {combinedPalette.slice(0, 3).map((color, index) => {
                      const percentage = Math.round(100 / Math.min(combinedPalette.length, 3));
                      return (
                        <div
                          key={index}
                          className="h-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color.hex,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Secondary Colors */}
              {combinedPalette.length > 3 && (
                <div className="mb-8">
                  <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                    SECONDARY COLORS
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {combinedPalette.slice(3).map((color, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded border-2 border-gray-300 mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-mono text-gray-700">
                          {color.hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Colors */}
              {insights.colorsToUse.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                    MATCH COLORS
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {insights.colorsToUse.map((color, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded border-2 border-gray-300 mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-mono text-gray-700">
                          {color.hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoid Colors */}
              {insights.colorsToAvoid.length > 0 && (
                <div>
                  <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                    AVOID COLORS
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {insights.colorsToAvoid.map((color, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded border-2 border-gray-300 mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-mono text-gray-700">
                          {color.hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button/Message (only if logged in and has results) */}
      {isAuthenticated && hasResults && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 pb-2">
          {/* Success Message */}
          {saved && (
            <div className={`px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium flex items-center gap-2 border border-green-200 shadow-lg transition-opacity duration-500 ease-out ${showMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Saved to Library</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (error.toLowerCase().includes("save") || error.toLowerCase().includes("failed to save")) && (
            <div className={`px-6 py-3 bg-red-50 text-red-700 rounded-lg font-medium flex items-center gap-2 border border-red-200 shadow-lg max-w-md transition-opacity duration-500 ease-out ${showMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Save Button */}
          {!saved && (!error || !error.toLowerCase().includes("save")) && (
            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="px-6 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
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

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          {/* Simple header without auth */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 border-2 border-gray-900 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Color Vibe</h1>
                </div>
              </div>
            </div>
          </header>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
