import { AgentAvatar, ButtonLink, Card, CardTitle, Chip, Meter, Small } from "@nelio/ui";
import type { AgentCardData } from "@/components/command-center/model";
import { PlayPauseButton } from "./play-pause-button";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * Agent card (generator `agentCard`), used on the Command Center and APP-04. With a workspace slug the
 * pause / resume button works; without one (design previews) it is shown but does nothing.
 */
export function AgentCard({ a, openHref, workspaceSlug }: { a: AgentCardData; openHref: string; workspaceSlug?: string }) {
  const pct = (a.budget.used / Math.max(1, a.budget.limit)) * 100;
  return (
    <Card>
      <div className="flex items-center gap-3">
        <AgentAvatar color={a.color} shape={a.shape} size={52} />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <CardTitle size={17}>{a.name}</CardTitle>
          <Small>{a.line}</Small>
        </div>
        <span className="grow" />
        <Chip tone={a.state.tone} icon={a.state.icon}>{a.state.label}</Chip>
      </div>
      <Meter label="Weekly budget" right={`${fmt(a.budget.used)} / ${fmt(a.budget.limit)} cr`} pct={pct} tone={pct >= 100 ? "warn" : "acc"} />
      <div className="flex flex-wrap items-center gap-2">
        <Small>{a.meta}</Small>
        <span className="grow" />
        <PlayPauseButton agentId={a.id} name={a.name} running={a.running} workspaceSlug={workspaceSlug} />
        <ButtonLink href={openHref} variant="secondary" size="sm">Open</ButtonLink>
      </div>
    </Card>
  );
}
