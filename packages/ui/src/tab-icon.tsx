/**
 * Mobile bottom-tab icons, copied from the generator's `TABIC` (lib2.py), which cannot be imported by the
 * export script. Idle: muted outline. Active: filled accent with details cut out in the surface colour.
 */
const TABIC = {
  home: ['<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-6h-5.6v6H5A1.5 1.5 0 0 1 3.5 19z"/>', ""],
  activity: ['<path d="M13 2.8 4.8 13.4h6.3l-1 7.8 8.1-10.6h-6.3z"/>', ""],
  approvals: ['<circle cx="12" cy="12" r="8.7"/>', '<path d="m8.2 12.2 2.6 2.6 5-5.2"/>'],
  calendar: ['<rect x="3.5" y="5" width="17" height="15.5" rx="3"/>', '<path d="M3.5 9.6h17M8 3v4M16 3v4"/>'],
  more: ['<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>', ""],
} as const;
export type TabName = keyof typeof TABIC;

export function TabIcon({ name, active, size = 24 }: { name: TabName; active: boolean; size?: number }) {
  const [shape, detail] = TABIC[name];
  if (active) {
    const cut = "var(--n-s1)";
    let det = detail.replaceAll("<path", `<path stroke="${cut}" stroke-width="2" fill="none"`);
    if (name === "calendar") det = `<path d="M3.5 9.6h17" stroke="${cut}" stroke-width="2"/><path d="M8 3v4M16 3v4" stroke="var(--n-acc)" stroke-width="2"/>`;
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none" fill="var(--n-acc)" stroke="var(--n-acc)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" dangerouslySetInnerHTML={{ __html: shape + det }} />;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none" fill="none" stroke="var(--n-mu)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" dangerouslySetInnerHTML={{ __html: shape + detail }} />;
}
