"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { ColorInfo } from "@/lib/colorAnalysis";
import { InsightData } from "@/lib/mockInsights";

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
}

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const { title, cardDetails, palette, insights, imageUrls } = card;

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />
      
      {/* Floating Back Button */}
      <Link
        href="/library"
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
      </Link>

      <div className="max-w-4xl mx-auto px-20 pt-28 pb-24">
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
      </div>
    </main>
  );
}
