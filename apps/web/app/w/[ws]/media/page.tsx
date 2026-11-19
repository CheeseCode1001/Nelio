import type { Metadata } from "next";
import { MediaLibrary } from "@/components/media/media-library";
import { requireWorkspace } from "@/lib/auth";
import { hrefForWorkspace } from "@/lib/hrefs";
import { MEDIA_FILTERS, loadMedia, type MediaFilter } from "@/lib/media";

export const metadata: Metadata = { title: "Clipping Studio" };

/** CL-01 Clipping Studio library. */
export default async function MediaRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<{ filter?: string }> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { workspace } = await requireWorkspace(ws);
  const href = hrefForWorkspace(workspace);
  const filter: MediaFilter = (MEDIA_FILTERS as readonly string[]).includes(sp.filter ?? "") ? (sp.filter as MediaFilter) : "all";
  const base = href("CL-01");
  const d = await loadMedia(workspace.workspaceId, filter, { studio: `/w/${workspace.slug}/studio`, upload: href("CL-02"), exports: href("CL-05") });
  return <MediaLibrary d={d} filter={filter} hrefs={{ filter: (f) => (f === "all" ? base : `${base}?filter=${f}`), upload: href("CL-02"), licensing: href("LI-01") }} />;
}
