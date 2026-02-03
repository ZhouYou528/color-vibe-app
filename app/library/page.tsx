"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { useRouter } from "next/navigation";
import { ColorInfo } from "@/lib/colorAnalysis";
import { InsightData } from "@/lib/mockInsights";

interface SavedCard {
  id: string;
  title: string;
  createdAt: string;
  palette: ColorInfo[];
  insights: InsightData;
  cardDetails: {
    title: string;
    lightTags: string[];
    moodTags: string[];
    sceneTags: string[];
    notes: string;
  };
  imageUrls: string[];
}

export default function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Load saved cards from API
    const loadCards = async () => {
      try {
        const response = await fetch("/api/cards");
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }
        const data = await response.json();
        setSavedCards(data.cards || []);
      } catch (e) {
        console.error("Failed to load saved cards", e);
        setSavedCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [isAuthenticated, router]);

  const handleCardClick = (cardId: string) => {
    router.push(`/card/${cardId}`);
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
              <p className="mt-4 text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 font-bold" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Library
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Your saved color palette cards
          </p>
        </div>

        {/* Cards Grid */}
        {savedCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">No saved cards yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Create your first card to see it here
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
            >
              Create New Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                {/* Card Preview Images */}
                {card.imageUrls && card.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {card.imageUrls.slice(0, 3).map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded overflow-hidden bg-gray-100"
                      >
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>

                {/* Color Palette Preview */}
                {card.palette && card.palette.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {card.palette.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                    {card.palette.length > 5 && (
                      <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-gray-50">
                        <span className="text-xs text-gray-500">
                          +{card.palette.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-400">
                  {new Date(card.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
