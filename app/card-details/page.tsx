"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagPill from "../../components/TagPill";

const LIGHT_TAGS = [
  "side",
  "back",
  "top",
  "soft window",
  "flash fill",
  "mixed",
  "golden hour",
  "overcast",
  "studio",
];

const MOOD_TAGS = [
  "calm",
  "grand",
  "restrained",
  "romantic",
  "editorial",
  "dramatic",
  "playful",
  "intimate",
];

const SCENE_TAGS = [
  "hotel",
  "city hall",
  "home",
  "outdoor",
  "studio",
  "beach",
  "forest",
  "urban",
];

export default function CardDetailsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [lightTags, setLightTags] = useState<string[]>([]);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [sceneTags, setSceneTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleTag = (
    tag: string,
    selectedTags: string[],
    setSelectedTags: (tags: string[]) => void
  ) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerate = () => {
    // Store card details and navigate to results/analysis page
    const cardData = {
      title,
      lightTags,
      moodTags,
      sceneTags,
      notes,
    };
    
    // Store in sessionStorage (lightweight metadata only)
    sessionStorage.setItem("cardDetails", JSON.stringify(cardData));
    
    // Navigate to main page to show results
    router.push("/?generate=true");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <Link
            href="/select-photos"
            className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back"
          >
            <svg
              className="w-6 h-6"
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

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-900">Card Details</h1>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!title.trim()}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                !title.trim()
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            Generate
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Light Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Light Tags
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Select the lighting styles that apply
            </p>
            <div className="flex flex-wrap gap-2">
              {LIGHT_TAGS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  selected={lightTags.includes(tag)}
                  onClick={() => toggleTag(tag, lightTags, setLightTags)}
                />
              ))}
            </div>
          </div>

          {/* Mood Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Mood Tags
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Select the mood and feeling
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  selected={moodTags.includes(tag)}
                  onClick={() => toggleTag(tag, moodTags, setMoodTags)}
                />
              ))}
            </div>
          </div>

          {/* Scene Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Scene Tags
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Select the location types
            </p>
            <div className="flex flex-wrap gap-2">
              {SCENE_TAGS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  selected={sceneTags.includes(tag)}
                  onClick={() => toggleTag(tag, sceneTags, setSceneTags)}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Notes
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Any additional details for reference
            </p>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional details..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
