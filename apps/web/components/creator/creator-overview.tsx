"use client";

import { termsSummary } from "@nelio/domain";
import { Banner, Button, ButtonLink, Card, CardHead, EmptyState, Field, KeyValues, Motion, PageHead, PersonAvatar, PlatformBadge, ResponsiveDialog, RowCard, RowCardList, RowCardSkeleton, Sk, StatTile, Ghost } from "@nelio/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { decideRequestAction } from "@/lib/actions/creator";
import type { OverviewData, RequestRow } from "@/lib/creator";
import { SAMPLE_OVERVIEW } from "./sample";

const fmt = (n: number) => n.toLocaleString("en-US");

export interface CreatorHrefs { verify: string; terms: string; usage: string; listing: string | null }

function Head({ name }: { name: string }) {
  return <PageHead eyebrow="Creator Portal" title={`Hi ${name}`} sub="Here’s how your content is being used." />;
}

function Stats({ s }: { s: OverviewData["stats"] }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Active licenses" value={fmt(s.active)} icon="shield" filled={s.active > 0 ? "lime" : undefined} />
      <StatTile label="Clips made" value={fmt(s.clips)} icon="scissors" />
      <StatTile label="Published uses" value={fmt(s.published)} icon="eye" />
      <StatTile label="Pending requests" value={fmt(s.pending)} icon="clock" filled={s.pending > 0 ? "yellow" : undefined} />
    </div>
  );
}

/** "Review": the request in full, with Approve and Decline (a bottom sheet on phones). */
function ReviewDialog({ r, open, onOpenChange, preview }: { r: RequestRow; open: boolean; onOpenChange: (o: boolean) => void; preview?: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const t = termsSummary(r.terms);
  const decide = (d: "approve" | "decline") => {
    if (preview) return;
    start(async () => {
      const res = await decideRequestAction(r.id, d, note);
      if (!res.ok) { toast.error("That didn’t work", { description: res.error }); return; }
      toast.success(d === "approve" ? `License approved for ${r.who}` : `Request from ${r.who} declined`);
      onOpenChange(false);
      router.refresh();
    });
  };
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={r.title} description="They’ll follow these terms. You can revoke the license later.">
      <div className="flex flex-col gap-3.5">
        <KeyValues pairs={[["Platforms", t.platforms], ["Commercial use", t.commercial], ["Attribution", t.attribution], ["Expires", t.expires], ["Scope", t.scope]]} />
        {r.note ? <Banner tone="neutral" title="Their note" text={r.note} /> : null}
        <Field label="Message (optional)" id={`decision-${r.id}`} hint="Shared with them" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button variant="secondary" onClick={() => decide("decline")} disabled={pending}>Decline</Button>
          <Button variant="primary" onClick={() => decide("approve")} loading={pending}>Approve license</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

function RequestItem({ r, preview }: { r: RequestRow; preview?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const decline = () => {
    if (preview) return;
    start(async () => {
      const res = await decideRequestAction(r.id, "decline");
      if (!res.ok) toast.error("That didn’t work", { description: res.error });
      else toast.info(`Request from ${r.who} declined`);
      router.refresh();
    });
  };
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <PersonAvatar initials={r.initials} color={r.color} size={40} />
      <div className="min-w-0 grow basis-[200px]">
        <div className="text-sm font-semibold text-text">{r.title}</div>
        <div className="text-[13px] text-muted">{r.sub}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button variant="ghost" size="sm" onClick={decline} loading={pending}>Decline</Button>
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>Review</Button>
      </div>
      <ReviewDialog r={r} open={open} onOpenChange={setOpen} preview={preview} />
    </li>
  );
}

/** LI-05 Creator portal overview: Filled, Empty, Loading and Unverified, desktop and mobile. */
export function CreatorOverview({ d, hrefs, preview }: { d: OverviewData; hrefs: CreatorHrefs; preview?: boolean }) {
  if (!d.verified) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <Head name={d.firstName} />
          <section className="flex flex-wrap items-center gap-6 rounded-[32px] bg-lime p-6 text-outline md:p-7">
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5">
              <h2 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-outline md:text-[36px]">First, verify your channel.</h2>
              <p className="m-0 text-[15px] leading-[1.55]">Sign in with YouTube or Instagram to prove the channel is yours. Takes a minute.</p>
              <ButtonLink href={hrefs.verify} variant="cta" arrow className="mt-1">Verify a channel</ButtonLink>
            </div>
          </section>
        </div>
      </Motion>
    );
  }
  const quiet = d.stats.active === 0 && d.requests.length === 0 && d.uses.length === 0;
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <Head name={d.firstName} />
        <Stats s={d.stats} />
      </div>
      {quiet ? (
        <EmptyState
          illustration="verify"
          title="No one has licensed your content yet"
          text={d.listing === "listed" ? "Your listing is live. Share it with creators who’d love to clip you." : "Publish your licensing terms to appear in the marketplace."}
          actions={
            <>
              {d.listing === "listed" && hrefs.listing ? <CopyListing href={hrefs.listing} preview={preview} /> : null}
              <ButtonLink href={hrefs.terms} variant={d.listing === "listed" ? "secondary" : "cta"} arrow={d.listing !== "listed"}>{d.listing === "listed" ? "Edit terms" : "Set your terms"}</ButtonLink>
            </>
          }
        />
      ) : (
        <>
          {d.requests.length ? (
            <Card>
              <CardHead title="Requests" />
              <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
                {d.requests.map((r) => <RequestItem key={r.id} r={r} preview={preview} />)}
              </ul>
            </Card>
          ) : null}
          <Card>
            <CardHead title="Recent uses" right={<Link href={hrefs.usage} className="tap-target text-[13.5px] font-bold text-accent-text no-underline">All usage →</Link>} />
            {d.uses.length ? (
              <RowCardList label="Recent uses">
                {d.uses.map((u) => (
                  <RowCard
                    key={u.id}
                    primary={u.who}
                    fields={[
                      { label: "From video", value: u.video },
                      { label: "Platform", value: u.platform ? <PlatformBadge platform={u.platform} size={26} /> : "—" },
                      { label: "When", value: u.when },
                    ]}
                  />
                ))}
              </RowCardList>
            ) : (
              <p className="m-0 text-sm text-muted">Clips made from your videos show up here once they’re scheduled or posted.</p>
            )}
          </Card>
        </>
      )}
    </Motion>
  );
}

function CopyListing({ href, preview }: { href: string; preview?: boolean }) {
  return (
    <Button
      variant="cta"
      arrow
      onClick={async () => {
        if (preview) return;
        try {
          await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
          toast.success("Listing link copied");
        } catch {
          toast.error("Couldn’t copy the link", { description: href });
        }
      }}
    >
      Copy listing link
    </Button>
  );
}

/** LI-05 Loading: the overview itself, ghosted. */
export function CreatorOverviewLoading() {
  return <Ghost><CreatorOverview d={SAMPLE_OVERVIEW} hrefs={{ verify: "#", terms: "#", usage: "#", listing: null }} preview /></Ghost>;
}
