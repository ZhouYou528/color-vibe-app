"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to load user", e);
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Remove any existing Google script to ensure fresh load with language parameter
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      if (!window.google) {
        const script = document.createElement("script");
        // Add hl=en parameter to force English language
        script.src = "https://accounts.google.com/gsi/client?hl=en";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleSignIn();
        };
        document.head.appendChild(script);
      } else {
        // If already loaded, reinitialize with English locale
        initializeGoogleSignIn();
      }
    }

    // Listen for credential responses from AppHeader if it initializes separately
    const handleCredentialEvent = (event: CustomEvent) => {
      handleCredentialResponse(event.detail);
    };
    window.addEventListener("google-credential-response" as any, handleCredentialEvent as EventListener);

    return () => {
      window.removeEventListener("google-credential-response" as any, handleCredentialEvent as EventListener);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (typeof window === "undefined" || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      locale: "en",
    });
  };

  const handleCredentialResponse = (response: any) => {
    // Decode JWT token (simplified - in production, verify on backend)
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);

      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };

      console.log("User signed in:", userData); // Debug log
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      // Disable auto sign-in prompt after successful sign-in
      if (typeof window !== "undefined" && window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error("Failed to decode credential", error);
    }
  };

  const login = () => {
    // The login is handled by the Google Sign-In button rendered in AppHeader
    // This function can be used to trigger the sign-in flow programmatically if needed
    if (typeof window === "undefined" || !window.google) {
      console.error("Google Identity Services not loaded");
      return;
    }

    // Trigger the One Tap prompt
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // If One Tap is not displayed, the button in AppHeader will handle it
        console.log("One Tap not available, using button");
      }
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // Always provide the context, even during loading
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void; locale?: string }) => void;
          prompt: (callback: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; text?: string; width?: number; locale?: string }) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
