import { Illustration, Logo } from "@nelio/ui";
import type { Metadata } from "next";
import { RetryButton } from "./retry";

export const metadata: Metadata = { title: "You’re offline", robots: { index: false } };

/**
 * SY-02 fallback page. The service worker serves it when a page is opened without a connection.
 * It holds no account data, so it is safe to keep in the browser's cache.
 */
export default function OfflinePage() {
  return (
    <div className="flex grow flex-col">
      <header className="flex items-center px-4 py-3 md:px-8 md:py-5">
        <Logo size={24} />
      </header>
      <main id="main" className="mx-auto box-border flex w-full max-w-[1260px] grow flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-5 rounded-panel border-2 border-dashed border-border bg-surface-1 p-6">
          <Illustration name="offline" width={200} />
          <div className="flex flex-[1_1_300px] flex-col gap-2">
            <h1 className="m-0 font-display text-[23px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[26px]">You’re offline</h1>
            <p className="m-0 text-[15px] leading-[1.55] text-muted">Nothing is queued while offline, so nothing posts by surprise later.</p>
            <RetryButton />
          </div>
        </div>
      </main>
    </div>
  );
}
