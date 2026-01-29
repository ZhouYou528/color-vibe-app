"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function AppHeader() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Check if Google script is loaded
  useEffect(() => {
    const checkGoogle = () => {
      if (typeof window !== "undefined" && window.google) {
        setGoogleLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogle()) return;

    // Poll for Google script to load
    const interval = setInterval(() => {
      if (checkGoogle()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Clear button immediately when authenticated
  useEffect(() => {
    if (isAuthenticated && buttonRef.current) {
      // Clear the button container immediately
      buttonRef.current.innerHTML = "";
      
      // Remove any Google-created button elements
      const removeGoogleButtons = () => {
        const selectors = [
          '#google-signin-button > *',
          '[id^="gsi"]',
          '[class*="gsi"]',
          'iframe[src*="accounts.google.com"]'
        ];
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {
            // Ignore errors
          }
        });
      };
      
      // Remove immediately
      removeGoogleButtons();
      
      // Also remove after a short delay to catch any async renders
      setTimeout(removeGoogleButtons, 100);
    }
  }, [isAuthenticated]);

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.picture]);

  // Render Google Sign-In button only when not authenticated
  useEffect(() => {
    // Don't render button if already authenticated
    if (isAuthenticated) {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
      return;
    }

    // Only render button if not authenticated
    if (!isAuthenticated && googleLoaded && typeof window !== "undefined" && window.google && buttonRef.current) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      // Clear any existing content
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
      
      if (!clientId) {
        // No client ID, show fallback button
        const button = document.createElement("button");
        button.className = "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap";
        button.textContent = "Sign in with Google";
        button.onclick = () => {
          alert("Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local");
        };
        if (buttonRef.current) {
          buttonRef.current.appendChild(button);
        }
        return;
      }

      try {
        // Render Google Sign-In button
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 120,
          locale: "en",
        });
      } catch (renderError: any) {
        // If error says initialize is needed, call it first
        if (renderError.message && renderError.message.includes("initialize")) {
          if (window.google) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: (response: any) => {
                window.dispatchEvent(new CustomEvent("google-credential-response", { detail: response }));
              },
              locale: "en",
            });
            
            // Try rendering again after initialization
            setTimeout(() => {
              if (!isAuthenticated && buttonRef.current && window.google) {
                try {
                  window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    width: 120,
                    locale: "en",
                  });
                } catch (retryError) {
                  console.error("Failed to render button after initialize", retryError);
                }
              }
            }, 100);
          }
        } else {
          console.error("Failed to render Google Sign-In button", renderError);
        }
      }
    }
  }, [isAuthenticated, googleLoaded]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
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
              <div 
                ref={buttonRef} 
                id="google-signin-button" 
                className="min-w-[120px] min-h-[40px] flex items-center justify-center"
              >
                {!googleLoaded && (
                  <button
                    onClick={() => {
                      // Trigger login flow
                      if (window.google) {
                        window.google.accounts.id.prompt((notification: any) => {
                          console.log("Google Sign-In prompt:", notification);
                        });
                      } else {
                        alert("Google Sign-In is loading. Please wait a moment and try again.");
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
