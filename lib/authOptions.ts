import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Force account selection every time
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      // Add user ID (Google sub) to session
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth account_id and the profile id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = account.providerAccountId;
      }
      if (profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
