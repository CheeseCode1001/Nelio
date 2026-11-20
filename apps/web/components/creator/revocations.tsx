"use client";

import { Banner, Button, EmptyState, Motion, PageHead, PersonAvatar, ResponsiveDialog, RowCard, RowCardList, RowCardSkeleton, SelectField, Sk, Ghost, TEXTAREA_CLASS, LABEL_CLASS } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { revokeLicenseAction } from "@/lib/actions/creator";
import type { ActiveLicense, RevocationsData } from "@/lib/creator";
import { SAMPLE_REVOCATIONS } from "./sample";

const TEXTAREA = TEXTAREA_CLASS;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Impact({ title, text }: { title: string; text: string }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-card bg-surface-2 p-[18px]">
      <h3 className="m-0 text-[15px] font-bold text-text">{title}</h3>
      <p className="m-0 text-[13px] text-muted">{text}</p>
    </section>
  );
}

/** The board’s revoke dialog (a bottom sheet on phones), with a picker first when there is more than one licence. */
function RevokeDialog({ active, open, onOpenChange, onDone, preview, initial }: { active: ActiveLicense[]; open: boolean; onOpenChange: (o: boolean) => void; onDone: (r: { who: string; held: number; flagged: number }) => void; preview?: boolean; initial?: string }) {
  const [id, setId] = useState(initial ?? active[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const a = active.find((x) => x.id === id);
  if (!a) return null;
  const revoke = () => {
    setError(null);
    if (preview) { onDone({ who: a.who, held: a.scheduled, flagged: a.published }); return; }
    start(async () => {
      const r = await revokeLicenseAction(a.id, reason);
      if (!r.ok) { setError(r.error); return; }
      onDone(r);
    });
  };
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={`Revoke ${a.who}’s license?`} description={`${a.type === "private" ? "Private" : "Free"} license since ${a.since}`} maxWidth={580} hideTitle>
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-center gap-3">
          <PersonAvatar initials={a.who.split(/\s+/).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")} color="#59D8FF" size={52} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="m-0 font-display text-2xl font-extrabold leading-tight tracking-[-0.02em] text-text">Revoke {a.who}’s license?</h2>
            <span className="text-[12.5px] font-medium text-muted">{a.type === "private" ? "Private" : "Free"} license since {a.since}</span>
          </div>
        </div>
        {active.length > 1 ? <SelectField label="Which license?" name="revoke-which" value={id} onChange={(e) => setId(e.target.value)} options={active.map((x) => ({ value: x.id, label: `${x.who} · since ${x.since}` }))} /> : null}
        <Impact title="Stops right away" text={`New clips, renders${a.scheduled ? ` and ${plural(a.scheduled, "scheduled post", "scheduled posts")}` : ""}`} />
        <Impact title="Flagged for review" text={a.published ? `${plural(a.published, "published post", "published posts")}, for ${a.who} to review` : "Nothing published yet"} />
        <div className="flex flex-col gap-2">
          <label htmlFor="revoke-reason" className={LABEL_CLASS}>Reason (shared with {a.who})</label>
          <textarea id="revoke-reason" className={TEXTAREA} placeholder="Optional" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
        </div>
        {error ? <Banner tone="err" title="Not revoked" text={error} /> : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Keep license</Button>
          <Button variant="danger" loading={pending} onClick={revoke}>Revoke license</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

/** LI-09 Revoke a license: Filled (with the revoke dialog), Done and Empty, desktop and mobile. */
export function Revocations({ d, preview, initialOpen, initialDone }: { d: RevocationsData; preview?: boolean; initialOpen?: boolean; initialDone?: { who: string; held: number; flagged: number } }) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(initialOpen));
  const [done, setDone] = useState(initialDone ?? null);
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead title="Revocations" sub="Past revocations and their impact." actions={d.active.length ? <Button variant="secondary" icon="x" onClick={() => setOpen(true)}>Revoke a license</Button> : undefined} />
        {done ? <Banner tone="ok" title="License revoked" text={`${done.who} was notified.${done.flagged ? ` ${plural(done.flagged, "published post", "published posts")} flagged for their review.` : ""}${done.held ? ` ${plural(done.held, "scheduled post is", "scheduled posts are")} on hold.` : ""}`} /> : null}
      </div>
      {d.past.length ? (
        <RowCardList label="Past revocations">
          {d.past.map((p) => (
            <RowCard key={p.id} primary={p.who} fields={[{ label: "Revoked", value: p.when }, { label: "Held", value: String(p.held) }, { label: "Flagged", value: String(p.flagged) }]} />
          ))}
        </RowCardList>
      ) : (
        <EmptyState illustration="verify" title="You haven’t revoked any licenses" text="If you revoke one, new use stops at once and published posts get flagged for review." />
      )}
      {d.active.length ? (
        <RevokeDialog
          active={d.active}
          open={open}
          onOpenChange={setOpen}
          preview={preview}
          onDone={(r) => {
            setOpen(false);
            setDone(r);
            toast.success("License revoked", { description: `${r.who} was notified.` });
            if (!preview) router.refresh();
          }}
        />
      ) : null}
    </Motion>
  );
}

/** LI-09 Loading: the revocations page itself, ghosted. */
export function RevocationsLoading() {
  return <Ghost><Revocations d={SAMPLE_REVOCATIONS} preview /></Ghost>;
}
