-- Alignement des migrations sur src/db/schema.ts (derive accumulee via db:push).
-- Ne supprime aucune donnee : uniquement des cles etrangeres (recreees en
-- ON DELETE CASCADE) et un index. Idempotente : rejouable sur une base qui a
-- deja ces contraintes (IF EXISTS / IF NOT EXISTS).
-- Effet : supprimer un utilisateur supprime ses sessions, et supprimer une
-- session supprime ses votes et ses reponses d'audit (comme le prevoit le schema).
-- Le re-ajout d'une cle etrangere verifie les lignes existantes : la migration
-- echoue (et la transaction est annulee) s'il existe des lignes orphelines.
-- Pendant cette verification, les ecritures sur votes, sessions et audit_responses
-- sont bloquees jusqu'a la fin de la transaction : lancer a un moment calme
-- (procedure dans PLAN-REFONTE.md, section 4).
ALTER TABLE "audit_responses" DROP CONSTRAINT IF EXISTS "audit_responses_session_id_sessions_id_fk";--> statement-breakpoint
ALTER TABLE "audit_responses" ADD CONSTRAINT "audit_responses_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT IF EXISTS "votes_session_id_sessions_id_fk";--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_analytics_ip" ON "analytics_events" USING btree ("ip");
