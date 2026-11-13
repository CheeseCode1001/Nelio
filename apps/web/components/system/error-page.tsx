import { BigTitle, Blob, Illustration, Logo, Motion, type IllustrationName } from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Full-page system state (generator `err_page`): SY-03 Not found, SY-04 Access denied, SY-05 Server error, SY-06 Maintenance.
 * Errors say what happened, what wasn't lost, and what to do next (handoff §8).
 */
export function ErrorPage({ illustration, title, text, actions }: { illustration: IllustrationName; title: string; text: string; actions: ReactNode }) {
  return (
    <Motion className="flex grow flex-col">
      <header className="flex items-center px-4 py-3 md:px-8 md:py-5">
        <Link href="/" aria-label="Nelio home" className="tap-target no-underline">
          <Logo size={22} className="md:hidden" />
          <Logo size={24} className="hidden md:inline-flex" />
        </Link>
      </header>
      <main id="main" className="relative flex grow flex-col items-center justify-center gap-[18px] overflow-hidden p-6 text-center md:p-12">
        <Blob size={700} fill="var(--n-s2)" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex flex-col items-center gap-[18px]" data-enter="">
          <Illustration name={illustration} width={400} className="w-[280px] md:w-[400px]" />
          <BigTitle size={52}>{title}</BigTitle>
          <p className="m-0 max-w-[520px] text-[15px] leading-[1.55] text-muted md:text-[17px]">{text}</p>
          <div className="flex flex-wrap justify-center gap-2.5">{actions}</div>
        </div>
      </main>
    </Motion>
  );
}

/** mailto link for "Contact support", or null until a support address is configured (NEXT_PUBLIC_SUPPORT_EMAIL). */
export const SUPPORT_HREF = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}` : null;
