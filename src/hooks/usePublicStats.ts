"use client";

import { useState, useEffect } from "react";

interface PublicStats {
  totalSessions: number;
  totalSwipes: number;
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({ totalSessions: 0, totalSwipes: 0 });

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((data: PublicStats) => setStats(data))
      .catch(() => {});
  }, []);

  return stats;
}
