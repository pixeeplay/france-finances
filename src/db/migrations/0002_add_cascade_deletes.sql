-- Migration: 0002_add_cascade_deletes
-- Add ON DELETE CASCADE to votes.session_id and audit_responses.session_id
-- so deleting a session automatically cleans up related rows.

-- votes.session_id -> sessions.id
ALTER TABLE "votes"
  DROP CONSTRAINT IF EXISTS "votes_session_id_sessions_id_fk",
  ADD CONSTRAINT "votes_session_id_sessions_id_fk"
    FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE;

-- audit_responses.session_id -> sessions.id
ALTER TABLE "audit_responses"
  DROP CONSTRAINT IF EXISTS "audit_responses_session_id_sessions_id_fk",
  ADD CONSTRAINT "audit_responses_session_id_sessions_id_fk"
    FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE;
