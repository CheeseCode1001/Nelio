"use client";

import { ButtonLink, IconButton, Logo, PlatformBadge, ResponsiveDialog, cn } from "@nelio/ui";
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
        <Link href="/" aria-label="Nelio home" className="no-underline">
          <Logo size={22} className="md:hidden" />
          <Logo size={26} className="hidden md:inline-flex" />
        </Link>
        <nav aria-label="Site" className="ml-6 hidden flex-wrap gap-[26px] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className="text-[15px] font-semibold text-text no-underline hover:text-accent-text aria-[current=page]:text-accent-text">
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
      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Menu" description="Site navigation">
        <nav aria-label="Site menu" className="flex flex-col">
          {[...NAV, { label: "Status", href: "/status" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-border font-display text-lg font-extrabold text-text no-underline">
              {n.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/signup" variant="cta" size="lg" arrow full>Start free</ButtonLink>
        <ButtonLink href="/login" variant="secondary" size="lg" full>Log in</ButtonLink>
      </ResponsiveDialog>
    </>
  );
}

const FOOTER: { title: string; links: { label: string; href: string; mobile?: boolean }[] }[] = [
  { title: "Product", links: [{ label: "Features", href: "/product" }, { label: "Pricing", href: "/pricing" }, { label: "Status", href: "/status" }] },
  { title: "Use cases", links: [{ label: "Agencies", href: "/use-cases/agencies" }] },
  { title: "Company", links: [{ label: "Licensing", href: "/licensing" }, { label: "Creator partners", href: "/creators/join" }, { label: "FAQ", href: "/faq" }] },
  { title: "Legal", links: [{ label: "Terms", href: "/legal/terms" }, { label: "Privacy", href: "/legal/privacy" }, { label: "Acceptable use", href: "/legal/acceptable-use" }, { label: "Takedown requests", href: "/legal/takedown" }] },
];

/** Public footer (generator `pubfoot` / `mpubfoot`) with the large flat "nelio" wordmark. */
export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-border bg-surface-1 px-4 pt-10 md:px-12 md:pt-14">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:flex-row md:flex-wrap md:gap-12">
        <div className="flex flex-col gap-3 md:flex-[1_1_260px]">
          <Logo size={26} />
          <p className="m-0 text-sm leading-[1.55] text-muted">Your AI content team, under your control.</p>
          <div className="flex gap-2">
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
                <Link key={l.href} href={l.href} className="flex min-h-7 items-center text-sm text-muted no-underline hover:text-text md:min-h-0">{l.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1200px] flex-wrap justify-between gap-2 text-[12.5px] text-muted md:mt-8 md:text-[13px]">
        <span>© 2026 Nelio. Made in Lagos.</span>
        <span>Prices in USD · pay in NGN at checkout</span>
      </div>
      <div aria-hidden="true" className={cn("mt-6 select-none overflow-hidden whitespace-nowrap text-center font-display text-[120px] font-extrabold leading-[0.8] tracking-[-0.06em] text-surface-3 md:text-[300px]")}>nelio</div>
    </footer>
  );
}
