"use client";

import { ButtonLink, Icon, IconButton, Logo, PlatformBadge, ResponsiveDialog, cn } from "@nelio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { label: "Product", href: "/product" },
  { label: "Use cases", href: "/use-cases/agencies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Licensing", href: "/licensing" },
  { label: "FAQ", href: "/faq" },
];

/** Public header (generator `pubnav` / `mpubnav`). Below 768 px: logo, Start free, menu button opening a bottom sheet. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const isActive = (href: string) => path === href || (href.startsWith("/use-cases") && path.startsWith("/use-cases"));
  return (
    <>
      <header className="sticky top-0 z-[5] flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-3 md:static md:flex-wrap md:gap-6 md:px-12 md:py-[18px]">
        <Link href="/" aria-label="Nelio home" className="tap-target no-underline">
          <Logo size={22} className="md:hidden" />
          <Logo size={26} className="hidden md:inline-flex" />
        </Link>
        <nav aria-label="Site" className="ml-6 hidden flex-wrap gap-[26px] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className="tap-target text-[15px] font-semibold text-text no-underline hover:text-accent-text aria-[current=page]:text-accent-text">
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="grow" />
        <ButtonLink href="/login" variant="ghost" className="hidden md:inline-flex">Log in</ButtonLink>
        <ButtonLink href="/signup" variant="cta" arrow className="hidden md:inline-flex">Start free</ButtonLink>
        <ButtonLink href="/signup" variant="cta" size="sm" className="md:hidden">Start free</ButtonLink>
        <IconButton icon="menu" label="Open menu" onClick={() => setOpen(true)} aria-haspopup="dialog" className="md:hidden" />
      </header>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Site menu" description="Site navigation" hideTitle sheetGap="tight">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <span className="grow" />
          <IconButton icon="x" label="Close menu" onClick={() => setOpen(false)} />
        </div>
        <nav aria-label="Site menu" className="flex flex-col gap-2">
          {[...NAV, { label: "Status", href: "/status" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-[73px] items-center justify-between border-b border-border px-1 py-3.5 font-display text-[22px] font-extrabold text-text no-underline hover:text-text">
              {n.label}
              <Icon name="chev" size={20} />
            </Link>
          ))}
        </nav>
        <div className="mt-3 flex flex-col gap-2.5">
          <ButtonLink href="/signup" variant="cta" size="lg" arrow full>Start free</ButtonLink>
          <ButtonLink href="/login" variant="secondary" size="lg" full>Log in</ButtonLink>
        </div>
      </ResponsiveDialog>
    </>
  );
}

/** Footer links. `desktop` items appear only from 768 px: the mobile board lists fewer. */
const FOOTER: { title: string; links: { label: string; mobileLabel?: string; href: string; desktop?: boolean }[] }[] = [
  { title: "Product", links: [{ label: "Features", href: "/product" }, { label: "Pricing", href: "/pricing" }, { label: "Status", href: "/status" }] },
  // Creators and Businesses have no approved copy yet (B-16); only Agencies is live.
  { title: "Use cases", links: [{ label: "Agencies", href: "/use-cases/agencies" }] },
  { title: "Company", links: [{ label: "Licensing", href: "/licensing" }, { label: "Creator partners", href: "/creators/join", desktop: true }, { label: "FAQ", href: "/faq" }] },
  { title: "Legal", links: [{ label: "Terms", href: "/legal/terms" }, { label: "Privacy", href: "/legal/privacy" }, { label: "Acceptable use", href: "/legal/acceptable-use", desktop: true }, { label: "Takedown requests", mobileLabel: "Takedowns", href: "/legal/takedown" }] },
];

/** Public footer (generator `pubfoot` on desktop, `mpubfoot` below 768 px) with the large flat "nelio" wordmark. */
export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-6 overflow-hidden border-t border-border bg-surface-1 px-4 pt-10 md:block md:px-12 md:pt-14">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 md:flex-row md:flex-wrap md:gap-12">
        <div className="flex flex-col gap-6 md:flex-[1_1_260px] md:gap-3">
          <Logo size={24} className="md:hidden" />
          <Logo size={26} className="hidden md:inline-flex" />
          <p className="m-0 text-sm leading-[1.55] text-muted">Your AI content team, under your control.</p>
          <div className="hidden gap-2 md:flex">
            <PlatformBadge platform="ig" size={30} />
            <PlatformBadge platform="yt" size={30} />
            <PlatformBadge platform="tt" size={30} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[22px] md:contents">
          {FOOTER.map((c) => (
            <div key={c.title} className="flex flex-col gap-2 md:min-w-[140px] md:gap-2.5">
              <span className="text-sm font-extrabold text-text">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href} className={cn("min-h-7 items-center text-sm text-muted no-underline hover:text-text md:min-h-0", l.desktop ? "hidden md:flex" : "flex")}>
                  {l.mobileLabel ? (
                    <>
                      <span className="md:hidden">{l.mobileLabel}</span>
                      <span className="hidden md:inline">{l.label}</span>
                    </>
                  ) : (
                    l.label
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="text-[12.5px] text-muted md:hidden">© 2026 Nelio. Made in Lagos. Prices in USD, pay in NGN.</span>
      <div className="mx-auto mt-8 hidden max-w-[1200px] justify-between text-[13px] text-muted md:flex">
        <span>© 2026 Nelio. Made in Lagos.</span>
        <span>Prices in USD · pay in NGN at checkout</span>
      </div>
      <div aria-hidden="true" className="select-none overflow-hidden whitespace-nowrap text-center font-display text-[72px] font-extrabold leading-[0.8] tracking-[-0.06em] text-surface-3 md:mt-6 md:text-[300px]">nelio</div>
    </footer>
  );
}
