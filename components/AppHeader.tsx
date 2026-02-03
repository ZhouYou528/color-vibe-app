"use client";

import { useAuth } from "@/contexts/AuthContext";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useHeaderVisibility } from "@/contexts/HeaderVisibilityContext";

export default function AppHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const [avatarError, setAvatarError] = useState(false);
  const { isVisible } = useHeaderVisibility();

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-8 h-8 border-2 border-gray-900 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            
            {/* App name */}
            <h1 className="text-xl font-semibold text-gray-900">Color Vibe</h1>
          </div>

          {/* Right: Login/User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.picture && !avatarError ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setAvatarError(true);
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google", undefined, { prompt: "select_account" })}
                className="px-4 py-2 text-sm font-medium bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors whitespace-nowrap"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
