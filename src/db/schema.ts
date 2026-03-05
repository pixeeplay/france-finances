import { pgTable, uuid, text, integer, real, boolean, timestamp, jsonb, smallint } from "drizzle-orm/pg-core";

// === Users ===
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Sessions ===
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(), // client-generated UUID
  userId: uuid("user_id").references(() => users.id),
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
});

// === Votes (individual card votes for community aggregation) ===
export const votes = pgTable("votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  cardId: text("card_id").notNull(),
  direction: text("direction").notNull(), // keep | cut | reinforce | unjustified
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// === Audit responses (Level 3) ===
export const auditResponses = pgTable("audit_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id).notNull(),
  cardId: text("card_id").notNull(),
  diagnostics: jsonb("diagnostics").notNull(), // Record<string, boolean>
  recommendation: text("recommendation").notNull(), // keep | reduce | externalize | merge | reinforce | delete
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
