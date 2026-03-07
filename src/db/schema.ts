import { pgTable, uuid, text, integer, real, boolean, timestamp, jsonb, smallint, primaryKey, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// === Users (Auth.js compatible) ===
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  username: text("username").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Auth.js Accounts (OAuth providers) ===
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
  index("idx_accounts_user_id").on(account.userId),
]);

// === Auth.js Sessions (server-side) ===
export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// === Auth.js Verification Tokens ===
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
]);

// === Sessions ===
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(), // client-generated UUID
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  deckId: text("deck_id").notNull(),
  level: smallint("level").notNull().default(1),
  archetypeId: text("archetype_id").notNull(),
  archetypeName: text("archetype_name").notNull(),
  totalDurationMs: integer("total_duration_ms").notNull(),
  totalCards: integer("total_cards").notNull(),
  keepCount: integer("keep_count").notNull(),
  cutCount: integer("cut_count").notNull(),
  reinforceCount: integer("reinforce_count").notNull().default(0),
  unjustifiedCount: integer("unjustified_count").notNull().default(0),
  totalKeptBillions: real("total_kept_billions").notNull(),
  totalCutBillions: real("total_cut_billions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_sessions_user_id").on(t.userId),
  index("idx_sessions_deck_id").on(t.deckId),
  index("idx_sessions_archetype_id").on(t.archetypeId),
  index("idx_sessions_created_at").on(t.createdAt),
]);

// === Votes (individual card votes for community aggregation) ===
export const votes = pgTable("votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  cardId: text("card_id").notNull(),
  direction: text("direction").notNull(), // keep | cut | reinforce | unjustified
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_votes_session_id").on(t.sessionId),
  index("idx_votes_card_id").on(t.cardId),
  index("idx_votes_card_direction").on(t.cardId, t.direction),
]);

// === Community aggregates (materialized cache, updated periodically) ===
export const communityVotes = pgTable("community_votes", {
  cardId: text("card_id").primaryKey(),
  keepCount: integer("keep_count").notNull().default(0),
  cutCount: integer("cut_count").notNull().default(0),
  reinforceCount: integer("reinforce_count").notNull().default(0),
  unjustifiedCount: integer("unjustified_count").notNull().default(0),
  totalVotes: integer("total_votes").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === Analytics events ===
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  event: text("event").notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  page: text("page"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_analytics_event").on(t.event),
  index("idx_analytics_created_at").on(t.createdAt),
  index("idx_analytics_page").on(t.page),
  index("idx_analytics_ip").on(t.ip),
]);

// === Waitlist (city launch notifications) ===
export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  city: text("city").notNull().default("paris"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_waitlist_email_city").on(t.email, t.city),
]);

// === Audit responses (Level 3) ===
export const auditResponses = pgTable("audit_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
  cardId: text("card_id").notNull(),
  diagnostics: jsonb("diagnostics").notNull(), // Record<string, boolean>
  recommendation: text("recommendation").notNull(), // keep | reduce | externalize | merge | reinforce | delete
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_audit_responses_session_id").on(t.sessionId),
]);
