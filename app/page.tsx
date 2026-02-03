"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useResultContext } from "@/contexts/ResultContext";
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
  const { setResultImages } = useResultContext();
  const { isAuthenticated } = useAuth();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [combinedPalette, setCombinedPalette] = useState<ColorInfo[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggeredAnalysis, setHasTriggeredAnalysis] = useState(false);
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

  // If user lands on / with a persisted result (e.g. refresh on /result), redirect to /result
  useEffect(() => {
    const generateParam = searchParams?.get("generate");
    if (generateParam === "true") return;
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) router.replace("/result");
  }, [searchParams, router]);

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
          // Persist non-image result and navigate to /result. Images are kept in-memory only.
          const detailsToSave = cardDetailsStored ? JSON.parse(cardDetailsStored) : null;
          if (detailsToSave) {
            try {
              sessionStorage.setItem(
                "analysisResult",
                JSON.stringify({
                  cardDetails: detailsToSave,
                  combinedPalette: summary.colors,
                  insights: insightData,
                })
              );
              // Keep previews for this navigation only (will be lost on refresh)
              setResultImages(imagesToAnalyze);
              router.push("/result");
            } catch (e) {
              console.error("Failed to persist analysis result", e);
              sessionStorage.setItem(
                "analysisResult",
                JSON.stringify({
                  cardDetails: detailsToSave,
                  combinedPalette: summary.colors,
                  insights: insightData,
                })
              );
              setResultImages(imagesToAnalyze);
              router.push("/result");
            }
          }
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


  // Determine current view state (result view is now on /result)
  const isLanding = images.length === 0 && !insights && !isAnalyzing && !hasTriggeredAnalysis;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

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

      </div>
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
