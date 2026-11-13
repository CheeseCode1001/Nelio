import { describe, expect, it } from "vitest";
import { AUDIENCES, GLOBAL_AUDIENCE, isAudience } from "./countries";
import { CURRENT_MILESTONE, NAV_GROUPS, SCREENS, hrefFor, isBuilt, screen, screenForPath } from "./screens";

describe("screen registry", () => {
  it("has unique ids and every navigation item points at a registered screen", () => {
    const ids = SCREENS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of NAV_GROUPS) for (const it of g.items) expect(ids).toContain(it.id);
  });
  it("builds hrefs for workspace, org and account screens", () => {
    const ctx = { ws: "ada-studio", org: "ada-org" };
    expect(hrefFor("APP-01", ctx)).toBe("/w/ada-studio/home");
    expect(hrefFor("BI-05", ctx)).toBe("/org/ada-org/limits");
    expect(hrefFor("AG-01", ctx)).toBe("/org/ada-org");
    expect(hrefFor("ST-03", ctx)).toBe("/account/appearance");
  });
  it("matches the longest registered path", () => {
    expect(screenForPath("workspace", "/settings/ai")?.id).toBe("ST-07");
    expect(screenForPath("workspace", "/settings")?.id).toBe("ST-10");
    expect(screenForPath("workspace", "/agents/new")?.id).toBe("APP-06");
    expect(screenForPath("workspace", "/agents/ag_1")?.id).toBe("APP-04");
    expect(screenForPath("org", "")?.id).toBe("AG-01");
    expect(screenForPath("workspace", "/nonsense")).toBeNull();
    expect(screenForPath("workspace", "/homework")).toBeNull();
  });
  it("marks only screens up to the current milestone as built", () => {
    expect(isBuilt(screen("APP-01"))).toBe(true);
    expect(isBuilt(screen("ST-03"))).toBe(true);
    expect(isBuilt(screen("PB-04"))).toBe(false);
    expect(SCREENS.filter(isBuilt).every((s) => s.milestone <= CURRENT_MILESTONE)).toBe(true);
  });
});

describe("audiences", () => {
  it("starts with Global and covers every country once", () => {
    expect(AUDIENCES[0]).toBe(GLOBAL_AUDIENCE);
    expect(AUDIENCES.length).toBeGreaterThan(240);
    expect(new Set(AUDIENCES).size).toBe(AUDIENCES.length);
    for (const c of ["Nigeria", "Ghana", "Kenya", "United Kingdom", "United States", "India", "Brazil"]) expect(isAudience(c)).toBe(true);
    expect(isAudience("Atlantis")).toBe(false);
  });
});
