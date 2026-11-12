import { describe, expect, it } from "vitest";
import {
  can, canAsContentOwner, canAsPlatformAdmin, canInOrg, canSeeWorkspace, homeSurface, roleInWorkspace,
  surfacesFor, topBarVisibility, type Actor,
} from "./access";
import { accessFor, CAPABILITIES, MATRIX } from "./permissions";
import { MATRIX_ROLES } from "./roles";
import { safeNextPath, signUpSchema, slugify } from "./validation";

const base = { isPlatformAdmin: false, isContentOwner: false, orgs: [], workspaces: [] } satisfies Omit<Actor, "userId">;
// Two agencies, each with client workspaces.
const A = { orgId: "org-a", acme: { workspaceId: "ws-acme", orgId: "org-a" }, lagos: { workspaceId: "ws-lagos", orgId: "org-a" } };
const B = { orgId: "org-b", kemi: { workspaceId: "ws-kemi", orgId: "org-b" } };

const agencyOwnerA: Actor = { ...base, userId: "u1", orgs: [{ orgId: A.orgId, role: "owner", accountType: "agency" }] };
const agencyAdminA: Actor = { ...base, userId: "u2", orgs: [{ orgId: A.orgId, role: "admin", accountType: "agency" }] };
const managerAcme: Actor = { ...base, userId: "u3", workspaces: [{ ...A.acme, role: "manager" }] };
const editorAcme: Actor = { ...base, userId: "u4", workspaces: [{ ...A.acme, role: "editor" }] };
const viewerAcme: Actor = { ...base, userId: "u5", workspaces: [{ ...A.acme, role: "viewer" }] };
const clientAcme: Actor = { ...base, userId: "u6", workspaces: [{ ...A.acme, role: "client_approver" }] };
const creator: Actor = { ...base, userId: "u7", orgs: [{ orgId: "org-c", role: "owner", accountType: "creator" }] };
const business: Actor = { ...base, userId: "u8", orgs: [{ orgId: "org-d", role: "owner", accountType: "business" }] };
const contentOwner: Actor = { ...base, userId: "u9", isContentOwner: true };
const platformAdmin: Actor = { ...base, userId: "u10", isPlatformAdmin: true };

describe("permission matrix (B §6)", () => {
  it("has a cell for every role in every row", () => {
    for (const cap of CAPABILITIES) for (const r of MATRIX_ROLES) expect(MATRIX[cap][r]).toMatch(/^[FAOVPR-]$/);
    expect(CAPABILITIES.length).toBe(35);
  });
  it("matches spot-checked cells from the document", () => {
    expect(accessFor("WM", "billing.view")).toBe("V");
    expect(accessFor("WM", "billing.set_limits")).toBe("R");
    expect(accessFor("AA", "org.delete_or_transfer")).toBe("-");
    expect(accessFor("ED", "agent.activate")).toBe("R");
    expect(accessFor("CA", "approval.decide")).toBe("P");
    expect(accessFor("ED", "approval.decide")).toBe("-");
    expect(accessFor("CO", "creator.manage_terms")).toBe("O");
    expect(accessFor("PA", "billing.manage")).toBe("-");
  });
});

describe("tenant isolation (AC-02)", () => {
  it("a member of client A has no path to client B, or to a sibling client", () => {
    for (const actor of [managerAcme, editorAcme, viewerAcme, clientAcme]) {
      expect(canSeeWorkspace(actor, A.acme)).toBe(true);
      expect(canSeeWorkspace(actor, A.lagos)).toBe(false);
      expect(canSeeWorkspace(actor, B.kemi)).toBe(false);
      expect(can(actor, "content.comment", B.kemi)).toEqual({ allowed: false, reason: "not_a_member" });
    }
  });
  it("an agency owner reaches every workspace of their own organization and none of another", () => {
    expect(roleInWorkspace(agencyOwnerA, A.acme)).toBe("AO");
    expect(roleInWorkspace(agencyOwnerA, A.lagos)).toBe("AO");
    expect(roleInWorkspace(agencyOwnerA, B.kemi)).toBeNull();
    expect(canInOrg(agencyOwnerA, "billing.manage", B.orgId)).toEqual({ allowed: false, reason: "not_a_member" });
  });
  it("rejects a membership whose organization does not match the workspace (forged reference)", () => {
    expect(canSeeWorkspace(managerAcme, { workspaceId: "ws-acme", orgId: "org-b" })).toBe(false);
  });
  it("platform admin and content owner flags grant no tenant access by themselves", () => {
    expect(canSeeWorkspace(platformAdmin, A.acme)).toBe(false);
    expect(canSeeWorkspace(contentOwner, A.acme)).toBe(false);
  });
});

describe("role rules", () => {
  it("client approvers decide per platform and see no billing, agents or connections", () => {
    expect(can(clientAcme, "approval.decide", A.acme)).toMatchObject({ allowed: true, access: "P" });
    for (const cap of ["billing.view", "connections.view", "agent.pause_resume", "activity.view", "content.edit"] as const) {
      expect(can(clientAcme, cap, A.acme).allowed).toBe(false);
    }
  });
  it("editors cannot approve, authorize autonomous publishing or see billing", () => {
    expect(can(editorAcme, "approval.decide", A.acme).allowed).toBe(false);
    expect(can(editorAcme, "agent.authorize_autonomous", A.acme).allowed).toBe(false);
    expect(can(editorAcme, "billing.view", A.acme).allowed).toBe(false);
    expect(can(editorAcme, "content.edit", A.acme)).toMatchObject({ allowed: true, access: "A" });
  });
  it("viewers are read-only", () => {
    expect(can(viewerAcme, "analytics.view", A.acme).allowed).toBe(true);
    for (const cap of ["content.edit", "media.upload", "approval.submit", "agent.pause_resume"] as const) {
      expect(can(viewerAcme, cap, A.acme).allowed).toBe(false);
    }
  });
  it("agency admins cannot delete the organization; owners can", () => {
    expect(canInOrg(agencyAdminA, "org.delete_or_transfer", A.orgId).allowed).toBe(false);
    expect(canInOrg(agencyOwnerA, "org.delete_or_transfer", A.orgId).allowed).toBe(true);
  });
  it("only agencies create client workspaces and invite client approvers", () => {
    expect(canInOrg(agencyOwnerA, "workspace.create_client", A.orgId).allowed).toBe(true);
    expect(canInOrg(creator, "workspace.create_client", "org-c").allowed).toBe(false);
    expect(canInOrg(business, "workspace.create_client", "org-d").allowed).toBe(false);
    expect(canInOrg(business, "team.manage_client_approvers", "org-d").allowed).toBe(false);
    expect(canInOrg(business, "team.manage_staff", "org-d").allowed).toBe(true);
    expect(canInOrg(creator, "team.manage_staff", "org-c").allowed).toBe(false);
  });
  it("content owner and platform admin capabilities need their flag", () => {
    expect(canAsContentOwner(contentOwner, "creator.manage_terms")).toBe(true);
    expect(canAsContentOwner(creator, "creator.manage_terms")).toBe(false);
    expect(canAsPlatformAdmin(platformAdmin, "admin.support_access")).toBe(true);
    expect(canAsPlatformAdmin(agencyOwnerA, "admin.operate")).toBe(false);
    expect(canAsPlatformAdmin(platformAdmin, "billing.manage")).toBe(false);
  });
  it("top bar hides credits for Editor and Viewer, and Pause for Viewer (G-02)", () => {
    expect(topBarVisibility("ED")).toEqual({ credits: false, pause: true });
    expect(topBarVisibility("AV")).toEqual({ credits: false, pause: false });
    expect(topBarVisibility("WM")).toEqual({ credits: true, pause: true });
    expect(topBarVisibility("CR")).toEqual({ credits: true, pause: true });
  });
});

describe("surfaces", () => {
  it("lists only the surfaces a person can enter", () => {
    expect(surfacesFor(creator)).toEqual(["operator"]);
    expect(surfacesFor(agencyOwnerA)).toEqual(["operator", "agency"]);
    expect(surfacesFor(clientAcme)).toEqual(["client_portal"]);
    expect(surfacesFor(contentOwner)).toEqual(["creator_portal"]);
    expect(surfacesFor({ ...agencyOwnerA, isContentOwner: true })).toEqual(["operator", "agency", "creator_portal"]);
  });
  it("sends each person to the right home", () => {
    expect(homeSurface(creator)).toBe("operator");
    expect(homeSurface(clientAcme)).toBe("client_portal");
    expect(homeSurface(contentOwner)).toBe("creator_portal");
    expect(homeSurface({ ...base, userId: "new" })).toBe("onboarding");
  });
});

describe("validation", () => {
  it("uses the copy from the sign-up error board", () => {
    const r = signUpSchema.safeParse({ fullName: "Ada Okafor", email: "ada@", password: "short", acceptTerms: true });
    expect(r.success).toBe(false);
    const msgs = r.success ? [] : r.error.issues.map((i) => i.message);
    expect(msgs).toContain("Enter a full email address");
    expect(msgs).toContain("At least 10 characters");
  });
  it("normalises email and accepts a valid form", () => {
    const r = signUpSchema.parse({ fullName: " Ada Okafor ", email: " Ada@AdaStudio.ng ", password: "correct-horse-1", acceptTerms: true });
    expect(r.email).toBe("ada@adastudio.ng");
    expect(r.fullName).toBe("Ada Okafor");
  });
  it("slugifies workspace names", () => {
    expect(slugify("Ada Studio")).toBe("ada-studio");
    expect(slugify("Kemi’s Kitchen!")).toBe("kemi-s-kitchen");
    expect(slugify("Café Été")).toBe("cafe-ete");
    expect(slugify("!!!")).toBe("workspace");
  });
  it("blocks open redirects in the next parameter", () => {
    expect(safeNextPath("/w/ada/home")).toBe("/w/ada/home");
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil", "javascript:alert(1)", "", null, "/a?u=http://x"]) {
      expect(safeNextPath(bad as string | null, "/")).toBe("/");
    }
  });
});
