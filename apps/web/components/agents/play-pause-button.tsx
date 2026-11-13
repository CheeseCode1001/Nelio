"use client";

import { IconButton } from "@nelio/ui";
import { useState, useTransition } from "react";
import { pauseAgentAction, resumeAgentAction } from "@/lib/actions/agents";

/** Pause / resume one agent. Errors (budget used up, workspace paused) are announced, never silent. */
export function PlayPauseButton({ agentId, name, running, workspaceSlug }: { agentId: string; name: string; running: boolean; workspaceSlug?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const label = running ? `Pause ${name}` : `Resume ${name}`;
  return (
    <span className="relative inline-flex">
      <IconButton
        icon={running ? "pause" : "play"}
        label={pending ? `${label}…` : label}
        disabled={pending}
        onClick={() => {
          if (!workspaceSlug) return;
          setError(null);
          start(async () => {
            const r = running ? await pauseAgentAction(workspaceSlug, agentId) : await resumeAgentAction(workspaceSlug, agentId);
            if (!r.ok) setError(r.error);
          });
        }}
      />
      {error ? (
        <span role="alert" className="absolute bottom-full right-0 z-10 mb-2 w-max max-w-[240px] rounded-xl bg-ink px-3 py-2 text-[13px] font-semibold text-on-ink shadow-card">
          {error}
        </span>
      ) : null}
    </span>
  );
}
