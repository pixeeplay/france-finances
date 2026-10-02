import { describe, it, expect, afterEach, vi } from "vitest";
import { getAdminEmails, isAdmin, hasValidAnalyticsSecret } from "@/lib/admin";

describe("getAdminEmails", () => {
  it("returns an empty list when unset or empty", () => {
    expect(getAdminEmails(undefined)).toEqual([]);
    expect(getAdminEmails("")).toEqual([]);
    expect(getAdminEmails(" , ,")).toEqual([]);
  });

  it("splits, trims and lowercases entries", () => {
    expect(getAdminEmails(" Alice@Example.com, bob@example.org ,,")).toEqual([
      "alice@example.com",
      "bob@example.org",
    ]);
  });

  it("reads ADMIN_EMAILS from the environment by default", () => {
    vi.stubEnv("ADMIN_EMAILS", "Admin@Site.fr");
    expect(getAdminEmails()).toEqual(["admin@site.fr"]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});

describe("isAdmin", () => {
  const admins = ["admin@site.fr", "other@site.fr"];

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects missing session, user or email", () => {
    expect(isAdmin(null, admins)).toBe(false);
    expect(isAdmin(undefined, admins)).toBe(false);
    expect(isAdmin({}, admins)).toBe(false);
    expect(isAdmin({ user: null }, admins)).toBe(false);
    expect(isAdmin({ user: { email: null } }, admins)).toBe(false);
    expect(isAdmin({ user: { email: "" } }, admins)).toBe(false);
  });

  it("accepts a listed email, case-insensitively", () => {
    expect(isAdmin({ user: { email: "admin@site.fr" } }, admins)).toBe(true);
    expect(isAdmin({ user: { email: "ADMIN@Site.FR" } }, admins)).toBe(true);
    expect(isAdmin({ user: { email: " other@site.fr " } }, admins)).toBe(true);
  });

  it("rejects an unlisted email", () => {
    expect(isAdmin({ user: { email: "visitor@gmail.com" } }, admins)).toBe(false);
  });

  it("fails closed when ADMIN_EMAILS is unset", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAdmin({ user: { email: "admin@site.fr" } })).toBe(false);
  });

  it("uses ADMIN_EMAILS from the environment by default", () => {
    vi.stubEnv("ADMIN_EMAILS", "a@x.fr, Admin@Site.fr");
    expect(isAdmin({ user: { email: "admin@site.fr" } })).toBe(true);
  });
});

describe("hasValidAnalyticsSecret", () => {
  it("fails closed when the secret is unset", () => {
    expect(hasValidAnalyticsSecret("anything", undefined)).toBe(false);
    expect(hasValidAnalyticsSecret("", "")).toBe(false);
  });

  it("rejects missing or wrong values", () => {
    expect(hasValidAnalyticsSecret(null, "s3cret")).toBe(false);
    expect(hasValidAnalyticsSecret("s3cre", "s3cret")).toBe(false);
    expect(hasValidAnalyticsSecret("s3creT", "s3cret")).toBe(false);
  });

  it("accepts the exact secret", () => {
    expect(hasValidAnalyticsSecret("s3cret", "s3cret")).toBe(true);
  });
});
