import Link from "next/link";

/** Links between the development-only design reference pages. */
const DEV_PAGES = [
  { href: "/dev/ui", label: "Foundations" },
  { href: "/dev/ui/illustrations", label: "Illustrations" },
  { href: "/dev/ui/command-center", label: "APP-01 states" },
  { href: "/dev/ui/strategist", label: "APP-02 gated" },
  { href: "/dev/ui/activity", label: "APP-03 states" },
  { href: "/dev/ui/agents", label: "APP-04 states" },
  { href: "/dev/ui/notifications", label: "NT-01 states" },
  { href: "/dev/ui/media", label: "CL-01 states" },
  { href: "/dev/ui/upload", label: "CL-02 states" },
  { href: "/dev/ui/studio", label: "CL-03 states" },
  { href: "/dev/ui/variants", label: "CL-04 states" },
  { href: "/dev/ui/exports", label: "CL-05 states" },
  { href: "/dev/ui/brand-kits", label: "ST-06 states" },
  { href: "/dev/ui/ai-settings", label: "ST-07 states" },
  { href: "/dev/ui/content", label: "CS-01 states" },
  { href: "/dev/ui/composer", label: "CS-02 states" },
  { href: "/dev/ui/ai-video", label: "CS-03 states" },
  { href: "/dev/ui/agent-detail", label: "APP-05 states" },
  { href: "/dev/ui/create-agent", label: "APP-06 steps" },
  { href: "/dev/ui/marketplace", label: "LI-01 states" },
  { href: "/dev/ui/source", label: "LI-02/03 states" },
  { href: "/dev/ui/my-licenses", label: "LI-04 states" },
  { href: "/dev/ui/creator", label: "LI-05 states" },
  { href: "/dev/ui/verification", label: "LI-06 states" },
  { href: "/dev/ui/creator-terms", label: "LI-07 states" },
  { href: "/dev/ui/payouts", label: "LI-10 gated" },
];

export function DevNav({ current }: { current: string }) {
  return (
    <nav aria-label="Design references" className="tab-scroll gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
      {DEV_PAGES.map((p) => (
        <Link key={p.href} href={p.href} aria-current={p.href === current ? "page" : undefined} className={`tap-target inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold no-underline ${p.href === current ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text"}`}>
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
