"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNavigation() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Only show navigation when logged in
  if (!isAuthenticated) {
    return null;
  }

  const isCreate = pathname === "/" || pathname.startsWith("/select-photos") || pathname.startsWith("/card-details");
  const isLibrary = pathname === "/library" || pathname.startsWith("/card/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16">
        {/* Create Tab */}
        <button
          onClick={() => router.push("/")}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isCreate
              ? "text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs font-medium">Create</span>
        </button>

        {/* Library Tab */}
        <button
          onClick={() => router.push("/library")}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isLibrary
              ? "text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span className="text-xs font-medium">Library</span>
        </button>
      </div>
    </nav>
  );
}
