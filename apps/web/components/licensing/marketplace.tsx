"use client";

import { Button, ButtonLink, Card, CardTitle, Checkbox, EmptyState, Field, Ghost, Icon, Motion, PageHead, SelectField, Sk, cn } from "@nelio/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { MarketFilters, MarketplaceData, SourceCard } from "@/lib/licensing";
import { SAMPLE_MARKET } from "./sample";

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

const PRICE = { free: "Free", private: "Private", paid: "Paid · later" } as const;

/** Source card (Cards board "F"): the picture fills the card; a blurred panel holds name, price and the stats. */
function SourceTile({ c, href, i }: { c: SourceCard; href: string; i: number }) {
  return (
    <Link href={href} aria-label={c.name} data-enter-item="" className={cn("relative box-border block aspect-[4/5] w-full overflow-hidden rounded-[28px] text-white no-underline shadow-card hover:text-white", THUMB[i % THUMB.length])}>
      {c.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage URL
        <img src={c.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover [object-position:center_25%]" />
      ) : null}
      {c.verified ? <span className="absolute left-3.5 top-3.5 whitespace-nowrap rounded-full bg-[rgba(11,11,20,0.5)] px-3 py-1.5 text-[12.5px] font-bold text-white backdrop-blur-[10px]">Verified owner</span> : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 bg-[rgba(11,11,20,0.52)] px-[18px] pb-4 pt-3 backdrop-blur-[18px]">
        <div className="flex items-baseline justify-between gap-2.5">
          <div className="min-w-0">
            <div className="truncate font-display text-[19px] font-extrabold leading-[1.2] tracking-[-0.01em] text-white">{c.name}</div>
            <div className="truncate text-[13px] text-white/70">{c.line ?? c.sub}</div>
          </div>
          <span className="whitespace-nowrap font-display text-[17px] font-extrabold text-white">{PRICE[c.license]}</span>
        </div>
        <div aria-hidden="true" className="border-t border-white/20" />
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex min-w-0 flex-[1_1_0] items-center justify-center gap-1.5 whitespace-nowrap text-[13px]"><Icon name="film" size={15} /><b className="font-extrabold">{c.videos ?? 0} video{c.videos === 1 ? "" : "s"}</b></span>
          <span aria-hidden="true" className="w-px flex-none self-stretch bg-white/25" />
          <span className="flex min-w-0 flex-[1_1_0] items-center justify-center gap-1.5 whitespace-nowrap text-[13px]"><Icon name="users" size={15} /><b className="font-extrabold">{c.licensees} licensee{c.licensees === 1 ? "" : "s"}</b></span>
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
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
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

/** LI-01 Loading: the marketplace itself, ghosted. */
export function MarketplaceLoading() {
  return <Ghost><Marketplace d={SAMPLE_MARKET} hrefs={{ mine: "#", sourceBase: "#" }} preview /></Ghost>;
}

