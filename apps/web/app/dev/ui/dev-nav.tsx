import Link from "next/link";

/** Links between the development-only design reference pages. */
const DEV_PAGES = [
  { href: "/dev/ui", label: "Foundations" },
  { href: "/dev/ui/illustrations", label: "Illustrations" },
  { href: "/dev/ui/command-center", label: "APP-01 states" },
  { href: "/dev/ui/activity", label: "APP-03 states" },
  { href: "/dev/ui/agents", label: "APP-04 states" },
  { href: "/dev/ui/notifications", label: "NT-01 states" },
  { href: "/dev/ui/agent-detail", label: "APP-05 states" },
  { href: "/dev/ui/create-agent", label: "APP-06 steps" },
];

export function DevNav({ current }: { current: string }) {
  return (
    <nav aria-label="Design references" className="flex flex-wrap gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
      {DEV_PAGES.map((p) => (
        <Link key={p.href} href={p.href} aria-current={p.href === current ? "page" : undefined} className={`tap-target inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold no-underline ${p.href === current ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text"}`}>
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
