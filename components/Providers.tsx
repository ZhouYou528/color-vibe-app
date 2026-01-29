"use client";

import { PhotoProvider } from "@/contexts/PhotoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PhotoProvider>
        {children}
        <BottomNavigation />
      </PhotoProvider>
    </AuthProvider>
  );
}
