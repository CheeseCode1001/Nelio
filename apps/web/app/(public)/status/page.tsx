import { Banner, Chip, Row, RowList, type IconName, type Tone } from "@nelio/ui";
import type { Metadata } from "next";
import { Big, Section } from "@/components/public/blocks";

export const metadata: Metadata = { title: "System status" };
export const dynamic = "force-dynamic";

type State = "operational" | "in_development" | "coming_later";
const LOOK: Record<State, { label: string; tone: Tone; icon: IconName }> = {
  operational: { label: "Operational", tone: "ok", icon: "check" },
  in_development: { label: "In development", tone: "blue", icon: "clock" },
  coming_later: { label: "Coming later", tone: "neutral", icon: "clock" },
};

/**
 * What is true today. The web app answers this request, so it is operational. Processing, rendering and
 * notifications are built in Milestones 3 and 4; platforms follow decision D-06. This list is updated as each
 * service ships and becomes monitored (Milestone 9 brings live health checks and the 90-day uptime history).
 */
const SERVICES: [string, State][] = [
  ["Web app", "operational"],
  ["Video processing", "in_development"],
  ["Rendering", "in_development"],
  ["Notifications", "in_development"],
  ["YouTube publishing", "in_development"],
  ["Instagram publishing", "in_development"],
  ["TikTok publishing", "coming_later"],
  ["Facebook publishing", "coming_later"],
];

/**
 * M-08 Status. The board also draws a 90-day uptime chart and an incident banner; both need real monitoring
 * data, so the chart is left out until Milestone 9 and a banner appears only when an incident is posted
 * (STATUS_NOTICE_TITLE / STATUS_NOTICE_TEXT).
 */
export default function StatusPage() {
  const noticeTitle = process.env.STATUS_NOTICE_TITLE;
  return (
    <Section>
      <div data-enter="" className="flex flex-col gap-7">
        <Big size={56}>System status</Big>
        {noticeTitle ? <Banner tone="warn" title={noticeTitle} text={process.env.STATUS_NOTICE_TEXT} /> : null}
        <RowList>
          {SERVICES.map(([name, st]) => (
            <Row key={name} title={name} right={<Chip tone={LOOK[st].tone} icon={LOOK[st].icon}>{LOOK[st].label}</Chip>} />
          ))}
        </RowList>
      </div>
    </Section>
  );
}
