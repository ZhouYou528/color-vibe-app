"use client";

import { ReactNode } from "react";

interface SourceOptionCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

export default function SourceOptionCard({
  icon,
  title,
  subtitle,
  onClick,
  comingSoon = false,
}: SourceOptionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon || !onClick}
      className={`
        w-full rounded-xl bg-gray-50 border border-gray-200 shadow-sm
        p-6 flex items-center gap-4 text-left
        transition-all hover:shadow-md hover:bg-gray-100
        ${comingSoon || !onClick ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-yellow-700">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>{title}</h3>
          {comingSoon && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-yellow-700 text-white">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0 text-gray-400">
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
