"use client";

import { BotAvatar } from "bot-avatars";
import { useSyncExternalStore } from "react";
import { AGENT_COLORS, AGENT_RADIUS } from "./primitives";

/** Reduce motion: the OS setting or the app's own switch (html[data-motion="reduce"]). */
function subscribe(cb: () => void) {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  return () => {
    mq.removeEventListener("change", cb);
    obs.disconnect();
  };
}
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";

const TYPE = { circle: "circle", square: "square", blob: "blob", pill: "pill" } as const;

/**
 * An agent's plush bot (Delight board, bot-avatars): each agent keeps one shape and one brand colour
 * everywhere. Idle blinks and glances; `working` while a job runs; `sleeping` for a paused agent. A still
 * frame under reduced motion. Canvas 2D, decorative (the agent's name is always next to it).
 */
export function AgentAvatar({ color = "lime", shape = "circle", size = 40, animated = true, state = "default" }: { color?: keyof typeof AGENT_COLORS; shape?: keyof typeof AGENT_RADIUS; size?: number; animated?: boolean; state?: "default" | "working" | "sleeping" }) {
  const still = useSyncExternalStore(subscribe, reduced, () => true);
  return (
    <span aria-hidden="true" className="inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <BotAvatar type={TYPE[shape]} color={AGENT_COLORS[color]} size={size} state={state} paused={still || !animated} shading="fabric" />
    </span>
  );
}

/** Empty states for agents (Agents, Activity, Command Center boards): three plush bots, the middle one larger. */
export function AgentTrio({ size = 120 }: { size?: number }) {
  const side = Math.round(size * 0.72);
  return (
    <span aria-hidden="true" className="flex items-end justify-center gap-1 [&>span]:scale-[1.18]">
      <AgentAvatar color="pink" shape="blob" size={side} />
      <AgentAvatar color="lime" shape="circle" size={size} />
      <AgentAvatar color="blue" shape="square" size={side} />
    </span>
  );
}
