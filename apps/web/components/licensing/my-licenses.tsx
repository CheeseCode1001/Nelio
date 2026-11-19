"use client";

import { Banner, ButtonLink, Card, CardHead, Chip, EmptyState, Icon, Motion, PageHead, PersonAvatar, RowCard, RowCardList, RowCardSkeleton, Sk } from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LicenseRow, MyLicensesData } from "@/lib/licensing";

const TYPE_CHIP = { free: { tone: "ok", label: "Free" }, private: { tone: "blue", label: "Private" }, paid: { tone: "neutral", label: "Paid" } } as const;
const STATUS_TONE: Record<LicenseRow["status"]["kind"], "blue" | "warn" | "err" | "neutral" | "ok"> = { active: "blue", expiring: "warn", expired: "err", revoked: "err", suspended: "warn", requested: "neutral", declined: "neutral", canceled: "neutral" };

export interface MyLicensesHrefs { marketplace: string; sourceBase: string; affected: string }

/**
 * LI-04 My licenses: Filled (with the revocation banner and affected content), Empty, Loading and Expired.
 * "Remove from schedule" and the takedown checklist act on held posts (rights recheck, slice 6).
 */
export function MyLicenses({ d, hrefs, affectedActions }: { d: MyLicensesData; hrefs: MyLicensesHrefs; affectedActions?: (id: string) => ReactNode }) {
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
              { label: "Status", value: <Chip tone={STATUS_TONE[l.status.kind]}>{l.statusLabel}</Chip> },
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
                {affectedActions?.(a.id)}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Motion>
  );
}

export function MyLicensesLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={70} h={12} /><Sk w={220} h={36} /></div>
      <RowCardSkeleton rows={3} fields={4} />
      <span className="sr-only" role="status">Loading your licenses…</span>
    </div>
  );
}
