import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

const harness = vi.hoisted(() => ({ slot: 0, values: [] as unknown[], reset: vi.fn() }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = harness.slot++;
    return [harness.values[slot] ?? initial, (value: unknown) => { harness.values[slot] = value; }];
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/client/auth/service", () => ({ resetPassword: harness.reset }));
import { AdminLogin } from "@/features/admin/AdminLogin";

function recoveryButton(node: unknown): ReactElement<{ onClick: () => void }> | undefined {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.map(recoveryButton).find(Boolean);
  const element = node as ReactElement<{ children?: unknown; onClick: () => void }>;
  if (element.type === "button" && element.props.children === "Esqueci minha senha") return element;
  return recoveryButton(element.props?.children);
}

beforeEach(() => {
  harness.slot = 0;
  harness.values = ["qa@example.test", "", false, "", ""];
  harness.reset.mockReset();
});

describe("admin recovery acknowledgement (simulated hooks and SDK)", () => {
  it("shows a conditional acknowledgement after the recovery service accepts the request", async () => {
    harness.reset.mockResolvedValue({ success: true });
    recoveryButton(AdminLogin())!.props.onClick();
    await vi.waitFor(() => expect(harness.values[4]).toContain("Se houver uma conta com este e-mail"));
    expect(harness.reset).toHaveBeenCalledWith("qa@example.test");
    expect(harness.values[4]).toContain("spam");
    expect(harness.values[2]).toBe(false);
  });
  it("keeps the acknowledgement empty when the request fails", async () => {
    harness.reset.mockResolvedValue({ success: false, error: "Falha de conexão." });
    recoveryButton(AdminLogin())!.props.onClick();
    await vi.waitFor(() => expect(harness.values[3]).toBe("Falha de conexão."));
    expect(harness.values[4]).toBe("");
    expect(harness.values[2]).toBe(false);
  });
});
