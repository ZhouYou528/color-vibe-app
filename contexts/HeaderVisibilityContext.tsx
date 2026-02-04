"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface HeaderVisibilityContextType {
  isVisible: boolean;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

export function HeaderVisibilityProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling down, hide when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <HeaderVisibilityContext.Provider value={{ isVisible }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility() {
  const context = useContext(HeaderVisibilityContext);
  if (context === undefined) {
    throw new Error("useHeaderVisibility must be used within a HeaderVisibilityProvider");
  }
  return context;
}
