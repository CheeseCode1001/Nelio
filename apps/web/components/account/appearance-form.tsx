"use client";

import { Banner, Card, CardHead, Icon, Small, cn, type IconName } from "@nelio/ui";
import { useState, useTransition } from "react";
import { saveAppearanceAction } from "@/lib/actions/preferences";

type Theme = "light" | "dark" | "system";

const THEMES: { value: Theme; label: string; icon: IconName; bg: string; fg: string; acc: string }[] = [
  { value: "light", label: "Light", icon: "sun", bg: "#F4F6FB", fg: "#0B0B14", acc: "#2F5BFF" },
  { value: "dark", label: "Dark", icon: "moon", bg: "#0B0B14", fg: "#F5F6FA", acc: "#3D63FF" },
  { value: "system", label: "Match system", icon: "monitor", bg: "#E4E8F1", fg: "#5B6175", acc: "#2F5BFF" },
];

function apply(theme: Theme, reduceMotion: boolean) {
  const d = document.documentElement;
  d.dataset.themePref = theme;
  d.dataset.theme = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  if (reduceMotion) d.dataset.motion = "reduce";
  else delete d.dataset.motion;
  // Same cookies the server writes (lib/preferences.ts), set now so the next page renders with them.
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `nelio-theme=${theme}; path=/; max-age=31536000; samesite=lax${secure}`;
  document.cookie = reduceMotion ? `nelio-motion=reduce; path=/; max-age=31536000; samesite=lax${secure}` : "nelio-motion=; path=/; max-age=0";
}

/** ST-03 Appearance: theme cards and the Reduce motion switch. Changes apply at once and are saved to the account. */
export function AppearanceForm({ initialTheme, initialReduceMotion }: { initialTheme: Theme; initialReduceMotion: boolean }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [reduce, setReduce] = useState(initialReduceMotion);
  const [failed, setFailed] = useState(false);
  const [, start] = useTransition();

  const save = (t: Theme, r: boolean) => {
    setTheme(t);
    setReduce(r);
    apply(t, r);
    start(async () => {
      const res = await saveAppearanceAction({ theme: t, reduceMotion: r });
      setFailed(!res.ok);
    });
  };

  return (
    <Card className="md:!p-[26px]">
      <CardHead title="Theme" right={<Small>Saved to your account</Small>} />
      {failed ? <Banner tone="err" title="We couldn’t save that" text="It’s applied on this device. Try again to keep it on your account." /> : null}
      <fieldset className="m-0 grid gap-3 border-0 p-0 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        <legend className="sr-only">Theme</legend>
        {THEMES.map((t) => (
          <label key={t.value} className={cn("flex cursor-pointer flex-col gap-3 rounded-[26px] border-[3px] bg-surface-1 p-3.5 text-text has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent", theme === t.value ? "border-accent" : "border-border")}>
            <input type="radio" name="theme" value={t.value} checked={theme === t.value} onChange={() => save(t.value, reduce)} className="sr-only" />
            <span aria-hidden="true" className="box-border flex h-[130px] flex-col gap-2 rounded-[18px] border border-border p-3.5" style={{ background: t.bg }}>
              <span className="h-3 w-3/5 rounded-md" style={{ background: t.fg }} />
              <span className="h-[26px] w-2/5 rounded-full" style={{ background: t.acc }} />
              <span className="h-2.5 w-4/5 rounded-[5px] opacity-35" style={{ background: t.fg }} />
            </span>
            <span className="flex items-center gap-2 font-extrabold">
              <Icon name={t.icon} size={18} />
              {t.label}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div id="reduce-label" className="text-sm font-bold text-text">Reduce motion</div>
          <div className="text-[13px] text-muted">Turns off animations, floating phones and caption effects</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reduce}
          aria-labelledby="reduce-label"
          onClick={() => save(theme, !reduce)}
          className={cn("flex h-[30px] w-[52px] flex-none cursor-pointer rounded-full border-0 p-1", reduce ? "justify-end bg-accent" : "justify-start bg-surface-3")}
        >
          <span className="block size-[22px] rounded-full bg-white" />
        </button>
      </div>
    </Card>
  );
}
