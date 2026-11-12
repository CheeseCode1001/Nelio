import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness check for uptime monitoring. Reports nothing about configuration or dependencies. */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
