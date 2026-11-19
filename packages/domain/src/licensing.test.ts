import { describe, expect, it } from "vitest";
import { attributionMissing, checkUse, effectiveStatus, expiresAtFor, revocationImpact, STATUS_LABEL, termsSummary, validateTerms, type TermsSnapshot } from "./licensing";

const terms: TermsSnapshot = { licenseType: "free", allowedUses: ["clips", "compilations"], platforms: ["instagram", "youtube"], commercial: false, attribution: "@chefkemi", edits: ["captions", "crops", "trims"], expiresMonths: 12, excludedCount: 2 };
const now = new Date("2026-11-20T12:00:00Z");
const active = { status: "active" as const, type: "free" as const, expiresAt: new Date("2027-06-30T00:00:00Z"), terms };

describe("validateTerms", () => {
  it("accepts complete free terms from a verified creator", () => expect(validateTerms(terms, { verified: true })).toEqual([]));
  it("requires verification", () => expect(validateTerms(terms, { verified: false }).map((p) => p.field)).toContain("verification"));
  it("never publishes paid terms", () => expect(validateTerms({ ...terms, licenseType: "paid" }, { verified: true }).map((p) => p.field)).toContain("licenseType"));
  it("needs platforms, uses and attribution", () => {
    const f = validateTerms({ ...terms, platforms: [], allowedUses: [], attribution: " " }, { verified: true }).map((p) => p.field);
    expect(f).toEqual(expect.arrayContaining(["platforms", "allowedUses", "attribution"]));
  });
});

describe("expiresAtFor", () => {
  it("adds months", () => expect(expiresAtFor(terms, new Date("2026-11-20T00:00:00Z"))?.toISOString()).toBe("2027-11-20T00:00:00.000Z"));
  it("clamps to the end of a shorter month", () => expect(expiresAtFor({ expiresMonths: 3 }, new Date("2026-11-30T00:00:00Z"))?.toISOString()).toBe("2027-02-28T00:00:00.000Z"));
  it("no expiry means until revoked", () => expect(expiresAtFor({ expiresMonths: null }, now)).toBeNull());
});

describe("effectiveStatus", () => {
  it("active", () => expect(effectiveStatus(active, "listed", now).kind).toBe("active"));
  it("ends soon", () => {
    const s = effectiveStatus({ ...active, expiresAt: new Date("2026-11-25T12:00:00Z") }, "listed", now);
    expect(s).toEqual({ kind: "expiring", endsInDays: 5 });
    expect(STATUS_LABEL(s)).toBe("ends in 5 days");
  });
  it("expired once the date passes even before the sweep runs", () => expect(effectiveStatus({ ...active, expiresAt: new Date("2026-11-19T00:00:00Z") }, "listed", now).kind).toBe("expired"));
  it("suspended listing pauses active licences", () => expect(effectiveStatus(active, "suspended", now).kind).toBe("suspended"));
});

describe("checkUse", () => {
  it("allows an allowed platform", () => expect(checkUse(active, "listed", { action: "schedule", platform: "instagram" }, now).ok).toBe(true));
  it("blocks without a licence, or with only a request", () => {
    expect(checkUse(null, "listed", { action: "process" }, now)).toMatchObject({ ok: false, code: "no_license" });
    expect(checkUse({ ...active, status: "requested" }, "listed", { action: "process" }, now)).toMatchObject({ code: "no_license" });
  });
  it("blocks revoked, expired and suspended", () => {
    expect(checkUse({ ...active, status: "revoked" }, "listed", { action: "render" }, now)).toMatchObject({ code: "revoked" });
    expect(checkUse({ ...active, expiresAt: new Date("2026-01-01") }, "listed", { action: "render" }, now)).toMatchObject({ code: "expired" });
    expect(checkUse(active, "suspended", { action: "render" }, now)).toMatchObject({ code: "suspended" });
  });
  it("blocks excluded videos, other platforms and commercial use", () => {
    expect(checkUse(active, "listed", { action: "process", videoExcluded: true }, now)).toMatchObject({ code: "excluded" });
    expect(checkUse(active, "listed", { action: "publish", platform: "tiktok" }, now)).toMatchObject({ code: "platform" });
    expect(checkUse(active, "listed", { action: "publish", commercial: true }, now)).toMatchObject({ code: "commercial" });
  });
});

describe("revocationImpact", () => {
  it("holds scheduled posts and flags published ones", () => {
    const r = revocationImpact([{ id: "a", state: "scheduled" }, { id: "b", state: "published" }, { id: "c", state: "draft" }, { id: "d", state: "draft" }]);
    expect(r).toEqual({ hold: ["a"], flag: ["b"], drafts: 2 });
  });
});

describe("attribution and summary", () => {
  it("spots a missing attribution", () => {
    expect(attributionMissing("@chefkemi", "Jollof for one 🍚")).toBe(true);
    expect(attributionMissing("@chefkemi", "Jollof for one via @ChefKemi")).toBe(false);
  });
  it("summarises terms like the board", () => {
    const s = termsSummary(terms);
    expect(s.scope).toBe("All videos except 2 flagged");
    expect(s.uses).toBe("Clips and compilations");
    expect(s.attribution).toBe("Required: “@chefkemi”");
    expect(s.edits).toBe("Captions, crops and trims");
  });
});
