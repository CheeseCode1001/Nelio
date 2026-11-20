import { ButtonLink, Chip, EmptyState, Motion, PageHead, PlatformBadge, RowCard, RowCardList, RowCardSkeleton, Sk, cn } from "@nelio/ui";
import Link from "next/link";
import type { UsageRow, UsageTab } from "@/lib/creator";

const TABS: { id: UsageTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "scheduled", label: "Scheduled" },
  { id: "on_hold", label: "On hold" },
];

function Status({ r }: { r: UsageRow }) {
  if (r.status === "published") return <Chip tone="ok">published</Chip>;
  if (r.status === "scheduled") return <Chip tone="blue">scheduled</Chip>;
  return <Chip tone="warn">on hold{r.held ? ` · ${r.held}` : ""}</Chip>;
}

/** LI-08 Usage audit: Filled, Empty and Loading, with status tabs and a CSV export. */
export function Usage({ d, hrefs }: { d: { rows: UsageRow[]; tab: UsageTab; any: boolean }; hrefs: { tab: (t: UsageTab) => string; csv: string } }) {
  const head = <PageHead title="Where your content is used" actions={<ButtonLink href={d.any ? hrefs.csv : undefined} aria-disabled={!d.any} variant="secondary" icon="download" download={d.any ? "nelio-usage.csv" : undefined} className={cn(!d.any && "pointer-events-none opacity-60")}>Export CSV</ButtonLink>} />;
  if (!d.any) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          {head}
          <EmptyState illustration="search" title="No uses yet" text="When licensees publish clips of your videos, every use shows up here." />
        </div>
      </Motion>
    );
  }
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        {head}
        <nav aria-label="Filter uses" className="tab-scroll gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
          {TABS.map((t) => (
            <Link key={t.id} href={hrefs.tab(t.id)} aria-current={d.tab === t.id ? "page" : undefined} className={cn("tap-target inline-flex min-h-10 flex-none items-center whitespace-nowrap rounded-full px-4 text-sm font-bold no-underline", d.tab === t.id ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {d.rows.length ? (
        <RowCardList label="Uses">
          {d.rows.map((r) => (
            <RowCard
              key={r.id}
              primary={r.who}
              fields={[
                { label: "Source video", value: r.video },
                { label: "Clip", value: r.clip },
                { label: "Platform", value: r.platform ? <PlatformBadge platform={r.platform} size={26} /> : "—" },
                { label: "Status", value: <Status r={r} /> },
              ]}
            />
          ))}
        </RowCardList>
      ) : (
        <p className="m-0 rounded-card border border-border bg-surface-1 px-6 py-10 text-center text-sm text-muted shadow-card">Nothing {TABS.find((t) => t.id === d.tab)!.label.toLowerCase()} right now.</p>
      )}
    </Motion>
  );
}

export function UsageLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={320} h={36} /></div>
      <Sk w={330} h={48} r={24} />
      <RowCardSkeleton rows={4} fields={4} />
      <span className="sr-only" role="status">Loading usage…</span>
    </div>
  );
}
