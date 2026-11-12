import type { Metadata } from "next";
import { NotBuiltYet } from "@/components/system/not-built";

export const metadata: Metadata = { title: "Command Center" };

/** APP-01 Command Center is a Milestone 2 screen. Access to the workspace is enforced by the layout. */
export default function HomePage() {
  return <NotBuiltYet title="Command Center" screen="APP-01 Command Center" milestone={2} />;
}
