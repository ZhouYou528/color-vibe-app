"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  // Sync next-auth session to user state
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const userData: User = {
        id: (session.user as any).id || session.user.email || "",
        name: session.user.name || "",
        email: session.user.email || "",
        picture: session.user.image || undefined,
      };
      setUser(userData);
      // Also store in localStorage for backward compatibility
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem("auth_user");
    }
  }, [session, status]);

  const login = () => {
    // Use next-auth signIn with account selection prompt
    signIn("google", undefined, { prompt: "select_account" });
  };

  const logout = () => {
    signOut();
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const isAuthenticated = !!user && status !== "loading";

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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

