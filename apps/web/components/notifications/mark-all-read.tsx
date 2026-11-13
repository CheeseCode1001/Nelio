"use client";

import { Button } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markAllReadAction } from "@/lib/actions/notifications";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button variant="secondary" icon="check" loading={pending} disabled={disabled} onClick={() => start(async () => { await markAllReadAction(); router.refresh(); })}>
      Mark all read
    </Button>
  );
}
