import { db } from "@nelio/db";
import { surfacesFor } from "@nelio/domain";
import type { ReactNode } from "react";
import { CreatorShell } from "@/components/creator/creator-shell";
import { homePathFor } from "@/lib/auth";
import { requireCreator } from "@/lib/creator";

/** Creator Portal (LI-05 to LI-10). Content owners only; no workspace, no subscription. */
export default async function CreatorLayout({ children }: { children: ReactNode }) {
  const c = await requireCreator();
  const unread = await db().notification.count({ where: { userId: c.session.user.id, readAt: null } });
  const operator = surfacesFor(c.session.actor).includes("operator") ? await homePathFor({ ...c.session, actor: { ...c.session.actor, isContentOwner: false } }) : null;
  return (
    <CreatorShell name={c.displayName} email={c.session.user.email} initials={c.initials} userId={c.session.user.id} unread={unread} operatorHref={operator && operator.startsWith("/w/") ? operator : null}>
      {children}
    </CreatorShell>
  );
}
