/**
 * Plan entitlements from decision D-10 and the pricing page (M-04). Provisional until the cost benchmark;
 * billing (MS 8) enforces payment, these limits are enforced from MS 3 on. null = custom (Enterprise).
 */
export type PlanId = "free" | "trial" | "starter" | "creator_pro" | "business" | "agency" | "enterprise";

export const PLANS: Record<PlanId, { label: string; agents: number | null; socialAccounts: number | null }> = {
  free: { label: "Free", agents: 1, socialAccounts: 1 },
  trial: { label: "Trial", agents: 1, socialAccounts: 1 },
  starter: { label: "Starter", agents: 2, socialAccounts: 3 },
  creator_pro: { label: "Creator Pro", agents: 5, socialAccounts: 6 },
  business: { label: "Business", agents: 10, socialAccounts: 12 },
  agency: { label: "Agency", agents: 25, socialAccounts: 40 },
  enterprise: { label: "Enterprise", agents: null, socialAccounts: null },
};

/** The next plan up that allows more agents, for "upgrade to Business for 10" copy. */
export function nextPlanForAgents(plan: PlanId): { id: PlanId; label: string; agents: number | null } | null {
  const order: PlanId[] = ["free", "starter", "creator_pro", "business", "agency", "enterprise"];
  const current = PLANS[plan].agents ?? Infinity;
  for (const id of order) {
    const a = PLANS[id].agents ?? Infinity;
    if (a > current) return { id, label: PLANS[id].label, agents: PLANS[id].agents };
  }
  return null;
}

/** Agents that count toward the limit: everything except stopped agents. */
export const COUNTS_TOWARD_AGENT_LIMIT = ["active", "paused", "budget_reached"] as const;
