import { photoSrc } from "@nelio/ui";
import { termsSummary, type TermsSnapshot } from "@nelio/domain";
import type { MarketplaceData, MyLicensesData, SourceData } from "@/lib/licensing";

/** Sample data for the development previews of LI-01 to LI-04. */
export const FILTERS = { q: "", niche: "", type: "all" as const, platform: "" as const, commercial: false, verified: true };

export const SAMPLE_MARKET: MarketplaceData = {
  filters: FILTERS,
  filtered: false,
  niches: ["Food & cooking", "Fitness", "Personal finance", "Comedy", "Tech"],
  cards: [
    { id: "s1", name: "Chef Kemi", sub: "Nigerian home cooking · 120 videos", license: "free", platforms: ["ig", "yt", "tt"], licensees: 12, posterUrl: photoSrc("p1"), verified: true, line: "@chefkemi · Nigerian home cooking", videos: 120 },
    { id: "s2", name: "Lagos Money Talk", sub: "Personal finance interviews", license: "private", platforms: ["ig", "yt"], licensees: 4, posterUrl: photoSrc("p5"), verified: true, line: "@lagosmoneytalk · finance interviews", videos: 48 },
    { id: "s3", name: "FitWithTobi", sub: "Home workouts and nutrition", license: "free", platforms: ["ig", "yt"], licensees: 20, posterUrl: photoSrc("p7"), verified: true, line: "@fitwithtobi · home workouts", videos: 64 },
    { id: "s4", name: "Campus Comedy", sub: "Student sketches", license: "private", platforms: ["ig", "tt"], licensees: 7, posterUrl: photoSrc("p3"), verified: true, line: "@campuscomedy · student sketches", videos: 31 },
    { id: "s5", name: "Naija Tech Daily", sub: "Gadgets and apps", license: "free", platforms: ["yt"], licensees: 9, posterUrl: photoSrc("p2"), verified: true, line: "@naijatech · gadgets and apps", videos: 87 },
  ],
};

const terms: TermsSnapshot = { licenseType: "free", allowedUses: ["clips", "compilations"], platforms: ["instagram", "youtube", "tiktok"], commercial: false, attribution: "@chefkemi", edits: ["captions", "crops", "trims"], expiresMonths: 12, excludedCount: 2 };

export const SAMPLE_SOURCE: SourceData = {
  id: "s1", name: "Chef Kemi", initials: "CK", color: "#FF4FB8", verified: true,
  channelLine: "Verified YouTube channel · 120 videos in scope",
  listing: "listed",
  terms,
  summary: termsSummary(terms),
  platforms: ["ig", "yt", "tt"],
  feature: { title: "Chef Kemi · Ep 4 · Jollof for one", posterUrl: photoSrc("p4"), videoUrl: null },
  shorts: [
    { id: "v1", title: "Jollof for one", posterUrl: photoSrc("p1") },
    { id: "v2", title: "₦2,000 soup", posterUrl: photoSrc("p2") },
    { id: "v3", title: "5-min plantain", posterUrl: photoSrc("p3") },
    { id: "v4", title: "Suya at home", posterUrl: photoSrc("p5") },
    { id: "v5", title: "Pepper soup hack", posterUrl: photoSrc("p6") },
    { id: "v6", title: "Meal prep Sunday", posterUrl: photoSrc("p7") },
  ],
  mine: { kind: "none" },
  decided: null,
};

export const SAMPLE_MINE: MyLicensesData = {
  rows: [
    { id: "a1", creatorId: "s1", name: "Chef Kemi", initials: "CK", color: "#FF4FB8", type: "free", status: { kind: "expiring", endsInDays: 5 }, statusLabel: "ends in 5 days", expires: "30 Nov 2026", affected: "4 drafts", stored: "active" },
    { id: "a2", creatorId: "s3", name: "FitWithTobi", initials: "FT", color: "#B6F24A", type: "free", status: { kind: "active", endsInDays: 300 }, statusLabel: "active", expires: "20 Nov 2027", affected: "—", stored: "active" },
    { id: "a3", creatorId: "s4", name: "Campus Comedy", initials: "CC", color: "#59D8FF", type: "private", status: { kind: "revoked" }, statusLabel: "revoked", expires: "—", affected: "2 drafts · 1 scheduled · 1 published", stored: "revoked" },
  ],
  revoked: { name: "Campus Comedy", held: 1, flagged: 1 },
  expired: null,
  affected: [
    { id: "p1", title: "Campus sketch #3", state: "on_hold", line: "Scheduled · now on hold", flagged: false },
    { id: "p2", title: "Campus sketch #1", state: "published", line: "Published on Instagram · flagged for review", flagged: true },
  ],
};
