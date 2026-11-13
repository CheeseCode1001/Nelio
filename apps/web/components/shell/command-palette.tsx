"use client";

import { SCREENS, hrefFor, isBuilt, type ScreenDef } from "@nelio/config";
import { Bubble, Chip, EmptyState, Icon, ResponsiveDialog, type IconName } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ShellWorkspace } from "./types";

const RECENT_KEY = "nelio.palette.recent";

/** Recently opened screens: a per-viewer convenience kept in this browser only. Never required. */
function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecent().filter((x) => x !== id)].slice(0, 5)));
  } catch {
    // Storage blocked: recents are simply not kept.
  }
}

const SCREEN_ICON: Record<string, IconName> = {
  "APP-01": "home", "APP-02": "spark", "APP-03": "activity", "APP-04": "bot", "APP-06": "bot", "NT-01": "bell", "CL-01": "scissors", "CL-02": "upload",
  "CL-05": "download", "CS-01": "pen", "LI-01": "shield", "LI-04": "shield", "PB-01": "calendar", "PB-02": "file", "PB-04": "check", "AN-01": "chart",
  "IN-01": "link", "BI-01": "wallet", "BI-05": "wallet", "ST-03": "sun",
};

interface Entry {
  key: string;
  title: string;
  sub: string;
  icon: IconName;
  tone: "blue" | "ai" | "warn" | "ok" | "neutral";
  hint?: string;
  run: () => void;
}

/**
 * SY-07 Command palette (Ctrl K / ⌘K): quick actions, recent screens, and search across screens and workspaces.
 * Quick actions and screens appear only once they work (or behind the development navigation flag).
 */
export function CommandPalette({ open, onOpenChange, current, workspaces, showUnbuilt, preview }: { open: boolean; onOpenChange: (o: boolean) => void; current: ShellWorkspace; workspaces: ShellWorkspace[]; showUnbuilt: boolean; preview?: boolean }) {
  const router = useRouter();
  // The parent remounts this component each time it opens, so state starts fresh.
  const [q, setQ] = useState("");
  const [recent] = useState<string[]>(() => (typeof window === "undefined" ? [] : readRecent()));
  const [cursor, setCursor] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const ctx = { ws: current.slug, org: current.orgSlug };
  const go = (def: ScreenDef) => () => {
    pushRecent(def.id);
    onOpenChange(false);
    if (!preview) router.push(hrefFor(def.id as Parameters<typeof hrefFor>[0], ctx));
  };
  const visible = SCREENS.filter((d) => showUnbuilt || isBuilt(d));
  const screenEntry = (d: ScreenDef): Entry => ({ key: d.id, title: d.title, sub: "Page", icon: SCREEN_ICON[d.id] ?? "grid", tone: "neutral", run: go(d) });

  const actions: Entry[] = useMemo(() => {
    const a: { id: string; title: string; icon: IconName; tone: Entry["tone"]; hint: string }[] = [
      { id: "CL-02", title: "New upload", icon: "upload", tone: "blue", hint: "U" },
      { id: "APP-06", title: "Create agent", icon: "bot", tone: "ai", hint: "A" },
      { id: "APP-02", title: "Ask Nelio AI", icon: "spark", tone: "ai", hint: "Enter" },
    ];
    return a
      .map((x) => ({ x, def: SCREENS.find((d) => d.id === x.id)! }))
      .filter(({ def }) => showUnbuilt || isBuilt(def))
      .map(({ x, def }) => ({ key: `action-${x.id}`, title: x.title, sub: x.id === "APP-02" ? "Type a question" : x.hint, icon: x.icon, tone: x.tone, hint: x.hint, run: go(def) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUnbuilt, current.slug, preview]);

  const term = q.trim().toLowerCase();
  const results: Entry[] = term
    ? [
        ...visible.filter((d) => d.title.toLowerCase().includes(term)).map(screenEntry),
        ...workspaces
          .filter((w) => w.name.toLowerCase().includes(term))
          .map<Entry>((w) => ({
            key: `ws-${w.workspaceId}`, title: w.name, sub: "Workspace", icon: "grid", tone: "blue",
            run: () => { onOpenChange(false); if (!preview) router.push(`/w/${w.slug}/home`); },
          })),
      ]
    : [];
  const recentEntries = recent.map((id) => visible.find((d) => d.id === id)).filter(Boolean).map((d) => screenEntry(d!));
  const flat = term ? results : [...actions, ...recentEntries];

  useEffect(() => {
    resultsRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(flat.length - 1, c + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    else if (e.key === "Enter" && flat[cursor]) { e.preventDefault(); flat[cursor].run(); }
  };

  const section = (label: string, items: Entry[], start: number) =>
    items.length ? (
      <div className="flex flex-col gap-2">
        <span className="text-[12.5px] font-extrabold text-muted">{label}</span>
        <ul role="listbox" aria-label={label} className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
          {items.map((it, i) => {
            const me = start + i;
            return (
              <li key={it.key} role="option" aria-selected={cursor === me} data-idx={me} className="border-b border-border last:border-b-0">
                <button type="button" onClick={it.run} onMouseEnter={() => setCursor(me)} className={`flex w-full cursor-pointer items-center gap-3 border-0 px-4 py-3 text-left ${cursor === me ? "bg-surface-2" : "bg-transparent"}`}>
                  <Bubble icon={it.icon} tone={it.tone} size={34} />
                  <span className="min-w-0 grow">
                    <span className="block text-sm font-semibold text-text">{it.title}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{it.sub}</span>
                  </span>
                  <Chip tone="neutral">{it.hint ?? "Open"}</Chip>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search screens and workspaces, or run a quick action." maxWidth={640} top={70}>
      <div className="flex items-center gap-2.5 rounded-full border-2 border-accent bg-surface-1 px-4 py-3">
        <Icon name="search" size={18} className="text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          onKeyDown={onKey}
          aria-label="Search or ask Nelio AI"
          placeholder="Search or ask Nelio AI"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          className="min-h-8 grow border-0 bg-transparent text-base text-text outline-none placeholder:text-muted"
        />
        <kbd className="hidden rounded-lg bg-surface-2 px-2 py-0.5 font-body text-xs text-muted md:inline">Esc</kbd>
      </div>
      <div id="palette-results" ref={resultsRef} className="flex flex-col gap-4">
        {term ? (
          results.length ? section("Results", results, 0) : (
            <EmptyState illustration="search" width={160} title={`Nothing called “${q.trim()}”`} text="Try a page or workspace name." />
          )
        ) : (
          <>
            {section("Quick actions", actions, 0)}
            {section("Recent", recentEntries, actions.length)}
          </>
        )}
      </div>
    </ResponsiveDialog>
  );
}
