"use client";

import { Card, CardTitle, Icon, IconButton, Meter, Small, cn } from "@nelio/ui";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useTransition } from "react";
import { dismissChecklistAction } from "@/lib/actions/workspace";
import { CHECKLIST, type ChecklistKey } from "./model";

/**
 * ON-05 setup checklist on the Command Center (decision D-04). Dismissing it is remembered per workspace.
 * In a development preview (no workspace in the address) it only hides locally.
 */
export function ChecklistCard({ done, links }: { done: ChecklistKey[]; links: Record<ChecklistKey, string> }) {
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();
  const params = useParams<{ ws?: string }>();
  if (hidden) return null;
  const count = CHECKLIST.filter((c) => done.includes(c.key)).length;
  const pct = count * 20;
  const dismiss = () => {
    setHidden(true);
    if (params.ws) start(() => void dismissChecklistAction(params.ws!));
  };
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <CardTitle size={20}>Finish setting up</CardTitle>
          <Small>{count} of 5 done. Agents work better with a brand kit.</Small>
        </div>
        <span className="grow" />
        <span className="font-display text-[30px] font-extrabold text-accent-text">{pct}%</span>
        <IconButton icon="x" label="Dismiss checklist" onClick={dismiss} disabled={pending} />
      </div>
      <Meter pct={pct} ariaLabel="Setup progress" />
      <ul className="m-0 grid list-none gap-2.5 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))]">
        {CHECKLIST.map((c) => {
          const isDone = done.includes(c.key);
          return (
            <li key={c.key}>
              <Link href={links[c.key]} className={cn("flex items-center gap-2.5 rounded-row p-3.5 text-text no-underline hover:text-text", isDone ? "bg-ok-tint" : "bg-surface-2")}>
                <span className={isDone ? "text-ok-text" : "text-accent-text"}>
                  <Icon name={isDone ? "check" : c.icon} size={18} strokeWidth={isDone ? 3 : 2} />
                </span>
                <span className={cn("text-[13.5px] font-bold", isDone && "text-muted line-through")}>
                  {c.label}
                  {isDone ? <span className="sr-only"> (done)</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
