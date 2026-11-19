"use client";

import { CAPTION_LANGUAGES, QUALITY_LABEL, type Quality } from "@nelio/domain";
import { Banner, Button, Card, CardHead, Illustration, Motion, PageHead, SelectField, Sk, Switch } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAiSettingsAction } from "@/lib/actions/settings";

export interface AiSettings { quality: Quality; language: string; suggestPostTimes: boolean }

/** ST-07 AI & processing: workspace defaults for new uploads and Nelio AI. */
export function AiSettingsPage({ slug, saved, canEdit, aiReady }: { slug?: string; saved: AiSettings; canEdit: boolean; aiReady: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const set = (patch: Partial<AiSettings>) => {
    setDone(false);
    setV((x) => ({ ...x, ...patch }));
  };
  const save = () => {
    if (!slug) return;
    setError(null);
    start(async () => {
      const r = await saveAiSettingsAction(slug, v);
      if (!r.ok) return setError(r.error);
      setDone(true);
      router.refresh();
    });
  };

  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <PageHead eyebrow="Settings" title="AI & processing" actions={<Button onClick={save} loading={pending} disabled={!dirty || !canEdit}>Save</Button>} />
        <section className="flex flex-wrap items-center gap-5 rounded-panel bg-ai-tint p-6">
          <Illustration name="strategist" width={180} />
          <div className="min-w-0 flex-[1_1_240px]">
            <h2 className="m-0 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">Nelio AI</h2>
            <p className="m-0 mt-1 text-[15px] leading-[1.55] text-text">Plans, writes, ranks moments and checks quality across your workspace.</p>
            {!aiReady ? <p className="m-0 mt-2 text-[13px] font-semibold text-ai-text">Not switched on for this deployment yet. Nothing is sent and no credits are used.</p> : null}
          </div>
        </section>
        {error ? <Banner tone="err" title="That didn’t work" text={error} /> : done ? <Banner tone="ok" title="Saved" text="New uploads start from these defaults." /> : null}
        {!canEdit ? <Banner tone="blue" title="View only" text="Ask a workspace owner to change these defaults." /> : null}
        <Card>
          <CardHead title="Defaults" />
          <SelectField
            label="Transcription quality"
            name="quality"
            value={v.quality}
            disabled={!canEdit}
            onChange={(e) => set({ quality: e.target.value as Quality })}
            options={(["fast", "balanced", "high"] as const).map((q) => ({ value: q, label: QUALITY_LABEL[q] }))}
            hint="Fast is cheapest. High quality is best for accents, music and noise."
          />
          <SelectField label="Caption language" name="language" value={v.language} disabled={!canEdit} onChange={(e) => set({ language: e.target.value })} options={CAPTION_LANGUAGES.map((l) => ({ value: l.value, label: l.label }))} />
          <Switch id="suggest-times" label="Let Nelio AI suggest posting times" checked={v.suggestPostTimes} disabled={!canEdit} onChange={(next) => set({ suggestPostTimes: next })} />
        </Card>
      </div>
    </Motion>
  );
}

export function AiSettingsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2"><Sk w={70} h={12} /><Sk w={260} h={36} /></div>
      <Sk h={183} r={32} />
      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-1 p-5 shadow-card"><Sk w="20%" h={16} /><Sk h={48} r={14} /><Sk h={48} r={14} /><Sk w="50%" h={20} /></div>
      <span className="sr-only" role="status">Loading settings…</span>
    </div>
  );
}
