import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAMPLE_EXTRAS } from "@/components/command-center/sample";
import { NotificationsLoading, NotificationsPage } from "@/components/notifications/notifications-page";
import { PREVIEW_NOTIFICATIONS } from "@/components/notifications/sample";
import { AppShell } from "@/components/shell/app-shell";
import type { ShellWorkspace } from "@/components/shell/types";
import { devUiEnabled } from "@/lib/dev-ui";

export const metadata: Metadata = { title: "NT-01 preview", robots: { index: false } };
const WS: ShellWorkspace = { workspaceId: "ws_ada", slug: "ada-studio", name: "Ada Studio", kind: "primary", accountType: "creator", orgSlug: "ada-studio", orgName: "Ada Studio" };

/** Development-only preview of NT-01: ?state=filled|empty|loading|push. The bell opens the Panel. */
export default async function NotificationsPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!devUiEnabled()) notFound();
  const state = (await searchParams).state ?? "filled";
  const d = state === "empty" ? { rows: [], unread: 0, total: 0 } : { rows: PREVIEW_NOTIFICATIONS, unread: 3, total: 6 };
  return (
    <AppShell current={WS} workspaces={[WS]} account={{ fullName: "Ada Okafor", email: "ada@adastudio.ng", surfaces: ["operator"] }} role="CR" extras={SAMPLE_EXTRAS} showUnbuilt active="NT-01" preview>
      {state === "loading" ? <NotificationsLoading /> : (
        <NotificationsPage d={d} filter="all" hrefs={{ filter: (f) => `/dev/ui/notifications?filter=${f}`, preferences: "#ST-04" }} preview={state === "push" ? "prompt" : "ask"} />
      )}
    </AppShell>
  );
}
