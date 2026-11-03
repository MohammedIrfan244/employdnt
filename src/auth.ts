import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUserOnLogin } from "@/services/user.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 1. Standard Google Sign-In (basic profile only, never blocked by restricted scope checks)
    Google({
      id: "google",
      name: "Google",
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // 2. Dedicated Gmail connection provider (requests gmail.readonly + offline refresh token)
    Google({
      id: "google-gmail",
      name: "Google Gmail",
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account && token.email) {
        token.accessToken = account.access_token;

        // Persist user and tokens to MongoDB
        try {
          await syncUserOnLogin({
            email: token.email,
            name: token.name,
            image: token.picture,
            googleId: account.providerAccountId,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            scope: account.scope,
          });
        } catch {
          // silent failure during session initialization
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
