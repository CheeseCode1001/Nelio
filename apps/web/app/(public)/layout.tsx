import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { SiteFooter, SiteHeader } from "@/components/public/site-chrome";

/** Public site surface (B §2): marketing header, content on white, footer. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh grow flex-col">
      <SiteHeader />
      <main id="main" className="flex flex-col bg-surface-1">
        <ScrollReveal>{children}</ScrollReveal>
      </main>
      <SiteFooter />
    </div>
  );
}
