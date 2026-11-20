"use client";

import { CAPTION_STYLES, type CaptionStyle } from "@nelio/domain";
import { Banner, Button, Card, CardHead, Chip, EmptyState, Field, GlassChip, Icon, Motion, PageHead, SelectField, ShortFrame, Sk, cn, photoSrc, Ghost, TEXTAREA_CLASS, LABEL_CLASS } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { toast } from "@/components/feedback/toaster";
import { useState, useTransition } from "react";
import { createBrandKitAction, makeDefaultKitAction, saveBrandKitAction } from "@/lib/actions/settings";
import { SAMPLE_KIT } from "./sample";

export interface Kit { id: string; name: string; colours: string[]; captionFont: string; captionStyle: CaptionStyle; voice: string; isDefault: boolean }

/** Only the bundled caption font renders on exports today (OFL, shipped with the renderer). */
const FONTS = [{ value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" }];

function Header({ onNew, pending }: { onNew?: () => void; pending?: boolean }) {
  return <PageHead eyebrow="Workspace" title="Brand kits" sub="Agents use these for captions, overlays and writing." actions={<Button icon="plus" onClick={onNew} loading={pending} disabled={!onNew}>New kit</Button>} />;
}

const same = (a: Kit, b: Kit) => JSON.stringify(a) === JSON.stringify(b);

/** ST-06 Brand kits: Filled, Editing (unsaved), Empty and Loading, desktop and mobile. */
export function BrandKitsPage({ slug, kits, current, kitBase, preview }: { slug?: string; kits: Kit[]; current: string | null; kitBase: string; preview?: { editing?: boolean } }) {
  const router = useRouter();
  const saved = kits.find((k) => k.id === current) ?? kits[0] ?? null;
  const [kit, setKit] = useState<Kit | null>(() => (saved && preview?.editing ? { ...saved, voice: `${saved.voice} Short sentences.` } : saved));
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [creating, startCreate] = useTransition();

  const create = () => {
    if (!slug) return;
    startCreate(async () => {
      const r = await createBrandKitAction(slug);
      if (!r.ok) return setError({ text: r.error });
      router.push(`${kitBase}?kit=${r.kitId}`);
      router.refresh();
    });
  };

  if (!saved || !kit) {
    return (
      <Motion className="flex flex-col gap-5">
        <div data-enter="" className="flex flex-col gap-5">
          <Header onNew={create} pending={creating} />
          {error ? <Banner tone="err" title="That didn’t work" text={error.text} /> : null}
          <EmptyState illustration="brand" title="No brand kit yet" text="Add your colours, fonts and caption style once, and every clip and agent uses them." actions={<Button variant="cta" arrow onClick={create} loading={creating} disabled={!slug}>Create brand kit</Button>} />
        </div>
      </Motion>
    );
  }

  const dirty = !same(kit, saved);
  const set = (patch: Partial<Kit>) => {
    setError(null);
    setKit((k) => (k ? { ...k, ...patch } : k));
  };
  const save = () => {
    if (!slug) return;
    startSave(async () => {
      const r = await saveBrandKitAction(slug, kit.id, { name: kit.name, colours: kit.colours, captionStyle: kit.captionStyle, voice: kit.voice });
      if (!r.ok) return setError({ text: r.error, field: r.field });
      toast.success("Saved", { description: "New clips and agents use this kit." });
      router.refresh();
    });
  };
  const makeDefault = () => {
    if (!slug) return;
    startSave(async () => {
      const r = await makeDefaultKitAction(slug, kit.id);
      if (!r.ok) return setError({ text: r.error });
      router.refresh();
    });
  };
  const hook = kit.colours[0] ?? "#FFD43B";
  const ink = kit.colours.find((c, i) => i > 0 && /^#(0|1|2)/.test(c)) ?? "#0B0B14";

  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <Header onNew={slug ? create : undefined} pending={creating} />
        {kits.length > 1 ? (
          <nav aria-label="Brand kits" className="tab-scroll w-fit gap-0.5 self-start rounded-full border border-border bg-surface-1 p-1">
            {kits.map((k) => (
              <a key={k.id} href={`${kitBase}?kit=${k.id}`} aria-current={k.id === kit.id ? "page" : undefined} className={cn("tap-target inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 py-[9px] text-sm font-bold no-underline", k.id === kit.id ? "bg-ink text-on-ink hover:text-on-ink" : "text-muted hover:text-text")}>{k.name}</a>
            ))}
          </nav>
        ) : null}
      </div>

      <div data-enter="" className="grid grid-cols-1 gap-4 lg:[grid-template-columns:minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHead title={kit.name || "Untitled kit"} right={saved.isDefault ? <Chip tone="blue">default</Chip> : <Button variant="ghost" size="sm" onClick={makeDefault} disabled={!slug}>Make default</Button>} />
          <Field label="Kit name" name="name" value={kit.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} error={error?.field === "name" ? error.text : undefined} />
          <fieldset className="m-0 flex min-w-0 flex-wrap items-center gap-2.5 border-0 p-0">
            <legend className="sr-only">Colours</legend>
            {kit.colours.map((c, i) => (
              <span key={i} className="relative">
                <label className="block size-14 cursor-pointer rounded-2xl border-2 border-outline" style={{ background: c }}>
                  <span className="sr-only">Colour {i + 1}: {c}</span>
                  <input type="color" value={c.toLowerCase()} onChange={(e) => set({ colours: kit.colours.map((x, j) => (j === i ? e.target.value.toUpperCase() : x)) })} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                </label>
                {kit.colours.length > 1 ? (
                  <button type="button" aria-label={`Remove colour ${i + 1}`} onClick={() => set({ colours: kit.colours.filter((_, j) => j !== i) })} className="tap-target absolute -right-2 -top-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-outline bg-surface-1 text-text">
                    <Icon name="x" size={12} strokeWidth={2.6} />
                  </button>
                ) : null}
              </span>
            ))}
            {kit.colours.length < 6 ? <Button variant="ghost" size="sm" icon="plus" onClick={() => set({ colours: [...kit.colours, "#2F5BFF"] })}>Add colour</Button> : null}
          </fieldset>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Caption font" name="captionFont" value={kit.captionFont} onChange={() => {}} options={FONTS} />
            <SelectField label="Caption style" name="captionStyle" value={kit.captionStyle} onChange={(e) => set({ captionStyle: e.target.value as CaptionStyle })} options={Object.entries(CAPTION_STYLES).filter(([k]) => k !== "none").map(([value, s]) => ({ value, label: s.label }))} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="voice" className={LABEL_CLASS}>Voice &amp; tone</label>
            <textarea id="voice" value={kit.voice} maxLength={600} onChange={(e) => set({ voice: e.target.value })} placeholder="Friendly, clear, no slang. Explain like a smart friend." className={TEXTAREA_CLASS} />
          </div>
          {error && error.field !== "name" ? <Banner tone="err" title="That didn’t work" text={error.text} /> : null}
          {dirty ? <Banner tone="blue" title="Unsaved changes" text="Save to apply to all agents." action={<Button variant="secondary" size="sm" onClick={save} loading={saving}>Save</Button>} /> : null}
        </Card>

        <ShortFrame
          label="Live caption preview"
          className="mx-auto max-w-[340px] self-start"
          media={
            // eslint-disable-next-line @next/next/no-img-element -- sample photo for the preview
            <img src={photoSrc("p9")} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
          }
          hook={"lower" in CAPTION_STYLES[kit.captionStyle] ? "stop budgeting like this" : "STOP BUDGETING LIKE THIS"}
          hookStyle={{ background: hook, borderColor: ink, color: ink }}
          chips={<GlassChip icon="eye">Live caption preview</GlassChip>}
          title="Your brand kit, on a real clip"
          meta="Font, colours and caption style update as you edit"
        />
      </div>
    </Motion>
  );
}

/** ST-06 Loading: the kits page itself, ghosted. */
export function BrandKitsLoading() {
  return <Ghost><BrandKitsPage kits={[SAMPLE_KIT]} current={SAMPLE_KIT.id} kitBase="#" /></Ghost>;
}
