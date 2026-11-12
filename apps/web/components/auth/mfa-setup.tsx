"use client";

import { Banner, Button, Small } from "@nelio/ui";
import { useEffect, useState } from "react";
import { enrollMfaAction, type EnrollResult } from "@/lib/actions/mfa";
import { MfaForm } from "./forms";

/** AU-05 Setup: scan the QR code, then confirm with a code. */
export function MfaSetup({ next }: { next: string }) {
  const [res, setRes] = useState<EnrollResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    void enrollMfaAction().then((r) => {
      if (live) setRes(r);
    });
    return () => {
      live = false;
    };
  }, [attempt]);
  const start = () => {
    setRes(null);
    setAttempt((n) => n + 1);
  };

  if (!res) {
    return <div role="status" aria-label="Preparing your QR code" className="mx-auto size-[180px] animate-pulse rounded-[20px] bg-surface-3" />;
  }
  if (!res.ok) {
    return <Banner tone="err" title="We couldn’t start setup" text="Nothing changed on your account. Try again." action={<Button variant="secondary" size="sm" onClick={start}>Try again</Button>} />;
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL from the auth service */}
      <img src={res.qr} alt="QR code to scan with your authenticator app" width={180} height={180} className="mx-auto box-border size-[180px] rounded-[20px] border-2 border-outline bg-white p-3" />
      <Small className="text-center">
        Can’t scan? Enter this key by hand: <code className="break-all font-mono text-text">{res.secret}</code>
      </Small>
      <MfaForm factorId={res.factorId} next={next} />
    </>
  );
}
