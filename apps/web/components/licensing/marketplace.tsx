"use client";

import { Button, ButtonLink, Card, CardTitle, Checkbox, Chip, EmptyState, Field, Motion, PageHead, PlatformBadge, SelectField, Sk, cn } from "@nelio/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { MarketFilters, MarketplaceData, SourceCard } from "@/lib/licensing";

const LICENSE_CHIP = { free: { tone: "ok", label: "Free" }, private: { tone: "blue", label: "Private" }, paid: { tone: "neutral", label: "Paid · later" } } as const;
const THUMB = ["bg-orange", "bg-lime", "bg-cyan", "bg-yellow", "bg-pink", "bg-violet"];

function toQuery(f: MarketFilters): string {
  const q = new URLSearchParams();
  if (f.q) q.set("q", f.q);
  if (f.niche) q.set("niche", f.niche);
  if (f.type !== "all") q.set("type", f.type);
  if (f.platform) q.set("on", f.platform);
  if (f.commercial) q.set("commercial", "1");
  if (!f.verified) q.set("verified", "0");
  const s = q.toString();
  return s ? `?${s}` : "";
}

function Filters({ f, niches, onChange }: { f: MarketFilters; niches: string[]; onChange: (f: MarketFilters) => void }) {
  const [q, setQ] = useState(f.q);
  useEffect(() => {
    if (q === f.q) return;
    const t = setTimeout(() => onChange({ ...f, q }), 350);
    return () => clearTimeout(t);
  }, [q, f, onChange]);
  return (
    <Card className="lg:sticky lg:top-4 lg:self-start">
      <CardTitle>Filters</CardTitle>
      <Field label="Search" name="q" type="search" placeholder="Creators or topics" value={q} onChange={(e) => setQ(e.target.value)} />
      <SelectField label="Niche" name="niche" value={f.niche} onChange={(e) => onChange({ ...f, niche: e.target.value })} options={[{ value: "", label: "All niches" }, ...niches.map((n) => ({ value: n, label: n }))]} />
      <SelectField label="License type" name="type" value={f.type} onChange={(e) => onChange({ ...f, type: e.target.value as MarketFilters["type"] })} options={[{ value: "all", label: "Free + private" }, { value: "free", label: "Free" }, { value: "private", label: "Private" }]} />
      <SelectField label="Allowed on" name="on" value={f.platform} onChange={(e) => onChange({ ...f, platform: e.target.value as MarketFilters["platform"] })} options={[{ value: "", label: "Any platform" }, { value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "tiktok", label: "TikTok" }, { value: "facebook", label: "Facebook" }]} />
      <Checkbox label="Commercial use allowed" checked={f.commercial} onChange={(e) => onChange({ ...f, commercial: e.target.checked })} />
      <Checkbox label="Verified owners only" checked={f.verified} onChange={(e) => onChange({ ...f, verified: e.target.checked })} />
    </Card>
  );
}

function SourceTile({ c, href, i }: { c: SourceCard; href: string; i: number }) {
  const chip = LICENSE_CHIP[c.license];
  return (
    <Link href={href} aria-label={c.name} data-enter-item="" className={cn("relative block aspect-[4/5] w-full overflow-hidden rounded-[26px] border-2 border-outline text-white no-underline hover:text-white", THUMB[i % THUMB.length])}>
      {c.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
        <img src={c.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-top" />
      ) : null}
      <div className="absolute inset-x-3 top-3 z-[2] flex flex-wrap items-center gap-1.5">
        {c.verified ? <Chip tone="ok" icon="check">verified</Chip> : null}
        <span className="grow" />
        <Chip tone={chip.tone}>{chip.label}</Chip>
      </div>
      <div className="absolute inset-x-2.5 bottom-2.5 z-[2] flex flex-col gap-1.5 rounded-[18px] bg-[rgba(11,11,20,0.58)] px-3.5 py-3 backdrop-blur-[14px]">
        <div className="truncate font-display text-[17px] font-extrabold text-white">{c.name}</div>
        <div className="truncate text-[12.5px] font-semibold text-white/80">{c.sub}</div>
        <div className="flex items-center gap-1.5">
          {c.platforms.map((p) => <PlatformBadge key={p} platform={p} size={24} />)}
          <span className="grow" />
          <span className="text-[12.5px] font-bold text-white">{c.licensees} licensee{c.licensees === 1 ? "" : "s"}</span>
        </div>
      </div>
    </Link>
  );
}

/** LI-01 Licensing marketplace: Filled, Empty (no matches, or no listings yet) and Loading, desktop and mobile. */
export function Marketplace({ d, hrefs, preview }: { d: MarketplaceData; hrefs: { mine: string; sourceBase: string }; preview?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [f, setF] = useState(d.filters);
  const change = (next: MarketFilters) => {
    setF(next);
    if (preview) return;
    start(() => router.replace(`${pathname}${toQuery(next)}`, { scroll: false }));
  };
  const clear: MarketFilters = { q: "", niche: "", type: "all", platform: "", commercial: false, verified: true };
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead eyebrow="Grow" title="Licensing marketplace" sub="Content you can legally clip, from verified owners." actions={<ButtonLink href={hrefs.mine} variant="secondary">My licenses</ButtonLink>} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:[grid-template-columns:280px_minmax(0,1fr)]">
        <Filters key={JSON.stringify(d.filters)} f={f} niches={d.niches} onChange={change} />
        <div aria-busy={pending} className={cn("min-w-0 transition-opacity", pending && "opacity-60")}>
          {d.cards.length ? (
            <div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 xl:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
              {d.cards.map((c, i) => <SourceTile key={c.id} c={c} i={i} href={`${hrefs.sourceBase}/${c.id}`} />)}
            </div>
          ) : d.filtered ? (
            <EmptyState illustration="search" width={144} title="No sources match" text="No verified owners match all of these filters yet. Try fewer filters." actions={<Button variant="cta" arrow onClick={() => change(clear)}>Clear filters</Button>} />
          ) : (
            <EmptyState illustration="search" width={144} title="No sources yet" text="Verified creators appear here once they publish their licensing terms. Check back soon." />
          )}
        </div>
      </div>
    </Motion>
  );
}

export function MarketplaceLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={60} h={12} /><Sk w={300} h={36} /><Sk w={320} h={15} /></div>
      <div className="grid grid-cols-1 gap-3.5 lg:[grid-template-columns:280px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3.5 rounded-card border border-border bg-surface-1 p-[18px]">{Array.from({ length: 4 }, (_, i) => <div key={i} className="flex flex-col gap-1.5"><Sk w="40%" h={12} /><Sk w="100%" h={48} r={14} /></div>)}</div>
        <div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 xl:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[4/5] w-full animate-n-pulse rounded-[26px] bg-surface-3" style={{ animationDelay: `${i * 0.07}s` }} />)}
        </div>
      </div>
      <span className="sr-only" role="status">Loading the marketplace…</span>
    </div>
  );
}

