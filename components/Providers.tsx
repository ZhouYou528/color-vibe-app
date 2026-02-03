"use client";

import { PhotoProvider } from "@/contexts/PhotoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import { HeaderVisibilityProvider } from "@/contexts/HeaderVisibilityContext";
import { ResultProvider } from "@/contexts/ResultContext";
import BottomNavigation from "@/components/BottomNavigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <PhotoProvider>
          <ResultProvider>
            <HeaderVisibilityProvider>
              {children}
              <BottomNavigation />
            </HeaderVisibilityProvider>
          </ResultProvider>
        </PhotoProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
