import { describe, expect, it } from "vitest";
import { greetingFor, isFirstRun } from "./model";
import { SAMPLE_EMPTY, SAMPLE_FILLED } from "./sample";

describe("Command Center model", () => {
  it("is a first run only when there is no data at all", () => {
    expect(isFirstRun(SAMPLE_EMPTY)).toBe(true);
    expect(isFirstRun(SAMPLE_FILLED)).toBe(false);
    expect(isFirstRun({ ...SAMPLE_EMPTY, needs: SAMPLE_FILLED.needs })).toBe(false);
  });
  it("greets by the workspace's local time, not the server's", () => {
    const at = new Date("2026-11-13T07:30:00Z"); // 08:30 in Lagos, 23:30 the day before in Los Angeles
    expect(greetingFor(at, "Africa/Lagos")).toBe("morning");
    expect(greetingFor(at, "America/Los_Angeles")).toBe("evening");
    expect(greetingFor(new Date("2026-11-13T13:00:00Z"), "Africa/Lagos")).toBe("afternoon");
  });
});
