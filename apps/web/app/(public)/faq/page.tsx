import { Illustration } from "@nelio/ui";
import type { Metadata } from "next";
import { Big, Eyebrow, Section } from "@/components/public/blocks";
import { FaqList, type Faq } from "@/components/public/faq-list";

export const metadata: Metadata = { title: "FAQ" };

/**
 * The first two answers are the board's copy. The other four are drafted only from recorded decisions
 * (D-10, D-13, D-14, journey J-05, the no-guarantee rule) and need the product owner's review (B-16).
 */
const FAQS: Faq[] = [
  { category: "General", q: "Can Nelio post without me?", a: "Only if you turn on autonomous publishing for a specific agent, account and budget, and confirm it. It’s off by default and not available on the Free plan." },
  { category: "Platforms", q: "Which platforms work today?", a: "YouTube and Instagram are in development. TikTok and Facebook are coming later. We switch each on only after the official integration is approved." },
  { category: "Billing", q: "How do credits work?", a: "Credits pay for processing such as transcription and rendering. You see an estimate before a job starts and the actual cost after, and anything reserved but not used comes back. Paid plans can top up; nothing is ever bought automatically. Plan allowances are provisional until launch." },
  { category: "Licensing", q: "What happens when a license is revoked?", a: "New use stops at once. Scheduled posts that use the content are held and drafts are flagged. Posts already published are flagged for review, so you can take them down if needed." },
  { category: "General", q: "Do you guarantee views or monetization?", a: "No. Moment scores are estimates, and nobody can promise views, followers or eligibility for a platform’s monetization programme." },
  { category: "Billing", q: "Can I pay in naira?", a: "Prices are listed in US dollars. Where supported, you pay in naira at checkout and see the exact amount before you confirm." },
];

/** M-06 FAQ. */
export default function FaqPage() {
  return (
    <Section>
      <div className="flex flex-wrap gap-8 md:gap-12">
        <div data-enter="" className="flex flex-[1_1_360px] flex-col gap-4">
          <Eyebrow>FAQ</Eyebrow>
          <Big size={52}>Everything you need to know.</Big>
          <p className="m-0 text-base leading-[1.55] text-muted">Can’t find your answer? Our support team is a message away.</p>
          <Illustration name="search" width={300} />
        </div>
        <div className="flex-[2_1_560px]">
          <FaqList items={FAQS} />
        </div>
      </div>
    </Section>
  );
}
