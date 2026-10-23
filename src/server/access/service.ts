import "server-only";

/** Financial entitlement only. Does not read or write course progress. */
export function resolvePremiumExpiresAtIso(now = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt.toISOString();
}

export function buildPremiumAccessUpdate(input: {
  inviteCodeUsed?: string;
  paymentId?: string;
  purchasedPlan?: "lifetime";
  activatedAtIso?: string;
  expiresAtIso?: string;
}) {
  return {
    subscriptionStatus: "premium" as const,
    subscriptionExpiresAt: input.expiresAtIso ?? resolvePremiumExpiresAtIso(),
    premiumActivatedAt: input.activatedAtIso ?? new Date().toISOString(),
    ...(input.inviteCodeUsed ? { inviteCodeUsed: input.inviteCodeUsed } : {}),
    ...(input.paymentId ? { paymentId: input.paymentId } : {}),
    ...(input.purchasedPlan ? { purchasedPlan: input.purchasedPlan } : {}),
  };
}
