/**
 * localStorage schema versioning and migration.
 *
 * When the schema changes, bump CURRENT_VERSION and add a migration
 * function in the MIGRATIONS map. Migrations run sequentially from
 * the stored version to CURRENT_VERSION on app boot.
 */

const VERSION_KEY = "trnc:schema_version";
const CURRENT_VERSION = 2;

type MigrationFn = () => void;

/**
 * Migration map: version N migrates from N-1 → N.
 * Each migration reads/writes localStorage directly.
 */
const MIGRATIONS: Record<number, MigrationFn> = {
  // v1 → v2: add sessionsPerDeck to global stats if missing
  2: () => {
    try {
      const raw = localStorage.getItem("trnc:stats");
      if (!raw) return;
      const stats = JSON.parse(raw);
      if (!stats.sessionsPerDeck) {
        // Rebuild sessionsPerDeck from stored sessions
        const sessionsRaw = localStorage.getItem("trnc:sessions");
        const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
        const perDeck: Record<string, number> = {};
        for (const s of sessions) {
          if (s.deckId) {
            perDeck[s.deckId] = (perDeck[s.deckId] || 0) + 1;
          }
        }
        stats.sessionsPerDeck = perDeck;
        localStorage.setItem("trnc:stats", JSON.stringify(stats));
      }
    } catch {
      // Graceful degradation
    }
  },
};

function getStoredVersion(): number {
  try {
    const raw = localStorage.getItem(VERSION_KEY);
    return raw ? parseInt(raw, 10) : 1;
  } catch {
    return 1;
  }
}

function setStoredVersion(version: number): void {
  try {
    localStorage.setItem(VERSION_KEY, String(version));
  } catch {
    // Storage full
  }
}

/**
 * Run pending migrations. Call this once on app boot (client-side only).
 */
export function runMigrations(): void {
  if (typeof window === "undefined") return;

  const storedVersion = getStoredVersion();
  if (storedVersion >= CURRENT_VERSION) return;

  for (let v = storedVersion + 1; v <= CURRENT_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) {
      try {
        migration();
      } catch {
        // Don't block the app on migration failure
      }
    }
  }

  setStoredVersion(CURRENT_VERSION);
}
