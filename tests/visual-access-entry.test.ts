import { isValidElement, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import legacy from "./fixtures/demo-legacy-navigation.json";

const mocks = vi.hoisted(() => ({ push: vi.fn(), login: vi.fn(), register: vi.fn(), google: vi.fn(), reset: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock("@/client/auth/service", () => ({ login: mocks.login, register: mocks.register, loginWithGoogle: mocks.google, resetPassword: mocks.reset }));
import { VisualAccessForm } from "@/features/landing/VisualAccessForm";

type Node = ReactElement<{ children?: ReactNode; className?: string; onClick?: () => void; onSubmit?: (event: unknown) => void }>;
function nodes(value: ReactNode): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!isValidElement(value)) return [];
  const node = value as Node;
  return [node, ...nodes(node.props.children)];
}
beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllGlobals(); });

it.each(["signup", "login"] as const)("Google opens the %s preview without OAuth, credentials or progress changes", initialMode => {
  const stored = JSON.stringify(legacy.some.beforeSend);
  const storage = { getItem: vi.fn(() => stored), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
  const request = vi.fn();
  vi.stubGlobal("localStorage", storage); vi.stubGlobal("fetch", request);
  const tree = nodes(VisualAccessForm({ initialMode }));
  tree.find(node => node.props.className === "signup-google")!.props.onClick!();
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/dashboard");
  expect(mocks.google).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
  expect(storage.setItem).not.toHaveBeenCalled(); expect(storage.removeItem).not.toHaveBeenCalled(); expect(storage.clear).not.toHaveBeenCalled();
});

it.each(["signup", "login"] as const)("email form opens the %s preview without reading or sending entered values", initialMode => {
  const request = vi.fn(); vi.stubGlobal("fetch", request);
  const preventDefault = vi.fn();
  const tree = nodes(VisualAccessForm({ initialMode }));
  const currentTarget = new Proxy({}, { get() { throw new Error("Test entry must not read credentials"); } });
  tree.find(node => node.type === "form")!.props.onSubmit!({ preventDefault, currentTarget });
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/dashboard");
  expect(mocks.login).not.toHaveBeenCalled(); expect(mocks.register).not.toHaveBeenCalled(); expect(mocks.reset).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});
