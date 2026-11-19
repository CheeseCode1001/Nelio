import { db } from "@nelio/db";
import { can, isCaptionStyle } from "@nelio/domain";
import type { Metadata } from "next";
import { BrandKitsPage } from "@/components/settings/brand-kits";
import { requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "Brand kits" };

/** ST-06 Brand kits. */
export default async function BrandKitsRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<{ kit?: string }> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { session, workspace } = await requireWorkspace(ws);
  const rows = await db().brandKit.findMany({ where: { workspaceId: workspace.workspaceId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  const kits = rows.map((k) => ({ id: k.id, name: k.name, colours: k.colours.length ? k.colours : [k.primary, k.accent], captionFont: k.captionFont, captionStyle: isCaptionStyle(k.captionStyle) ? k.captionStyle : "bold_pop" as const, voice: k.voice, isDefault: k.isDefault }));
  const d = can(session.actor, "content.edit", workspace);
  const canEdit = d.allowed && d.access !== "R" && d.access !== "V";
  const current = kits.find((k) => k.id === sp.kit)?.id ?? kits[0]?.id ?? null;
  const base = `/w/${workspace.slug}/settings/brand-kits`;
  return <BrandKitsPage key={`${current}:${rows.find((k) => k.id === current)?.updatedAt.getTime() ?? 0}`} slug={canEdit ? workspace.slug : undefined} kits={kits} current={current} kitBase={base} />;
}
