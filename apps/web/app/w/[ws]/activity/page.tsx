import { can } from "@nelio/domain";
import type { Metadata } from "next";
import { ActivityPage } from "@/components/activity/activity-page";
import { PauseAllButton } from "@/components/shell/pause-all-dialog";
import { ACTIVITY_FILTERS, loadActivity, type ActivityFilter } from "@/lib/activity";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";

export const metadata: Metadata = { title: "Activity" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** APP-03 Activity Center. Live through the workspace's private realtime channel. */
export default async function ActivityRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<{ filter?: string; run?: string }> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { session, workspace } = await requireWorkspace(ws);
  const filter: ActivityFilter = (ACTIVITY_FILTERS as readonly string[]).includes(sp.filter ?? "") ? (sp.filter as ActivityFilter) : "all";
  const run = sp.run && UUID.test(sp.run) ? sp.run : null;
  const d = await loadActivity(workspace.workspaceId, run);
  const href = hrefForWorkspace(workspace);
  const base = href("APP-03");
  const q = (f: ActivityFilter, r?: string) => {
    const s = new URLSearchParams();
    if (f !== "all") s.set("filter", f);
    if (r) s.set("run", r);
    const str = s.toString();
    return str ? `${base}?${str}` : base;
  };
  const canPause = can(session.actor, "workspace.emergency_pause", workspace).allowed;
  return (
    <ActivityPage
      d={d}
      filter={filter}
      live={{ topic: `ws:${workspace.workspaceId}`, slug: workspace.slug }}
      hrefs={{ filter: (f) => q(f), run: (id, f) => q(f, id), newAgent: d.hasAgents ? href("APP-04") : href("APP-06"), upload: href("CL-02") }}
      headerAction={canPause ? <PauseAllButton slug={workspace.slug} workspaceName={workspace.name} paused={d.workspacePaused} /> : undefined}
    />
  );
}
