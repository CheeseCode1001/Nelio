import { NAV_GROUPS, hrefFor, isBuilt, screen, screenForPath, type NavItem, type ScreenId } from "@nelio/config";
import type { ShellProps } from "./types";

export interface ResolvedNavItem extends NavItem {
  href: string;
  active: boolean;
  badge: number | null;
}

/** The screen a /w/[ws]/... address belongs to, for the active navigation state. */
export function activeFromPath(pathname: string, wsSlug: string): ScreenId | undefined {
  const prefix = `/w/${wsSlug}`;
  if (!pathname.startsWith(prefix)) return undefined;
  return screenForPath("workspace", pathname.slice(prefix.length) || "/home")?.id as ScreenId | undefined;
}

/** Navigation for the current person: unbuilt screens only behind the flag, the Agency group only for agencies. */
export function resolveNav(p: Pick<ShellProps, "current" | "active" | "showUnbuilt" | "extras" | "preview">) {
  const ctx = { ws: p.current.slug, org: p.current.orgSlug };
  const href = (id: ScreenId) => (p.preview ? `#${id}` : hrefFor(id, ctx));
  const agency = p.current.accountType === "agency";
  return NAV_GROUPS.filter((g) => !g.agencyOnly || agency)
    .map((g) => ({
      label: g.label,
      items: g.items
        .filter((it) => p.showUnbuilt || isBuilt(screen(it.id)))
        .map<ResolvedNavItem>((it) => ({
          ...it,
          href: href(it.id),
          active: it.id === p.active,
          badge: it.id === "PB-04" ? p.extras.approvalsWaiting : null,
        })),
    }))
    .filter((g) => g.items.length > 0);
}

export function screenHref(p: Pick<ShellProps, "current" | "preview">, id: ScreenId): string {
  return p.preview ? `#${id}` : hrefFor(id, { ws: p.current.slug, org: p.current.orgSlug });
}
