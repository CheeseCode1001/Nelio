import { db, listWorkspacesFor } from "@nelio/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/** GET /api/workspaces: the workspaces the signed-in person belongs to, and nothing else (APP-07). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (session.user.needsMfa) return NextResponse.json({ error: "mfa_required" }, { status: 403 });
  const list = await listWorkspacesFor(db(), session.actor);
  return NextResponse.json(
    { workspaces: list.map((w) => ({ id: w.workspaceId, slug: w.slug, name: w.name, kind: w.kind, organization: w.orgName })) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
