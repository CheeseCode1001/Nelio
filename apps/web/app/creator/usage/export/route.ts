import { db } from "@nelio/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadUsage } from "@/lib/creator";

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** LI-08 "Export CSV": the creator’s own usage only. */
export async function GET() {
  const session = await getSession();
  if (!session || session.user.needsMfa) return new NextResponse("Sign in first.", { status: 401 });
  const p = await db().creatorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true, displayName: true } });
  if (!p) return new NextResponse("Only content owners can export usage.", { status: 403 });
  const d = await loadUsage({ session, creatorId: p.id, displayName: p.displayName, firstName: p.displayName, initials: "" }, "all", 5000);
  const lines = [["Licensee", "Source video", "Clip", "Platform", "Status", "Updated"], ...d.rows.map((r) => [r.who, r.video, r.clip, r.platformName, r.status === "on_hold" ? `on hold${r.held ? ` (${r.held})` : ""}` : r.status, r.when])];
  const csv = lines.map((l) => l.map(cell).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${csv}\r\n`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="nelio-usage.csv"', "cache-control": "no-store" } });
}
