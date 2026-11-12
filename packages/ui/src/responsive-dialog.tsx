"use client";

import { Dialog, DropdownMenu } from "radix-ui";
import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "./primitives";

/** True below the 768 px mobile breakpoint (handoff §7). False during server render. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

const SCRIM = "fixed inset-0 z-40 bg-[rgba(11,11,20,0.55)]";

/**
 * Handoff §6.4 rule 3: a centred dialog (radius 32) on desktop and a bottom sheet under 768 px
 * (full width, 28 px top corners, grab handle, at most 88% of the height, scrolls inside).
 */
export function ResponsiveDialog({ open, onOpenChange, title, description, maxWidth = 560, top = 100, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; maxWidth?: number; top?: number; children: ReactNode }) {
  const mobile = useIsMobile();
  if (mobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className={SCRIM} />
          <Drawer.Content aria-describedby={description ? undefined : undefined} className="fixed inset-x-0 bottom-0 z-50 box-border flex max-h-[88%] w-full flex-col gap-4 overflow-y-auto rounded-t-sheet bg-surface-1 px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-2.5 outline-none">
            <span aria-hidden="true" className="mb-1 h-[5px] w-11 flex-none self-center rounded-full bg-surface-3" />
            <Drawer.Title className="m-0 font-display text-[23px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">{title}</Drawer.Title>
            {description ? <Drawer.Description className="sr-only">{description}</Drawer.Description> : null}
            {children}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={SCRIM} />
        <Dialog.Content aria-describedby={description ? undefined : undefined} className={cn("fixed left-1/2 z-50 box-border flex max-h-[calc(100dvh-140px)] w-[calc(100%-40px)] -translate-x-1/2 flex-col gap-[18px] overflow-y-auto rounded-panel bg-surface-1 p-7 outline-none")} style={{ maxWidth, top }}>
          <Dialog.Title className="m-0 font-display text-[26px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">{title}</Dialog.Title>
          {description ? <Dialog.Description className="sr-only">{description}</Dialog.Description> : null}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { DropdownMenu };
