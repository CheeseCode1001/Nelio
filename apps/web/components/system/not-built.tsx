import { Banner, PageHead } from "@nelio/ui";

/**
 * Development-only stand-in for a screen whose milestone has not landed yet (traceability decision T-5).
 * It is not part of the approved design and never ships: every use is replaced by the real screen,
 * and the public launch is after Milestone 10.
 */
export function NotBuiltYet({ title, screen, milestone }: { title: string; screen: string; milestone: number }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHead title={title} />
      <Banner tone="blue" title={`${screen} is built in Milestone ${milestone}`} text="You’re signed in and your access was checked. This screen’s design is approved; its build hasn’t started." />
    </div>
  );
}
