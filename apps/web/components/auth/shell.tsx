import { Logo, Motion, PhotoCarouselPanel, PhotoStrip, cn, type CarouselSticker, type PanelColor, type PhotoKey } from "@nelio/ui";
import Link from "next/link";
import type { ReactNode } from "react";

export interface AuthSide {
  color: PanelColor;
  title: string;
  photos: PhotoKey[];
  stickers?: CarouselSticker[];
}

/** Photo sets and panel copy from the approved boards (generator s02_auth.py). */
export const SIDES = {
  signUp: {
    color: "lime", title: "Your AI content team is a minute away.", photos: ["p10", "p1", "p6", "p8"],
    stickers: [
      { label: "No card needed", fill: "white", rotate: -5, position: "top-[60px] left-[60px]" },
      { label: "Free forever plan", fill: "yellow", rotate: 4, position: "bottom-[70px] right-[60px]" },
    ],
  },
  logIn: {
    color: "cyan", title: "Your agents kept working while you were away.", photos: ["p8", "p7", "p1", "p3"],
    stickers: [{ label: "3 drafts ready", fill: "yellow", rotate: -4, position: "top-[70px] left-[70px]" }],
  },
  contentOwner: {
    color: "pink", title: "Your content. Your rules.", photos: ["p1", "p5", "p10", "p7"],
    stickers: [{ label: "Revoke anytime", fill: "yellow", rotate: 5, position: "top-[70px] right-[70px]" }],
  },
} satisfies Record<string, AuthSide>;

export const inviteSide = (orgName: string): AuthSide => ({
  color: "orange", title: `${orgName} wants your OK on their posts.`, photos: ["p6", "p4", "p10", "p2"],
  stickers: [{ label: "Approve from your phone", fill: "white", rotate: -4, position: "top-[70px] left-[60px]" }],
});

function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="flex items-center gap-4 px-4 py-3 md:px-8 md:py-5">
      <Link href="/" aria-label="Nelio home" className="tap-target no-underline">
        <Logo size={22} className="md:hidden" />
        <Logo size={24} className="hidden md:inline-flex" />
      </Link>
      {right ? (
        <>
          <span className="grow" />
          {right}
        </>
      ) : null}
    </header>
  );
}

/**
 * Sign-in and onboarding page shell (generator `center_page`).
 * Desktop with `side`: form column beside the photo carousel. Mobile: single column with a photo strip.
 */
export function AuthShell({ side, width = 480, header, children }: { side?: AuthSide; width?: number; header?: ReactNode; children: ReactNode }) {
  const column = (
    <div className="flex w-full flex-col gap-4 md:gap-[18px]" style={{ maxWidth: width }} data-enter="">
      {children}
    </div>
  );
  if (!side) {
    return (
      <Motion className="flex grow flex-col">
        <Header right={header} />
        <main id="main" className="flex grow items-start justify-center p-4 md:px-5 md:py-10">{column}</main>
      </Motion>
    );
  }
  return (
    <Motion className="flex grow flex-wrap">
      <div className="flex flex-[1_1_520px] flex-col">
        <Header right={header} />
        <PhotoStrip photos={side.photos} />
        <main id="main" className={cn("flex grow justify-center p-4 md:px-6 md:py-8")}>{column}</main>
      </div>
      <PhotoCarouselPanel {...side} />
    </Motion>
  );
}
