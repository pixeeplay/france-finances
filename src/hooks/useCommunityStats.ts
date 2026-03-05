"use client";

import { useState, useEffect } from "react";

interface ArchetypeDist {
  archetypeId: string;
  archetypeName: string;
  count: number;
  percent: number;
}

interface CategoryStat {
  deckId: string;
  keepCount: number;
  cutCount: number;
  total: number;
  cutPercent: number;
}

interface TopCard {
  cardId: string;
  cutPercent?: number;
  keepPercent?: number;
  totalVotes: number;
}

export interface CommunityStats {
  archetypeDistribution: ArchetypeDist[];
  categoryStats: CategoryStat[];
  topCut: TopCard[];
  topProtected: TopCard[];
  totalSessions: number;
  isFallback: boolean;
}

// Mock fallback data
const FALLBACK: CommunityStats = {
  archetypeDistribution: [],
  categoryStats: [],
  topCut: [],
  topProtected: [],
  totalSessions: 0,
  isFallback: true,
};

export function useCommunityStats(): CommunityStats {
  const [data, setData] = useState<CommunityStats>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/community/stats")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (json.ok === false || json.fallback) {
          setData(FALLBACK);
        } else {
          setData({ ...json, isFallback: false });
        }
      })
      .catch(() => {
        if (!cancelled) setData(FALLBACK);
      });

    return () => { cancelled = true; };
  }, []);

  return data;
}
