"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sound";

/**
 * Plays the tap and toggle sounds on direct actions anywhere in the app (buttons, chips, tabs, switches,
 * checkboxes). One listener, no per-component wiring; sounds respect the Appearance setting.
 */
export function TapSounds() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('button, a[href], [role="tab"], [role="switch"], input[type="checkbox"], input[type="radio"], summary');
      if (!el || el.closest("[data-no-sound]") || (el as HTMLButtonElement).disabled) return;
      if (el.getAttribute("role") === "switch") return playSound(el.getAttribute("aria-checked") === "true" ? "toggleOff" : "toggleOn");
      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) return playSound(el.checked ? "toggleOn" : "toggleOff");
      playSound("tap");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
