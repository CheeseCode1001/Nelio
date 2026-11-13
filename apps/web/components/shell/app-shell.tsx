import type { ReactNode } from "react";
import { MobileTabBar } from "./mobile-tab-bar";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import type { ShellProps } from "./types";

/**
 * Operator app frame (generator `app_page`): top bar, optional strip, sidebar + content on desktop,
 * content + bottom tabs on mobile. Page padding 32/16 px and section gap 24/16 px (handoff §6.3).
 */
export function AppShell({ strip, children, ...p }: ShellProps & { strip?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh grow flex-col">
      <TopBar {...p} />
      {strip}
      <div className="flex grow items-stretch">
        <Sidebar {...p} />
        <main id="main" className="box-border min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto flex max-w-[1260px] flex-col gap-4 md:gap-6">{children}</div>
        </main>
      </div>
      <MobileTabBar {...p} />
    </div>
  );
}
