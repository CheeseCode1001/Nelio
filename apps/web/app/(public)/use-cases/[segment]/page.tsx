import { Bubble, ButtonLink, Card, CardTitle, Illustration, Text, type IconName, type Tone } from "@nelio/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Big, Highlight, Section } from "@/components/public/blocks";

export const metadata: Metadata = { title: "Nelio for agencies" };

const FEATURES: { icon: IconName; tone: Tone; title: string; text: string }[] = [
  { icon: "grid", tone: "blue", title: "Client workspaces", text: "Fully isolated accounts, content, licenses and spend." },
  { icon: "check", tone: "warn", title: "Client approval portal", text: "Clients approve each platform from their phone." },
  { icon: "users", tone: "ai", title: "Team roles", text: "Owners, admins, managers, editors, viewers, client approvers." },
  { icon: "list", tone: "lime", title: "Audit log", text: "Who approved what, which revision, when." },
  { icon: "wallet", tone: "ok", title: "Spend limits per client", text: "Work pauses instead of overspending." },
  { icon: "chart", tone: "blue", title: "Cross-client overview", text: "What’s waiting on whom, across clients." },
];

/**
 * M-03 Use cases. The board draws Agencies; Creators and Businesses have no approved copy yet (B-16), so their
 * addresses are not live and the segment tabs are left out until they do.
 */
export default async function UseCasePage({ params }: { params: Promise<{ segment: string }> }) {
  const { segment } = await params;
  if (segment !== "agencies") notFound();
  return (
    <>
      <Section>
        <div className="flex flex-wrap items-center gap-10">
          <div data-enter="" className="flex flex-[1_1_520px] flex-col gap-5">
            <Big size={64}>Run every client <Highlight>from one place</Highlight></Big>
            <p className="m-0 text-[17px] leading-[1.55] text-muted md:text-[19px]">Separate client workspaces, client logins and per-platform approvals, with an audit trail for every decision.</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/signup" variant="cta" size="lg" arrow>Start agency trial</ButtonLink>
            </div>
          </div>
          <div className="relative flex flex-[1_1_420px] justify-center">
            <Illustration name="clients" width={440} />
          </div>
        </div>
      </Section>
      <Section tone="s2">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] md:gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} data-reveal="">
              <Card className="h-full md:!p-6">
                <Bubble icon={f.icon} tone={f.tone} size={52} />
                <CardTitle size={20}>{f.title}</CardTitle>
                <Text>{f.text}</Text>
              </Card>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

export function generateStaticParams() {
  return [{ segment: "agencies" }];
}
