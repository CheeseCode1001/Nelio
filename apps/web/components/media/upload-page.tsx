import type { Quality } from "@nelio/domain";
import { PageHead } from "@nelio/ui";
import Link from "next/link";
import { UploadForm, type UploadPreview } from "./upload-form";

/** CL-02 Upload page frame: breadcrumb, title and the form. */
export function UploadPage({ slug, defaults, libraryHref, studioBase, licensesHref, preview }: { slug?: string; defaults: { quality: Quality; language: string }; libraryHref: string; studioBase: string; licensesHref?: string; preview?: UploadPreview }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-[13px] font-semibold text-muted">
          <Link href={libraryHref} className="tap-target text-muted no-underline hover:text-text">Clipping Studio</Link> › Upload
        </nav>
        <PageHead title="Add a video" />
      </div>
      <UploadForm slug={slug} defaults={defaults} preview={preview} studioBase={studioBase} licensesHref={licensesHref} />
    </div>
  );
}
