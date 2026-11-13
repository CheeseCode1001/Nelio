"use client";

import { Banner, ButtonLink, ChoiceCard } from "@nelio/ui";
import { useState } from "react";

type Mode = "manual" | "assisted" | "autonomous";

/** ON-04 choices. The banner under them follows the selection (Autonomous) or the plan (Free). */
export function AutomationChoices({ initial, freePlan, trialHref }: { initial: Mode; freePlan: boolean; trialHref: string }) {
  const [mode, setMode] = useState<Mode>(freePlan && initial === "autonomous" ? "assisted" : initial);
  const pick = (m: Mode) => () => setMode(m);
  return (
    <>
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="sr-only">Automation mode</legend>
        <ChoiceCard name="mode" value="manual" checked={mode === "manual"} onChange={pick("manual")} title="Manual" sub="You start every action. Agents help when asked." icon="pen" tone="blue" />
        <ChoiceCard name="mode" value="assisted" checked={mode === "assisted"} onChange={pick("assisted")} title="Assisted" sub="Agents prepare drafts. Nothing publishes until you approve." icon="check" tone="lime" badge="Recommended" />
        <ChoiceCard
          name="mode"
          value="autonomous"
          checked={mode === "autonomous"}
          onChange={pick("autonomous")}
          title="Autonomous"
          sub="Agents publish on their own within limits you set and confirm."
          icon="zap"
          tone="ai"
          badge={freePlan ? "Paid plans" : "Needs authorization"}
          locked={freePlan}
        />
      </fieldset>
      {freePlan ? (
        <Banner tone="blue" title="Autonomous publishing is on paid plans" text="Start a 3-day trial to try it, no card needed." action={<ButtonLink href={trialHref} variant="secondary" size="sm">Start trial</ButtonLink>} />
      ) : mode === "autonomous" ? (
        <Banner tone="ai" title="You’ll set the limits first" text="Autonomous publishing stays off until you confirm the account, how often and the budget for each agent." />
      ) : null}
    </>
  );
}
