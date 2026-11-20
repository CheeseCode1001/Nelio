"use client";

import { DropdownMenu, Icon, NavItemContent, navItemClass } from "@nelio/ui";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "@/components/feedback/toaster";
import { pauseAgentAction, resumeAgentAction } from "@/lib/actions/agents";

/** The agent card's corner menu: open the agent, or pause / resume it. Errors are announced, never silent. */
export function AgentMenu({ id, name, running, openHref, workspaceSlug }: { id: string; name: string; running: boolean; openHref: string; workspaceSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toggle = () => {
    if (!workspaceSlug) return;
    start(async () => {
      const r = running ? await pauseAgentAction(workspaceSlug, id) : await resumeAgentAction(workspaceSlug, id);
      if (!r.ok) toast.error(running ? `Couldn’t pause ${name}` : `Couldn’t resume ${name}`, { description: r.error });
      else toast.success(running ? `${name} paused` : `${name} resumed`);
    });
  };
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button type="button" aria-label={`${name} menu`} className="tap-target inline-flex size-[30px] cursor-pointer items-center justify-center rounded-full border-0 bg-surface-2 text-text">
          <Icon name="more" size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 box-border flex w-[220px] flex-col gap-0.5 rounded-sheet border border-border bg-surface-1 p-2 shadow-menu outline-none">
          <DropdownMenu.Item asChild>
            <Link href={openHref} className={navItemClass(false)}><NavItemContent icon="bot" label="Open agent" active={false} /></Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild disabled={pending || !workspaceSlug} onSelect={toggle}>
            <button type="button" className={navItemClass(false)}><NavItemContent icon={running ? "activity" : "zap"} label={running ? "Pause agent" : "Resume agent"} active={false} /></button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
