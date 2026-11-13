import type { Metadata } from "next";
import { StrategistPage } from "@/components/strategist/strategist-page";
import { requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "Strategist" };

/** APP-02 Strategist. Shows the honest "needs setup" state until a production Nelio AI key is configured. */
export default async function StrategistRoute({ params }: { params: Promise<{ ws: string }> }) {
  const { ws } = await params;
  await requireWorkspace(ws);
  // The conversation itself ships with the Nelio AI service; until then the page stays gated even with a key.
  const available = false;
  return <StrategistPage available={available} />;
}
