"use client";

import { Banner, Button, ButtonLink, Heading, Illustration, Motion, Text } from "@nelio/ui";
import { useState, useTransition } from "react";
import { registerInterestAction } from "@/lib/actions/content";

/** CS-03 Original AI video: honest gated state until a video partner is switched on (blocker B-09). */
export function AiVideoPage({ slug, hrefs, interested = false }: { slug?: string; hrefs: { content: string; studio: string }; interested?: boolean }) {
  const [on, setOn] = useState(interested);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const notify = () => {
    if (!slug) return setOn(true);
    start(async () => {
      const r = await registerInterestAction(slug, "ai_video");
      if (!r.ok) return setError(r.error);
      setOn(true);
    });
  };
  return (
    <Motion className="flex flex-col gap-6">
      <div data-enter="" className="flex flex-col gap-6">
        <header>
          <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
            <a href={hrefs.content} className="tap-target text-muted no-underline hover:text-text">Content Studio</a>
          </nav>
          <h1 className="m-0 font-display text-[29px] font-extrabold leading-[1.08] tracking-[-0.03em] text-text md:text-[36px]">Original AI video</h1>
        </header>
        {error ? <Banner tone="err" title="That didn’t work" text={error} /> : null}
        <div className="flex flex-col items-center gap-3.5 rounded-panel border-2 border-dashed border-border bg-surface-1 px-6 pb-11 pt-10 text-center">
          <Illustration name="aivideo" width={300} />
          <Heading size={26} as="h2">Original AI video is coming later</Heading>
          <Text size={15} className="max-w-[460px]">Generating new video from a prompt needs a specialist video partner we haven’t switched on yet. Clipping, editing and captions all work today.</Text>
          <div className="flex flex-wrap justify-center gap-2.5">
            {on ? <Button variant="cta" icon="check" disabled>We’ll let you know</Button> : <Button variant="cta" arrow onClick={notify} loading={pending}>Notify me</Button>}
            <ButtonLink href={hrefs.studio} variant="secondary">Go to Clipping Studio</ButtonLink>
          </div>
        </div>
      </div>
    </Motion>
  );
}
