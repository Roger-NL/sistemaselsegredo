import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

type Data = Record<string, unknown>;
type Ref = { key: string; get: () => Promise<{ exists: boolean; data: () => Data | undefined; ref: Ref }>; set: (data: Data) => Promise<void> };
const store = vi.hoisted(() => ({ docs: new Map<string, Data>(), writes: [] as string[], collections: [] as string[], failUserWrite: false, payment: vi.fn() }));
function ref(key: string): Ref {
  const reference: Ref = {
    key,
    get: async () => ({ exists: store.docs.has(key), data: () => store.docs.get(key), ref: reference }),
    set: async data => {
      if (key.startsWith("users/") && store.failUserWrite) throw new Error("TEST_WRITE_FAILED");
      store.docs.set(key, { ...store.docs.get(key), ...data }); store.writes.push(key);
    },
  };
  return reference;
}
vi.mock("@/server/firebase", () => ({ getAdminDb: () => ({
  collection: (name: string) => {
    store.collections.push(name);
    if (!["users", "payment_attempts", "checkout_intents", "asaas_webhook_events"].includes(name)) throw new Error(`UNEXPECTED_COLLECTION:${name}`);
    return { doc: (id: string) => ref(`${name}/${id}`) };
  },
  runTransaction: async (callback: (tx: { get: (r: Ref) => ReturnType<Ref["get"]>; set: (r: Ref, d: Data) => Promise<void> }) => Promise<unknown>) => callback({ get: r => r.get(), set: (r, d) => r.set(d) }),
}) }));
vi.mock("@/server/integrations/asaas", () => ({
  AsaasApiError: class extends Error {}, getPayment: store.payment,
  isPaymentPaid: (status: string) => ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status),
}));
import { handleAsaasWebhook, verifyPaymentStatus } from "@/server/payments/service";
import type { AsaasPayment } from "@/server/integrations/asaas";
const payment = { id: "pay-test", customer: "customer-test", billingType: "PIX", status: "RECEIVED", value: 297, dueDate: "2026-01-01", externalReference: "test-user" } as AsaasPayment;

beforeEach(() => {
  store.payment.mockClear();
  store.docs.clear(); store.writes.length = 0; store.collections.length = 0; store.failUserWrite = false;
  store.docs.set("users/test-user", { subscriptionStatus: "free", approvedPillar: 5, progressSnapshot: { preserved: true } });
  store.docs.set("payment_attempts/pay-test", { id: "pay-test", userId: "test-user", plan: "lifetime", paymentMethod: "PIX", status: "PENDING", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" });
  store.payment.mockResolvedValue(payment); vi.stubEnv("BETA_FREE_MODE", "false");
});
afterEach(() => vi.unstubAllEnvs());

describe("preserved reconciliation without course dependencies", () => {
  it("grants financial entitlement and preserves historical progress untouched", async () => {
    expect(await verifyPaymentStatus("test-user", payment.id)).toMatchObject({ isPaid: true, reconciliationStatus: "paid" });
    expect(store.docs.get("users/test-user")).toMatchObject({ subscriptionStatus: "premium", premiumPaymentId: "pay-test", approvedPillar: 5, progressSnapshot: { preserved: true } });
    expect(store.collections).not.toContain("pillar_exams");
  });
  it("deduplicates a completed webhook before granting access a second time", async () => {
    const payload = { id: "event-test", event: "PAYMENT_RECEIVED", payment };
    expect(await handleAsaasWebhook(payload)).toMatchObject({ success: true, grantedAccess: true });
    const writeCount = store.writes.length;
    expect(await handleAsaasWebhook(payload)).toMatchObject({ success: true, duplicated: true });
    expect(store.writes).toHaveLength(writeCount);
    expect(store.payment).not.toHaveBeenCalled();
  });
  it("does not confirm success when persisting entitlement fails", async () => {
    store.failUserWrite = true;
    await expect(handleAsaasWebhook({ id: "event-failing", event: "PAYMENT_RECEIVED", payment })).rejects.toThrow("TEST_WRITE_FAILED");
    const event = [...store.docs.entries()].find(([key]) => key.startsWith("asaas_webhook_events/"))?.[1];
    expect(event?.processingStatus).toBe("failed");
  });
});
