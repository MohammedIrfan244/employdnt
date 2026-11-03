import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUserOnLogin } from "@/services/user.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
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
    async jwt({ token, account, user }) {
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
