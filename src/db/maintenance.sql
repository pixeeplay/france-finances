-- =============================================================================
-- PostgreSQL VACUUM / ANALYZE maintenance configuration
-- =============================================================================
-- Project: La Tronconneuse de Poche (france-finances.com)
-- Container: postgres (Coolify / Docker)
--
-- PostgreSQL has autovacuum enabled by default. These settings tune it for
-- the workload of this application: frequent small inserts (votes, sessions,
-- analytics_events) with occasional deletes (analytics purge).
--
-- HOW TO APPLY:
--   1. Connect to the postgres container:
--      sudo docker exec -i <pg_container> psql -U tronco -d tronconneuse
--   2. Paste this file or run:
--      sudo docker exec -i <pg_container> psql -U tronco -d tronconneuse < maintenance.sql
--
-- These ALTER TABLE settings persist across restarts (stored in pg_catalog).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Verify autovacuum is enabled (default: on)
-- -----------------------------------------------------------------------------
-- To check current server-level settings:
--   SHOW autovacuum;
--   SHOW autovacuum_naptime;
--   SHOW autovacuum_vacuum_threshold;
--   SHOW autovacuum_analyze_threshold;
--   SHOW autovacuum_vacuum_scale_factor;
--   SHOW autovacuum_analyze_scale_factor;

-- -----------------------------------------------------------------------------
-- 2. Per-table autovacuum tuning
-- -----------------------------------------------------------------------------
-- analytics_events: highest write volume, frequent inserts + periodic bulk delete.
-- Lower thresholds so vacuum runs more often on this table.
ALTER TABLE analytics_events SET (
  autovacuum_vacuum_threshold = 100,        -- vacuum after 100 dead tuples (default: 50)
  autovacuum_vacuum_scale_factor = 0.05,    -- + 5% of table size (default: 0.2 = 20%)
  autovacuum_analyze_threshold = 50,        -- analyze after 50 changed tuples (default: 50)
  autovacuum_analyze_scale_factor = 0.05    -- + 5% of table size (default: 0.1 = 10%)
);

-- votes: high insert volume (multiple per session), rarely deleted.
ALTER TABLE votes SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- sessions: moderate insert volume, rarely deleted.
ALTER TABLE sessions SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- users, audit_responses: low volume, defaults are fine.

-- -----------------------------------------------------------------------------
-- 3. Manual maintenance commands (run periodically or after bulk operations)
-- -----------------------------------------------------------------------------
-- Full vacuum + analyze on all tables (use after analytics purge):
--   VACUUM (VERBOSE, ANALYZE);
--
-- Targeted vacuum on analytics after purge:
--   VACUUM (VERBOSE, ANALYZE) analytics_events;
--
-- Check table bloat and last autovacuum/analyze times:
--   SELECT
--     schemaname, relname,
--     n_live_tup, n_dead_tup,
--     last_vacuum, last_autovacuum,
--     last_analyze, last_autoanalyze
--   FROM pg_stat_user_tables
--   ORDER BY n_dead_tup DESC;
--
-- Check for long-running queries that could block autovacuum:
--   SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
--   FROM pg_stat_activity
--   WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
--   AND state != 'idle'
--   ORDER BY duration DESC;

-- -----------------------------------------------------------------------------
-- 4. Recommended server-level settings (set in postgresql.conf or Docker env)
-- -----------------------------------------------------------------------------
-- These are the defaults; adjust if needed in Coolify env vars or custom
-- postgresql.conf mounted into the container:
--
--   autovacuum = on
--   autovacuum_naptime = 60           -- check for work every 60s (default: 1min)
--   autovacuum_max_workers = 3        -- default: 3
--   autovacuum_vacuum_cost_delay = 2  -- ms pause between I/O (default: 2ms in PG15+)
--   maintenance_work_mem = 128MB      -- memory for vacuum operations (default: 64MB)
--   log_autovacuum_min_duration = 0   -- log all autovacuum runs (set to 250 for only slow ones)

-- -----------------------------------------------------------------------------
-- 5. Run initial ANALYZE to ensure query planner has fresh statistics
-- -----------------------------------------------------------------------------
ANALYZE sessions;
ANALYZE votes;
ANALYZE analytics_events;
ANALYZE users;
ANALYZE audit_responses;
