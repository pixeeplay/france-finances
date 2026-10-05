import { describe, it, expect, beforeEach } from "vitest";
import {
  applyDailyResult,
  buildDailyShareText,
  DAILY_CARD_COUNT,
  DAILY_KIND_FILTER_FROM,
  daysBetween,
  directionsToSquares,
  drawDailyCards,
  getActiveStreak,
  getDailyNumber,
  getParisDateKey,
  INITIAL_DAILY_PROGRESS,
  isValidDateKey,
  type DailyResult,
} from "@/lib/daily";
import { useDailyStore } from "@/stores/dailyStore";
import decksData, { offPlayCards } from "@/data";
import type { Card } from "@/types";

const allCards = decksData.cards as Card[];

/** Decale une cle de date de `days` jours (calendrier UTC) */
function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function result(
  dateKey: string,
  extra: Partial<DailyResult> = {},
): DailyResult {
  return {
    dateKey,
    directions: ["cut", "keep"],
    cutBillions: 3,
    totalBillions: 10,
    ...extra,
  };
}

describe("getParisDateKey", () => {
  it("uses the Europe/Paris calendar day", () => {
    // 23:30 UTC on Oct 1st = 01:30 on Oct 2nd in Paris (UTC+2)
    expect(getParisDateKey(new Date("2026-10-01T23:30:00Z"))).toBe(
      "2026-10-02",
    );
    expect(getParisDateKey(new Date("2026-10-01T21:59:00Z"))).toBe(
      "2026-10-01",
    );
    // Winter time (UTC+1)
    expect(getParisDateKey(new Date("2026-12-31T23:30:00Z"))).toBe(
      "2027-01-01",
    );
  });
});

describe("date key helpers", () => {
  it("validates keys", () => {
    expect(isValidDateKey("2026-10-02")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("2026-1-2")).toBe(false);
  });

  it("diffs across months, years and DST changes", () => {
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-01-01", "2025-12-31")).toBe(-1);
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
    expect(daysBetween("2026-10-26", "2026-10-24")).toBe(-2);
  });

  it("numbers daily decks from the epoch", () => {
    expect(getDailyNumber("2026-10-01")).toBe(1);
    expect(getDailyNumber("2026-10-31")).toBe(31);
  });
});

describe("drawDailyCards", () => {
  it("is identical for everyone on a given day, whatever the input order", () => {
    const a = drawDailyCards(allCards, "2026-10-12").map((c) => c.id);
    const b = drawDailyCards([...allCards].reverse(), "2026-10-12").map(
      (c) => c.id,
    );
    expect(a).toEqual(b);
    expect(a).toHaveLength(DAILY_CARD_COUNT);
  });

  it("changes from one day to the next", () => {
    const a = drawDailyCards(allCards, "2026-10-12").map((c) => c.id);
    const b = drawDailyCards(allCards, "2026-10-13").map((c) => c.id);
    expect(a).not.toEqual(b);
  });

  it("only draws spending cards and favours distinct decks", () => {
    for (const day of ["2026-10-12", "2026-11-15", "2027-03-01"]) {
      const cards = drawDailyCards(allCards, day);
      expect(cards.every((c) => c.deckId !== "recettes")).toBe(true);
      expect(cards.every((c) => c.kind === "depense")).toBe(true);
      expect(new Set(cards.map((c) => c.deckId)).size).toBe(DAILY_CARD_COUNT);
      expect(new Set(cards.map((c) => c.id)).size).toBe(DAILY_CARD_COUNT);
    }
  });

  it("never draws revenue or indicator cards, whatever the day", () => {
    for (let i = 0; i < 60; i++) {
      const day = new Date(Date.UTC(2026, 9, 6 + i)).toISOString().slice(0, 10);
      expect(
        drawDailyCards(allCards, day).every((c) => c.kind === "depense"),
      ).toBe(true);
    }
  });

  it("ignores off-play cards from the kind filter date on", () => {
    const withOffPlay = [...allCards, ...offPlayCards];
    for (let i = 0; i < 60; i++) {
      const day = new Date(Date.UTC(2026, 9, 6 + i)).toISOString().slice(0, 10);
      expect(
        drawDailyCards(withOffPlay, day).every((c) => c.playable !== false),
      ).toBe(true);
    }
  });

  // Un deck du jour deja servi ne doit jamais changer (partage facon Wordle) :
  // ces tirages sont ceux qui etaient en ligne avant le filtre par nature.
  it("keeps the draws served before the kind filter date", () => {
    const withOffPlay = [...allCards, ...offPlayCards];
    expect(DAILY_KIND_FILTER_FROM).toBe("2026-10-06");
    expect(drawDailyCards(withOffPlay, "2026-10-01").map((c) => c.id)).toEqual([
      "soc-18",
      "emp-06",
      "eta-03",
      "zom-10",
      "ene-03",
      "cul-09",
      "hop-01",
      "def-09",
      "col-12",
      "sec-14",
    ]);
    expect(drawDailyCards(withOffPlay, "2026-10-05").map((c) => c.id)).toEqual([
      "san-04",
      "imm-02",
      "ukr-11",
      "emp-06",
      "env-15",
      "def-12",
      "log-06",
      "zom-02",
      "soc-10",
      "ene-13",
    ]);
  });

  // Toute modification du pool (carte ajoutee, nature ou statut hors jeu change)
  // change les tirages a venir : a deployer apres minuit (Paris) et a mettre a
  // jour ici en connaissance de cause.
  it("pins the first draws with the kind filter", () => {
    const withOffPlay = [...allCards, ...offPlayCards];
    expect(drawDailyCards(withOffPlay, "2026-10-06").map((c) => c.id)).toEqual([
      "cul-06",
      "log-04",
      "imm-06",
      "edu-08",
      "agr-08",
      "sec-07",
      "num-04",
      "ene-11",
      "soc-06",
      "env-15",
    ]);
    expect(drawDailyCards(withOffPlay, "2026-11-15").map((c) => c.id)).toEqual([
      "sec-08",
      "ret-01",
      "edu-01",
      "zom-01",
      "imm-15",
      "def-05",
      "log-08",
      "cul-09",
      "eta-08",
      "emp-17",
    ]);
  });

  it("fills with same-deck cards when there are not enough decks", () => {
    const few = allCards.filter(
      (c) => c.deckId === "defense" || c.deckId === "sante",
    );
    const cards = drawDailyCards(few, "2026-10-12", 5);
    expect(cards).toHaveLength(5);
    expect(new Set(cards.map((c) => c.id)).size).toBe(5);
  });
});

describe("applyDailyResult", () => {
  it("starts a streak at 1", () => {
    const p = applyDailyResult(INITIAL_DAILY_PROGRESS, result("2026-10-02"));
    expect(p.currentStreak).toBe(1);
    expect(p.bestStreak).toBe(1);
    expect(p.lastPlayedDate).toBe("2026-10-02");
  });

  it("extends on consecutive days and resets after a gap", () => {
    let p = applyDailyResult(INITIAL_DAILY_PROGRESS, result("2026-10-02"));
    p = applyDailyResult(p, result("2026-10-03"));
    p = applyDailyResult(p, result("2026-10-04"));
    expect(p.currentStreak).toBe(3);
    p = applyDailyResult(p, result("2026-10-06"));
    expect(p.currentStreak).toBe(1);
    expect(p.bestStreak).toBe(3);
  });

  it("only counts the first play of the day", () => {
    const first = applyDailyResult(
      INITIAL_DAILY_PROGRESS,
      result("2026-10-02", { cutBillions: 1 }),
    );
    const again = applyDailyResult(
      first,
      result("2026-10-02", { cutBillions: 99 }),
    );
    expect(again).toBe(first);
    expect(again.results["2026-10-02"].cutBillions).toBe(1);
  });

  it("archives past days without touching the streak and ignores invalid keys", () => {
    let p = applyDailyResult(INITIAL_DAILY_PROGRESS, result("2026-10-05"));
    p = applyDailyResult(p, result("2026-10-01"));
    expect(p.lastPlayedDate).toBe("2026-10-05");
    expect(p.currentStreak).toBe(1);
    expect(p.results["2026-10-01"]).toBeDefined();
    expect(applyDailyResult(p, result("nope"))).toBe(p);
  });

  it("keeps at most 60 results", () => {
    let p = INITIAL_DAILY_PROGRESS;
    for (let i = 0; i < 70; i++)
      p = applyDailyResult(p, result(shiftDateKey("2026-10-01", i)));
    expect(Object.keys(p.results)).toHaveLength(60);
    expect(p.currentStreak).toBe(70);
    expect(p.results["2026-10-01"]).toBeUndefined();
  });
});

describe("getActiveStreak", () => {
  const p = {
    ...INITIAL_DAILY_PROGRESS,
    lastPlayedDate: "2026-10-02",
    currentStreak: 4,
    bestStreak: 4,
  };
  it("is kept today and tomorrow, lost afterwards", () => {
    expect(getActiveStreak(p, "2026-10-02")).toBe(4);
    expect(getActiveStreak(p, "2026-10-03")).toBe(4);
    expect(getActiveStreak(p, "2026-10-04")).toBe(0);
    expect(getActiveStreak(INITIAL_DAILY_PROGRESS, "2026-10-02")).toBe(0);
  });
});

describe("share text", () => {
  it("maps directions to coloured squares", () => {
    expect(
      directionsToSquares(["cut", "keep", "reinforce", "unjustified"]),
    ).toBe("🟥🟩🟦🟧");
  });

  it("builds a Wordle-like text", () => {
    const text = buildDailyShareText({
      result: result("2026-10-02", {
        directions: ["cut", "keep", "cut"],
        cutBillions: 34.25,
        totalBillions: 120,
      }),
      streak: 3,
      url: "https://france-finances.com/jeu/quotidien",
    });
    expect(text.split("\n")).toEqual([
      "Budget Swipe, deck du jour n°2",
      "🟥🟩🟥",
      "Remis en question : 34,3 Md€ sur 120 Md€",
      "Série : 3 jours",
      "https://france-finances.com/jeu/quotidien",
    ]);
  });

  it("omits the streak line for a single day", () => {
    const text = buildDailyShareText({
      result: result("2026-10-02"),
      streak: 1,
      url: "u",
    });
    expect(text).not.toContain("Série");
  });
});

describe("useDailyStore", () => {
  beforeEach(() => {
    useDailyStore.getState().resetDaily();
  });

  it("records results and streaks idempotently", () => {
    useDailyStore.getState().recordResult(result("2026-10-02"));
    useDailyStore.getState().recordResult(result("2026-10-03"));
    useDailyStore
      .getState()
      .recordResult(result("2026-10-03", { cutBillions: 50 }));
    const s = useDailyStore.getState();
    expect(s.currentStreak).toBe(2);
    expect(s.results["2026-10-03"].cutBillions).toBe(3);
  });

  it("persists to localStorage under trnc:daily", () => {
    useDailyStore.getState().recordResult(result("2026-10-02"));
    const raw = localStorage.getItem("trnc:daily");
    expect(raw).toContain("2026-10-02");
  });
});
