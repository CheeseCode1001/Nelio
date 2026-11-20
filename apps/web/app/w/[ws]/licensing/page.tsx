import type { Metadata } from "next";
import { Marketplace } from "@/components/licensing/marketplace";
import { loadMarketplace, readFilters } from "@/lib/licensing";
import { requireLicensing } from "./access";

export const metadata: Metadata = { title: "Licensing marketplace" };

/** LI-01 Licensing marketplace. Filters live in the address so results can be shared and reloaded. */
export default async function MarketplaceRoute({ params, searchParams }: { params: Promise<{ ws: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ ws }, sp] = await Promise.all([params, searchParams]);
  const { hrefs } = await requireLicensing(ws);
  const d = await loadMarketplace(readFilters(sp));
  return <Marketplace d={d} hrefs={{ mine: hrefs.mine, sourceBase: hrefs.sourceBase }} />;
}
