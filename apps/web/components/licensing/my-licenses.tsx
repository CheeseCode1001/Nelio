"use client";

import { Banner, Button, ButtonLink, Card, CardHead, Chip, EmptyState, Icon, Motion, PageHead, PersonAvatar, RowCard, RowCardList, RowCardSkeleton, Sk, Ghost } from "@nelio/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { confirmTakedownAction, removeFromScheduleAction } from "@/lib/actions/licensing";
import type { AffectedPost, LicenseRow, MyLicensesData } from "@/lib/licensing";
import { ResponsiveDialog } from "@nelio/ui";
import { SAMPLE_MINE } from "./sample";

const STEPS = [
  "Open the post on the platform where it’s published.",
  "Delete or archive it (on Instagram: ··· › Delete; on YouTube Shorts: Studio › Content › Delete forever).",
  "Remove it anywhere else you shared it, such as stories, highlights or playlists.",
];

/** “Remove from schedule” for held posts, and the takedown checklist for flagged published posts. */
function AffectedActions({ a, slug }: { a: AffectedPost; slug?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    if (!slug) { setOpen(false); return; }
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error("That didn’t work", { description: "error" in r ? r.error : undefined });
      else toast.success(done);
      setOpen(false);
      router.refresh();
    });
  };
  if (!a.flagged) return <Button variant="secondary" size="sm" loading={pending} onClick={() => run(() => removeFromScheduleAction(slug!, a.id), "Moved back to drafts")}>Remove from schedule</Button>;
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Open takedown checklist</Button>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Take down this post" description={a.title} maxWidth={520}>
        <div className="flex flex-col gap-3.5">
          <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-sm text-text">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="m-0 text-[13px] text-muted">Nelio can’t remove posts from platforms for you yet. Confirm once it’s down so the owner’s usage audit stays accurate.</p>
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setOpen(false)}>Not yet</Button>
            <Button variant="primary" loading={pending} onClick={() => run(() => confirmTakedownAction(slug!, a.id), "Marked as taken down")}>It’s taken down</Button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}

const TYPE_CHIP = { free: { tone: "ok", label: "Free" }, private: { tone: "blue", label: "Private" }, paid: { tone: "neutral", label: "Paid" } } as const;
const STATUS_TONE: Record<LicenseRow["status"]["kind"], "blue" | "warn" | "err" | "neutral" | "ok"> = { active: "blue", expiring: "warn", expired: "err", revoked: "err", suspended: "warn", requested: "neutral", declined: "neutral", canceled: "neutral" };

export interface MyLicensesHrefs { marketplace: string; sourceBase: string; affected: string }

/**
 * LI-04 My licenses: Filled (with the revocation banner and affected content), Empty, Loading and Expired.
 * "Remove from schedule" and the takedown checklist act on held posts (rights recheck, slice 6).
 */
export function MyLicenses({ d, hrefs, slug }: { d: MyLicensesData; hrefs: MyLicensesHrefs; slug?: string }) {
  const head = <PageHead eyebrow="Licensing" title="My licenses" actions={<ButtonLink href={hrefs.marketplace} variant="secondary">Browse marketplace</ButtonLink>} />;
  if (!d.rows.length) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          {head}
          <EmptyState illustration="licenses" title="No licenses yet" text="Licenses let you clip other creators’ videos legally. Browse verified owners in the marketplace." actions={<ButtonLink href={hrefs.marketplace} variant="cta" arrow>Browse marketplace</ButtonLink>} />
        </div>
      </Motion>
    );
  }
  const r = d.revoked;
  const revokedText = r ? [r.held || r.flagged ? "New clips and scheduled posts using it are on hold." : "New clips and renders from this creator are stopped.", r.flagged ? `${r.flagged} published post${r.flagged === 1 ? " needs" : "s need"} review.` : null].filter(Boolean).join(" ") : "";
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        {head}
        {r ? <Banner tone="err" title={`${r.name} revoked your license`} text={revokedText} action={d.affected.length ? <ButtonLink href={hrefs.affected} variant="secondary" size="sm">Review affected content</ButtonLink> : undefined} /> : null}
        {!r && d.expired ? <Banner tone="warn" title={`${d.expired.name}’s license expired`} text={`New clips and renders from ${d.expired.name} are blocked.${d.expired.drafts ? ` ${d.expired.drafts} draft${d.expired.drafts === 1 ? " is" : "s are"} flagged.` : ""}`} action={<ButtonLink href={`${hrefs.sourceBase}/${d.expired.creatorId}`} variant="secondary" size="sm">Renew</ButtonLink>} /> : null}
      </div>
      <RowCardList label="My licenses">
        {d.rows.map((l) => (
          <RowCard
            key={l.id}
            dim={l.status.kind === "revoked" || l.status.kind === "expired"}
            primary={
              <Link href={`${hrefs.sourceBase}/${l.creatorId}`} className="tap-target flex items-center gap-2.5 text-text no-underline hover:text-text">
                <PersonAvatar initials={l.initials} color={l.color} size={32} />
                <span className="min-w-0 truncate">{l.name}</span>
              </Link>
            }
            fields={[
              { label: "Type", value: <Chip tone={TYPE_CHIP[l.type].tone}>{TYPE_CHIP[l.type].label}</Chip> },
              { label: "Status", value: <Chip tone={STATUS_TONE[l.status.kind]}>{l.statusLabel}</Chip>, headline: true },
              { label: "Expires", value: l.expires },
              { label: "Affected content", value: l.affected },
            ]}
          />
        ))}
      </RowCardList>
      {d.affected.length ? (
        <Card>
          <div id="affected" className="scroll-mt-4"><CardHead title="Affected by the revocation" /></div>
          <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
            {d.affected.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                <span className="inline-flex size-[38px] flex-none items-center justify-center rounded-[14px] bg-err-tint text-err-text"><Icon name={a.flagged ? "flag" : "pause"} size={18} /></span>
                <div className="min-w-0 grow basis-[180px]">
                  <div className="truncate text-sm font-semibold text-text">{a.title}</div>
                  <div className="text-[13px] text-muted">{a.line}</div>
                </div>
                <AffectedActions a={a} slug={slug} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Motion>
  );
}

/** LI-04 Loading: the licences page itself, ghosted. */
export function MyLicensesLoading() {
  return <Ghost><MyLicenses d={SAMPLE_MINE} hrefs={{ marketplace: "#", sourceBase: "#", affected: "#" }} /></Ghost>;
}
