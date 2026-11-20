import { emptyContent } from "@nelio/domain";
import { photoSrc } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { Composer } from "@/components/content/composer";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";
import type { ComposerData } from "@/lib/content";

export const metadata: Metadata = { title: "CS-02 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };
const MEDIA = { renderId: "r1", title: "“5 budgeting myths” · Hook A", sub: "0:31 · 9:16 · own upload", posterUrl: photoSrc("p5"), hook: "5 budgeting myths", rights: "Own upload · rights r-881. Checked again right before publishing.", license: null };
const LICENSED = { renderId: "r2", title: "Chef Kemi · “Jollof for one”", sub: "0:31 · 9:16 · licensed: Chef Kemi", posterUrl: photoSrc("p1"), hook: "Jollof for one", rights: "Chef Kemi · free license · attribution required. Checked again right before publishing.", license: { creator: "Chef Kemi", attribution: "@chefkemi", platforms: ["instagram", "youtube", "tiktok"], ok: true, message: "" } };
const STOPPED = { ...LICENSED, license: { ...LICENSED.license, ok: false, message: "The owner revoked this licence. New clips, renders and posts are on hold." } };

/** Development-only preview of CS-02: ?state=filled|invalid|nodest|script|client|licensed|license-stopped. */
export default async function ComposerPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const content = emptyContent();
  content.instagram.caption = "Myth #1: you need to track every naira. Here’s what actually works. #budgeting #studentlife";
  content.youtube.title = state === "invalid" ? "5 budgeting myths every Nigerian student secretly believes in 2026, and the one rule that actually works now" : "5 budgeting myths, busted";
  content.script = "Hook: Stop budgeting like this.\n\nBeat 1: Nobody tracks every naira.\nBeat 2: Pay yourself first.\nBeat 3: Spend the rest guilt-free.\n\nClose: Try it for one month.";
  const d: ComposerData = {
    draftId: null, kind: state === "script" ? "script" : "clip_caption", content, platforms: ["instagram", "youtube"],
    media: state === "script" ? null : state === "licensed" ? LICENSED : state === "license-stopped" ? STOPPED : MEDIA, choices: [MEDIA, LICENSED],
    workspace: { name: "adastudio", initial: "A", client: state === "client" || state === "licensed" },
  };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="CS-02" preview>
      <Composer key={state} d={d} connected={state === "filled" || state === "invalid" || state === "client" || state === "licensed" || state === "license-stopped"} hrefs={{ content: "/dev/ui/content", connect: "#IN-01", exports: "/dev/ui/exports", draftBase: "/dev/ui/composer" }} />
    </AppShell>
  );
}
