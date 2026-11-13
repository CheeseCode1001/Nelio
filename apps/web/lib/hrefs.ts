import { hrefFor, type ScreenId } from "@nelio/config";

/** Link builder for screens of one workspace (and its organization). */
export const hrefForWorkspace = (w: { slug: string; orgSlug: string }) => (id: ScreenId) => hrefFor(id, { ws: w.slug, org: w.orgSlug });
