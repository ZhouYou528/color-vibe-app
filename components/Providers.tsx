"use client";

import { PhotoProvider } from "@/contexts/PhotoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "next-auth/react";
import { HeaderVisibilityProvider } from "@/contexts/HeaderVisibilityContext";
import BottomNavigation from "@/components/BottomNavigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <PhotoProvider>
          <HeaderVisibilityProvider>
            {children}
            <BottomNavigation />
          </HeaderVisibilityProvider>
        </PhotoProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
