"use client";

import { Button, Card, CardHead, Small, cn } from "@nelio/ui";
import { useSyncExternalStore } from "react";
import { playSound, readSoundSettings, subscribeSoundSettings, writeSoundSettings, type SoundSettings } from "@/lib/sound";

const SERVER = JSON.stringify({ enabled: true, volume: 40 });

/** ST-03 Sound: interface sounds on this device (Delight board). Stored locally, not on the account. */
export function SoundCard() {
  const snap = useSyncExternalStore(subscribeSoundSettings, () => JSON.stringify(readSoundSettings()), () => SERVER);
  const s = JSON.parse(snap) as SoundSettings;
  const update = (next: SoundSettings) => writeSoundSettings(next);
  return (
    <Card className="md:!p-[26px]">
      <CardHead title="Sound" right={<Small>This device only</Small>} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div id="sound-label" className="text-sm font-bold text-text">Interface sounds</div>
          <div className="text-[13px] text-muted">Soft clicks, pops and chimes when you tap, toggle, publish or get a toast. Never during video playback.</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={s.enabled}
          aria-labelledby="sound-label"
          onClick={() => update({ ...s, enabled: !s.enabled })}
          className={cn("tap-target flex h-[30px] w-[52px] flex-none cursor-pointer rounded-full border-0 p-1", s.enabled ? "justify-end bg-accent" : "justify-start bg-surface-3")}
        >
          <span className="block size-[22px] rounded-full bg-white" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="sound-volume" className="text-[12.5px] font-bold text-text">Volume</label>
        <input id="sound-volume" type="range" min={0} max={100} step={5} value={s.volume} disabled={!s.enabled} onChange={(e) => update({ ...s, volume: Number(e.target.value) })} onPointerUp={() => playSound("pop", { force: true })} className="min-h-11 flex-[1_1_200px] accent-[var(--color-accent)]" />
        <span className="text-[12.5px] font-medium text-muted">{s.volume}%</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon="play" disabled={!s.enabled} onClick={() => playSound("success", { force: true })} data-no-sound="">Play a sample</Button>
        <Small>Off automatically when your device is on silent or Reduce motion is on.</Small>
      </div>
    </Card>
  );
}
