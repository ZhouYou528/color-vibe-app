"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { ColorInfo } from "@/lib/colorAnalysis";
import { InsightData } from "@/lib/mockInsights";
import { GeminiAnalysis } from "@/lib/geminiTypes";

interface CardDetails {
  title: string;
  lightTags: string[];
  moodTags: string[];
  sceneTags: string[];
  notes: string;
}

interface Card {
  id: string;
  title: string;
  createdAt: string;
  cardDetails: CardDetails;
  palette: ColorInfo[];
  insights: InsightData;
  imageUrls: string[];
  geminiAnalysis?: GeminiAnalysis;
}

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cardId = params?.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const loadCard = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Card not found");
          } else {
            setError("Failed to load card");
          }
          return;
        }
        const data = await response.json();
        setCard(data);
      } catch (e) {
        console.error("Failed to load card", e);
        setError("Failed to load card");
      } finally {
        setIsLoading(false);
      }
    };

    if (cardId) {
      loadCard();
    }
  }, [cardId, isAuthenticated, router]);

  const handleDelete = async () => {
    if (!cardId || isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete card");
      }
      router.push("/library");
    } catch (err) {
      console.error("Failed to delete card", err);
      setError(err instanceof Error ? err.message : "Failed to delete card");
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading card...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="min-h-screen bg-white">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{error || "Card not found"}</p>
            <Link
              href="/library"
              className="px-6 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors inline-block"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { title, cardDetails, palette, insights, imageUrls, geminiAnalysis } = card;

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />
      
      {/* Floating Back Button */}
      <Link
        href="/library"
        className="fixed left-3 top-20 z-40 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 sm:left-4 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Back"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
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
      </Link>

      {/* Delete button - top right, same style as back button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="fixed right-3 top-20 z-40 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 sm:right-4 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
        aria-label="Delete card"
      >
        {isDeleting ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-900" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      <div className="max-w-4xl mx-auto px-10 sm:px-14 pt-28 pb-24">
        {/* Card Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          {title}
        </h2>

        {/* Selected Pills */}
        {(cardDetails.lightTags.length > 0 ||
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
        {imageUrls && imageUrls.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
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
          {palette && palette.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                PRIMARY COLORS
              </h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {palette.slice(0, 3).map((color, index) => {
                  const percentage = Math.round(100 / Math.min(palette.length, 3));
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
                {palette.slice(0, 3).map((color, index) => {
                  const percentage = Math.round(100 / Math.min(palette.length, 3));
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
          {palette && palette.length > 3 && (
            <div className="mb-8">
              <h3 className="text-sm font-normal text-gray-600 uppercase mb-4">
                SECONDARY COLORS
              </h3>
              <div className="flex flex-wrap gap-4">
                {palette.slice(3).map((color, index) => (
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
          {insights && insights.colorsToUse && insights.colorsToUse.length > 0 && (
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
          {insights && insights.colorsToAvoid && insights.colorsToAvoid.length > 0 && (
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

        {/* Gemini AI Analysis Sections - Read-only for saved cards */}
        {geminiAnalysis && (
          <>
            {/* Color Language */}
            {geminiAnalysis.colorLanguage && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                <h2 className="text-2xl font-bold mb-4 uppercase text-gray-900">COLOR LANGUAGE</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{geminiAnalysis.colorLanguage}</p>
              </div>
            )}

            {/* Composition & Lighting */}
            {geminiAnalysis.compositionLighting && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                <h2 className="text-2xl font-bold mb-4 uppercase text-gray-900">COMPOSITION & LIGHTING</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{geminiAnalysis.compositionLighting}</p>
              </div>
            )}

            {/* Wardrobe Suggestions */}
            {geminiAnalysis.wardrobeSuggestions && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                <h2 className="text-2xl font-bold mb-4 uppercase text-gray-900">WARDROBE SUGGESTIONS</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{geminiAnalysis.wardrobeSuggestions}</p>
              </div>
            )}

            {/* Style Keywords - Read-only */}
            {geminiAnalysis.styleKeywords && geminiAnalysis.styleKeywords.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                <h2 className="text-2xl font-bold mb-4 uppercase text-gray-900">STYLE KEYWORDS</h2>
                <div className="flex flex-wrap gap-2">
                  {geminiAnalysis.styleKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
