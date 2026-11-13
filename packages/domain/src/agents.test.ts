import { describe, expect, it } from "vitest";
import { CLIP_RUN_ESTIMATE, canReserve, committedCredits, nextRunAfter, settle, weekResetsAt, weekStartFor, zonedTimeToUtc } from "./agents";

const LAGOS = "Africa/Lagos"; // UTC+1, no daylight saving
const LONDON = "Europe/London"; // daylight saving

describe("time zones and budget weeks", () => {
  it("converts a Lagos wall-clock time to UTC", () => {
    expect(zonedTimeToUtc(2026, 11, 13, 18, 0, LAGOS).toISOString()).toBe("2026-11-13T17:00:00.000Z");
  });
  it("handles a daylight-saving zone on both sides of the change", () => {
    expect(zonedTimeToUtc(2026, 7, 1, 12, 0, LONDON).toISOString()).toBe("2026-07-01T11:00:00.000Z");
    expect(zonedTimeToUtc(2026, 12, 1, 12, 0, LONDON).toISOString()).toBe("2026-12-01T12:00:00.000Z");
  });
  it("starts the budget week on Monday in the workspace time zone", () => {
    // Friday 13 Nov 2026 → week of Monday 9 Nov.
    expect(weekStartFor(new Date("2026-11-13T10:00:00Z"), LAGOS)).toBe("2026-11-09");
    // Sunday 23:30 UTC is already Monday 00:30 in Lagos.
    expect(weekStartFor(new Date("2026-11-15T23:30:00Z"), LAGOS)).toBe("2026-11-16");
  });
  it("resets the week at Monday 00:00 local", () => {
    expect(weekResetsAt(new Date("2026-11-13T10:00:00Z"), LAGOS).toISOString()).toBe("2026-11-15T23:00:00.000Z");
  });
});

describe("schedules", () => {
  const mwf = { days: ["mon", "wed", "fri"] as ("mon" | "wed" | "fri")[], time: "18:00" };
  it("finds the next run later the same day", () => {
    expect(nextRunAfter(mwf, new Date("2026-11-13T10:00:00Z"), LAGOS)?.toISOString()).toBe("2026-11-13T17:00:00.000Z");
  });
  it("skips to the next scheduled day once today's time has passed", () => {
    expect(nextRunAfter(mwf, new Date("2026-11-13T17:00:00Z"), LAGOS)?.toISOString()).toBe("2026-11-16T17:00:00.000Z");
  });
  it("returns null for an empty or invalid schedule", () => {
    expect(nextRunAfter({ days: [], time: "18:00" }, new Date(), LAGOS)).toBeNull();
    expect(nextRunAfter({ days: ["mon"], time: "25:00" }, new Date(), LAGOS)).toBeNull();
  });
});

describe("budgets", () => {
  it("totals the clipping run estimate shown on the board", () => {
    expect(CLIP_RUN_ESTIMATE).toBe(52);
  });
  it("counts open reservations, then settled amounts once closed", () => {
    expect(committedCredits([
      { stepId: "a", kind: "reserve", credits: 40 },
      { stepId: "a", kind: "settle", credits: 36 },
      { stepId: "a", kind: "release", credits: 4 },
      { stepId: "b", kind: "reserve", credits: 20 },
      { stepId: "c", kind: "reserve", credits: 8 },
      { stepId: "c", kind: "release", credits: 8 },
    ])).toBe(56);
  });
  it("blocks a step that would overspend the weekly budget", () => {
    expect(canReserve({ estimate: 40, weeklyBudget: 300, weekCommitted: 276, perRunLimit: 100, runCommitted: 0 }))
      .toEqual({ ok: false, reason: "weekly_budget", text: "Needs 40 credits, 24 left in this agent’s budget" });
  });
  it("blocks a step that would overspend the per-run limit", () => {
    expect(canReserve({ estimate: 20, weeklyBudget: 300, weekCommitted: 0, perRunLimit: 60, runCommitted: 52 }).ok).toBe(false);
  });
  it("always allows free steps", () => {
    expect(canReserve({ estimate: 0, weeklyBudget: 1, weekCommitted: 1, perRunLimit: 1, runCommitted: 1 })).toEqual({ ok: true });
  });
  it("never settles more than was reserved", () => {
    expect(settle(40, 36)).toEqual({ settled: 36, released: 4 });
    expect(settle(40, 55)).toEqual({ settled: 40, released: 0 });
    expect(settle(40, -3)).toEqual({ settled: 0, released: 40 });
  });
});
