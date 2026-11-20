import type { CreatorShellProps } from "./creator-shell";
import type { ChannelRow, OverviewData, RevocationsData, TermsData, UsageRow } from "@/lib/creator";

/** Sample data for the development previews of the Creator Portal (boards LI-05 to LI-10). */
export const SAMPLE_CREATOR: CreatorShellProps = { name: "Chef Kemi", email: "kemi@chefkemi.ng", initials: "CK", userId: null, unread: 2, operatorHref: null, preview: true };

const kemiTerms = { licenseType: "private" as const, allowedUses: ["clips" as const], platforms: ["instagram" as const], commercial: true, attribution: "@chefkemi", edits: ["captions" as const, "crops" as const, "trims" as const], expiresMonths: 6, excludedCount: 2 };

export const SAMPLE_OVERVIEW: OverviewData = {
  firstName: "Kemi",
  verified: true,
  listing: "listed",
  stats: { active: 12, clips: 148, published: 131, pending: 1 },
  requests: [{ id: "q1", who: "Lagos Food Agency", initials: "LF", color: "#FF7A2F", title: "Lagos Food Agency wants a private license", sub: "Instagram · commercial use · 6 months", note: "We run food reels for three restaurants in Lekki.", terms: kemiTerms }],
  uses: [
    { id: "u1", who: "Ada Studio", video: "Ep 4 · Jollof for one", platform: "ig", when: "Today" },
    { id: "u2", who: "Naija Eats", video: "Ep 9 · Pepper soup", platform: "yt", when: "Yesterday" },
    { id: "u3", who: "Campus Hub", video: "Ep 2 · Plantain", platform: "ig", when: "3 days ago" },
  ],
};

export const SAMPLE_TERMS: TermsData = {
  verified: true,
  listing: "listed",
  published: true,
  storageReady: true,
  terms: { licenseType: "free", allowedUses: ["clips", "compilations"], platforms: ["instagram", "youtube", "tiktok"], commercial: false, attribution: "@chefkemi", edits: ["captions", "crops", "trims"], expiresMonths: 12, excludedCount: 2, hasThirdParty: true, thirdPartyNote: "Ep 7 (licensed music), Ep 12 (guest footage)" },
  videos: [
    { id: "v1", title: "Ep 4 · Jollof for one", meta: "12:40 · 486 MB", status: "ready", excluded: false, excludeReason: null },
    { id: "v2", title: "Ep 7 · Party jollof", meta: "18:02 · 702 MB", status: "ready", excluded: true, excludeReason: "Licensed music" },
    { id: "v3", title: "Ep 9 · Pepper soup", meta: "9:15 · 351 MB", status: "ready", excluded: false, excludeReason: null },
    { id: "v4", title: "Ep 12 · Market day", meta: "21:30 · 840 MB", status: "ready", excluded: true, excludeReason: "Guest footage" },
  ],
};

export const SAMPLE_USAGE: UsageRow[] = [
  { id: "u1", who: "Ada Studio", video: "Ep 4", clip: "Jollof for one", platform: "ig", platformName: "Instagram", status: "published", held: null, when: "18 Nov 2026" },
  { id: "u2", who: "Ada Studio", video: "Ep 4", clip: "Plantain hack", platform: "yt", platformName: "YouTube", status: "scheduled", held: null, when: "19 Nov 2026" },
  { id: "u3", who: "Campus Hub", video: "Ep 2", clip: "Pepper soup", platform: "ig", platformName: "Instagram", status: "on_hold", held: "revoked", when: "20 Nov 2026" },
  { id: "u4", who: "Naija Eats", video: "Ep 9", clip: "Pepper soup", platform: "yt", platformName: "YouTube", status: "published", held: null, when: "17 Nov 2026" },
];

export const SAMPLE_REVOCATIONS: RevocationsData = {
  past: [{ id: "r1", who: "Old Blog Co", when: "2 Oct 2026", held: 3, flagged: 0 }],
  active: [
    { id: "a1", who: "Campus Hub", type: "private", since: "3 Sep 2026", scheduled: 1, published: 1 },
    { id: "a2", who: "Ada Studio", type: "free", since: "1 Oct 2026", scheduled: 2, published: 4 },
  ],
};

const VERIFIED: ChannelRow = { id: "c1", platform: "youtube", title: "YouTube · Chef Kemi", sub: "Verified 2 Nov 2026", status: "verified", retry: null, code: null };
const PENDING: ChannelRow = { id: "c2", platform: "instagram", title: "Instagram · @chefkemi", sub: "Add nelio-4F2K9A to your bio. We’ll check within 1–2 working days.", status: "pending", retry: null, code: "nelio-4F2K9A" };
const FAILED: ChannelRow = { id: "c3", platform: "youtube", title: "YouTube · Kemi Vlogs", sub: "That sign-in didn’t own this channel. Sign in with the owner account.", status: "failed", retry: "youtube", code: null };
export const SAMPLE_CHANNELS = [VERIFIED, PENDING, FAILED] as const;
