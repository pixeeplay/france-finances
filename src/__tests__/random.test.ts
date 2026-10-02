import { describe, it, expect } from "vitest";
import { createSeededRng, hashString, mulberry32, seededShuffle } from "@/lib/random";

describe("hashString", () => {
  it("is deterministic and spreads close inputs", () => {
    expect(hashString("daily:2026-10-02")).toBe(hashString("daily:2026-10-02"));
    expect(hashString("daily:2026-10-02")).not.toBe(hashString("daily:2026-10-03"));
    expect(hashString("")).toBe(0x811c9dc5);
  });
});

describe("mulberry32", () => {
  it("produces the same sequence for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 5 }, a);
    const seqB = Array.from({ length: 5 }, b);
    expect(seqA).toEqual(seqB);
  });

  it("stays within [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is roughly uniform", () => {
    const rng = createSeededRng("uniform");
    const buckets = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) buckets[Math.floor(rng() * 4)]++;
    for (const b of buckets) expect(b).toBeGreaterThan(850);
  });
});

describe("seededShuffle", () => {
  const items = Array.from({ length: 20 }, (_, i) => i);

  it("returns a permutation without mutating the input", () => {
    const out = seededShuffle(items, createSeededRng("x"));
    expect(out).toHaveLength(20);
    expect([...out].sort((a, b) => a - b)).toEqual(items);
    expect(items[0]).toBe(0);
  });

  it("is deterministic for a given seed and varies across seeds", () => {
    expect(seededShuffle(items, createSeededRng("a"))).toEqual(seededShuffle(items, createSeededRng("a")));
    expect(seededShuffle(items, createSeededRng("a"))).not.toEqual(seededShuffle(items, createSeededRng("b")));
  });
});
