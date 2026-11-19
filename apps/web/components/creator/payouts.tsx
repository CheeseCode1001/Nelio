"use client";

import { Button, EmptyState, Motion, PageHead, StickerArt } from "@nelio/ui";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { notifyPayoutsAction } from "@/lib/actions/creator";

/** LI-10 Payouts: gated by design until legal, tax, identity checks and a payout provider exist (B-08). */
export function Payouts({ notified: initially, preview }: { notified: boolean; preview?: boolean }) {
  const [notified, setNotified] = useState(initially);
  const [pending, start] = useTransition();
  const ask = () => {
    if (preview) { setNotified(true); return; }
    start(async () => {
      const r = await notifyPayoutsAction();
      if (!r.ok) { toast.error("That didn’t work", { description: r.error }); return; }
      setNotified(true);
      toast.success("We’ll let you know", { description: "You’ll hear from us when paid licensing opens." });
    });
  };
  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead title="Payouts" />
        <EmptyState
          illustration="wallet"
          art={<StickerArt name="coins" size={216} />}
          title="Paid licensing and payouts are coming later"
          text="We’ll open paid licenses once legal, tax and payment requirements are in place. Your free and private licenses keep working."
          actions={notified ? <Button variant="secondary" icon="check" disabled>We’ll notify you</Button> : <Button variant="cta" arrow onClick={ask} loading={pending}>Notify me</Button>}
        />
      </div>
    </Motion>
  );
}
