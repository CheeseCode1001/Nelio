import { photoSrc } from "@nelio/ui";
import type { DraftRow } from "@/lib/content";

/** Sample drafts for the development preview and loading state of CS-01. */
export const SAMPLE_DRAFTS: DraftRow[] = [
  { id: "d1", title: "5 budgeting myths", kind: { label: "Clip + caption", tone: "lime" }, platforms: ["instagram", "youtube"], updated: "2h ago", href: "/dev/ui/composer", picture: photoSrc("p3"), text: "A fast carousel that busts common money myths, with a hook in the first 2 seconds.", stats: ["0:31", "9:16", "2 platforms"], tags: ["#budgeting", "#studentlife"], moreTags: 2 },
  { id: "d2", title: "Rent hacks thread", kind: { label: "Caption", tone: "ai" }, platforms: ["instagram"], updated: "5h ago", href: "/dev/ui/composer", picture: null, text: "Five rent tips as a caption thread, written for Instagram.", stats: ["86 words", "4 tags", "1 platform"], tags: ["#renting", "#lagos"], moreTags: 2 },
  { id: "d3", title: "Savings challenge script", kind: { label: "Script", tone: "blue" }, platforms: ["youtube"], updated: "Yesterday", href: "/dev/ui/composer?state=script", picture: null, text: "Hook, three beats and a close for a 60-second savings challenge.", stats: ["142 words", "0 tags", "1 platform"], tags: [], moreTags: 0 },
];
