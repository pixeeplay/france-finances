import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, authSessions, verificationTokens } from "@/db/schema";

/**
 * NextAuth.js v5 config.
 * Google + GitHub OAuth providers.
 * Uses Drizzle adapter when DB is available, otherwise falls back to JWT-only.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  ...(db
    ? {
        adapter: DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: authSessions,
          verificationTokensTable: verificationTokens,
        }),
      }
    : {}),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
        })]
      : []),
  ],
  logger: {
    warn: (message) => {
      console.warn("[NextAuth]", message);
    },
  },
  session: {
    strategy: db ? "database" : "jwt",
  },
  pages: {
    signIn: "/profil",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, user, token }) {
      if (user) {
        session.user.id = user.id;
      } else if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

// Warn at startup if no OAuth providers are configured
if (!process.env.GOOGLE_CLIENT_ID && !process.env.GITHUB_ID) {
  console.warn("[auth] No OAuth providers configured (GOOGLE_CLIENT_ID / GITHUB_ID missing). Auth will not work.");
}
