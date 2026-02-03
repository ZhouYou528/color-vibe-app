import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

// Create NextAuth instance once and export both handlers and auth
export const { handlers, auth } = NextAuth(authOptions);

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
