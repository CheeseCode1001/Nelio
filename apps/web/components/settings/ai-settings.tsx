"use client";

import { CAPTION_LANGUAGES, QUALITY_LABEL, type Quality } from "@nelio/domain";
import { Banner, Button, Card, CardHead, Illustration, Motion, PageHead, SelectField, Sk, Switch, Ghost } from "@nelio/ui";
import { useRouter } from "next/navigation";
import { toast } from "@/components/feedback/toaster";
import { useState, useTransition } from "react";
import { saveAiSettingsAction } from "@/lib/actions/settings";

export interface AiSettings { quality: Quality; language: string; suggestPostTimes: boolean }

/** ST-07 AI & processing: workspace defaults for new uploads and Nelio AI. */
export function AiSettingsPage({ slug, saved, canEdit, aiReady }: { slug?: string; saved: AiSettings; canEdit: boolean; aiReady: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const set = (patch: Partial<AiSettings>) => {
    setV((x) => ({ ...x, ...patch }));
  };
  const save = () => {
    if (!slug) return;
    setError(null);
    start(async () => {
      const r = await saveAiSettingsAction(slug, v);
      if (!r.ok) return setError(r.error);
      toast.success("Saved", { description: "New uploads start from these defaults." });
      router.refresh();
    });
  };

  return (
    <Motion className="flex flex-col gap-5">
      <div data-enter="" className="flex flex-col gap-5">
        <PageHead eyebrow="Settings" title="AI & processing" actions={<Button onClick={save} loading={pending} disabled={!dirty || !canEdit}>Save</Button>} />
        <section className="flex flex-wrap items-center gap-5 rounded-panel bg-ai-tint p-6">
          <Illustration name="strategist" width={180} />
          <div className="min-w-0 flex-[1_1_240px]">
            <h2 className="m-0 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text">Nelio AI</h2>
            <p className="m-0 mt-1 text-[15px] leading-[1.55] text-text">Plans, writes, ranks moments and checks quality across your workspace.</p>
            {!aiReady ? <p className="m-0 mt-2 text-[13px] font-semibold text-ai-text">Not switched on for this deployment yet. Nothing is sent and no credits are used.</p> : null}
          </div>
        </section>
        {error ? <Banner tone="err" title="That didn’t work" text={error} /> : null}
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

/** ST-07 Loading: the settings themselves, ghosted. */
export function AiSettingsLoading() {
  return <Ghost><AiSettingsPage saved={{ quality: "balanced", language: "en", suggestPostTimes: true }} canEdit aiReady /></Ghost>;
}
