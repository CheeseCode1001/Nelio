import { isBuilt, screen, showUnbuiltInNav, type ScreenId } from "@nelio/config";
import { cn } from "@nelio/ui";
import Link from "next/link";

const TABS: { id: ScreenId; label: string; href: string }[] = [
  { id: "ST-01", label: "Profile", href: "/account/profile" },
  { id: "ST-02", label: "Security", href: "/account/security" },
  { id: "ST-03", label: "Appearance", href: "/account/appearance" },
  { id: "ST-04", label: "Notifications", href: "/account/notifications" },
  { id: "ST-09", label: "Privacy", href: "/account/privacy" },
];

/** Account settings tabs (generator `setnav`): pill tabs, active = ink. Links, so each tab has its own address. */
export function AccountTabs({ active }: { active: ScreenId }) {
  const show = showUnbuiltInNav();
  return (
    <nav aria-label="Account settings" className="flex w-fit max-w-full flex-wrap gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
      {TABS.filter((t) => show || isBuilt(screen(t.id))).map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={t.id === active ? "page" : undefined}
          className={cn("inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", t.id === active ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
