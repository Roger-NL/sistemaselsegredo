import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AsaasTransportError, createPixPayment, getPixQrCode } from "@/server/integrations/asaas";
import { PaymentsDisabledError } from "@/server/payments/config";

const originalEnvironment = {
  baseUrl: process.env.ASAAS_BASE_URL,
  apiKey: process.env.ASAAS_API_KEY,
  userAgent: process.env.ASAAS_USER_AGENT,
  betaFreeMode: process.env.BETA_FREE_MODE,
};

function restoreEnvironmentVariable(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

beforeEach(() => {
  process.env.BETA_FREE_MODE = "false";
});

afterEach(() => {
  vi.unstubAllGlobals();
  restoreEnvironmentVariable("ASAAS_BASE_URL", originalEnvironment.baseUrl);
  restoreEnvironmentVariable("ASAAS_API_KEY", originalEnvironment.apiKey);
  restoreEnvironmentVariable("ASAAS_USER_AGENT", originalEnvironment.userAgent);
  restoreEnvironmentVariable("BETA_FREE_MODE", originalEnvironment.betaFreeMode);
});

describe("Asaas client safeguards", () => {
  it("blocks a direct payment creation call while the free beta is active", async () => {
    process.env.BETA_FREE_MODE = "true";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createPixPayment("cus_123", 297, "BasedSpeak PRO", "user_123")
    ).rejects.toBeInstanceOf(PaymentsDisabledError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the official sandbox URL, environment-matched key and required headers", async () => {
    process.env.ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
    process.env.ASAAS_API_KEY = "$aact_hmlg_test-key";
    delete process.env.ASAAS_USER_AGENT;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        encodedImage: "base64-image",
        payload: "pix-copy-paste",
        expirationDate: "2026-07-19T23:59:59Z",
      }), { status: 200, headers: { "Content-Type": "application/json" } })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPixQrCode("pay_123")).resolves.toMatchObject({
      expirationDate: "2026-07-19T23:59:59Z",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api-sandbox.asaas.com/v3/payments/pay_123/pixQrCode");
    expect(init.headers).toMatchObject({
      access_token: "$aact_hmlg_test-key",
      "User-Agent": expect.stringContaining("BasedSpeak"),
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("rejects a production key against the sandbox endpoint before making a request", async () => {
    process.env.ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
    process.env.ASAAS_API_KEY = "$aact_prod_wrong-environment";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPixQrCode("pay_123")).rejects.toThrow(
      "ASAAS_API_KEY nao pertence ao ambiente sandbox."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("classifies network failures separately from provider API responses", async () => {
    process.env.ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";
    process.env.ASAAS_API_KEY = "$aact_hmlg_test-key";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    await expect(getPixQrCode("pay_123")).rejects.toBeInstanceOf(AsaasTransportError);
  });
});
