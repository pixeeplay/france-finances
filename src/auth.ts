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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: db ? "database" : "jwt",
  },
  pages: {
    signIn: "/profile",
  },
  callbacks: {
    session({ session, user }) {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
