"use client";

/**
 * Interface sounds (Delight board): tiny WebAudio synths, no audio files. A shared AudioContext is created on
 * the first direct action. Settings are per device (Appearance › Sound): on by default at 40%, off when
 * Reduce motion is on. Never on hover, scroll or page load; at most one sound per 80 ms.
 */
export type SoundToken = "tap" | "toggleOn" | "toggleOff" | "pop" | "success" | "error" | "notify" | "whoosh" | "undo";

const KEY = "nelio-sound";
export interface SoundSettings { enabled: boolean; volume: number }
const DEFAULTS: SoundSettings = { enabled: true, volume: 40 };

export function readSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const v = JSON.parse(raw) as Partial<SoundSettings>;
    return { enabled: v.enabled !== false, volume: Math.min(100, Math.max(0, Number(v.volume ?? 40))) };
  } catch {
    return DEFAULTS;
  }
}
export function writeSoundSettings(s: SoundSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode: the setting lasts for this page only */
  }
  window.dispatchEvent(new Event("nelio-sound"));
}
export function subscribeSoundSettings(cb: () => void) {
  window.addEventListener("nelio-sound", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("nelio-sound", cb);
    window.removeEventListener("storage", cb);
  };
}

let ctx: AudioContext | null = null;
let last = 0;

function allowed(): SoundSettings | null {
  if (typeof window === "undefined") return null;
  if (document.documentElement.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  // Never over a playing video.
  if ([...document.querySelectorAll("video")].some((v) => !v.paused)) return null;
  const s = readSoundSettings();
  return s.enabled && s.volume > 0 ? s : null;
}

function tone(c: AudioContext, gainPeak: number, at: number, dur: number, type: OscillatorType, f0: number, f1?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, at);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gainPeak, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(c.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}

function noiseSweep(c: AudioContext, gainPeak: number, at: number, dur: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, at);
  filter.frequency.exponentialRampToValueAtTime(3200, at + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gainPeak, at + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(at);
}

/** Plays one sound token if sounds are on. Safe to call from any click handler. */
export function playSound(token: SoundToken, opts: { force?: boolean } = {}) {
  const s = opts.force ? readSoundSettings() : allowed();
  if (!s) return;
  const now = performance.now();
  if (now - last < 80) return;
  last = now;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const c = ctx;
    const t = c.currentTime + 0.005;
    const v = (s.volume / 100) * 0.35;
    switch (token) {
      case "tap": tone(c, v * 0.6, t, 0.03, "triangle", 1800, 1200); break;
      case "toggleOn": tone(c, v, t, 0.05, "sine", 660); tone(c, v, t + 0.06, 0.06, "sine", 990); break;
      case "toggleOff": tone(c, v, t, 0.05, "sine", 990); tone(c, v, t + 0.06, 0.06, "sine", 660); break;
      case "pop": tone(c, v, t, 0.07, "sine", 520, 1040); break;
      case "success": [523.25, 659.25, 783.99].forEach((f, i) => tone(c, v, t + i * 0.06, 0.12, "sine", f)); break;
      case "error": tone(c, v, t, 0.16, "triangle", 240, 160); break;
      case "notify": tone(c, v * 0.8, t, 0.6, "sine", 1320); break;
      case "whoosh": noiseSweep(c, v * 0.5, t, 0.32); break;
      case "undo": tone(c, v, t, 0.09, "sine", 660, 440); break;
    }
  } catch {
    /* audio unavailable: stay silent */
  }
}
