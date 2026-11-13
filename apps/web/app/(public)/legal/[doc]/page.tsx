import { Banner, Chip, Small } from "@nelio/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Big, Section, SectionHeading } from "@/components/public/blocks";

const DOCS = {
  terms: { title: "Terms of Service", sections: ["1. Who we are", "2. Your content and licenses", "3. Credits and billing"] },
  privacy: { title: "Privacy Policy", sections: [] },
  "acceptable-use": { title: "Acceptable Use", sections: [] },
  "licensing-policy": { title: "Licensing Policy", sections: [] },
  takedown: { title: "Takedown requests", sections: [] },
} as const;
type DocKey = keyof typeof DOCS;

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return { title: doc in DOCS ? DOCS[doc as DocKey].title : "Legal" };
}

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

/**
 * M-07 Legal. Placeholder copy until legal review (B-06), clearly labelled as a draft, as on the board.
 * Only the Terms board shows section headings; the other documents show the placeholder alone.
 */
export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!(doc in DOCS)) notFound();
  const current = DOCS[doc as DocKey];
  return (
    <Section pad="md:py-14">
      <div className="flex flex-wrap items-start gap-8">
        <nav aria-label="Legal documents" className="flex-[1_1_260px]">
          <ul className="m-0 list-none overflow-hidden rounded-row border border-border bg-surface-1 p-0 shadow-card">
            {(Object.keys(DOCS) as DocKey[]).map((k) => (
              <li key={k} className="border-b border-border last:border-b-0">
                <Link href={`/legal/${k}`} aria-current={k === doc ? "page" : undefined} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text no-underline hover:text-text">
                  <span className="grow">{DOCS[k].title}</span>
                  {k === doc ? <Chip tone="blue">Viewing</Chip> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article data-enter="" className="flex flex-[999_1_560px] flex-col gap-3.5">
          <Banner tone="warn" title="Draft legal text" text="Placeholder copy. A lawyer must review it before launch." />
          <Big size={52}>{current.title}</Big>
          <Small>Last updated: [DATE]</Small>
          {current.sections.length ? (
            current.sections.map((h) => (
              <section key={h} className="flex flex-col gap-3.5">
                <SectionHeading size={22}>{h}</SectionHeading>
                <p className="m-0 text-[15px] leading-[1.55] text-muted">[LEGAL COPY]</p>
              </section>
            ))
          ) : (
            <p className="m-0 text-[15px] leading-[1.55] text-muted">[LEGAL COPY]</p>
          )}
        </article>
      </div>
    </Section>
  );
}
