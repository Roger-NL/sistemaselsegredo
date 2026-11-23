import { describe, expect, it, vi } from "vitest";
import config from "../next.config";

function networkSources(policy: string, directive: string) {
  const rule = policy.split(";").map(value => value.trim()).find(value => value.startsWith(`${directive} `));
  return rule?.split(/\s+/).slice(1).filter(value => value.startsWith("https:") || value.startsWith("wss:")) ?? [];
}

describe("authentication after client-side navigation", () => {
  it("keeps Firebase and Google reachable from catalogue, lesson and account documents", async () => {
    const headers = await config.headers!();
    const policies = headers.flatMap(route => route.headers.filter(header => header.key === "Content-Security-Policy").map(header => ({ source: route.source, value: header.value })));
    const app = policies.find(policy => policy.source === "/:path*")!;
    const requiredSources = {
      "connect-src": ["https://*.googleapis.com", "https://*.firebaseapp.com"],
      "script-src": ["https://accounts.google.com", "https://apis.google.com"],
      "frame-src": ["https://accounts.google.com", "https://*.firebaseapp.com"],
    };
    expect(app).toBeDefined();
    for (const source of ["/", "/first-day", "/dashboard", "/comecar", "/adm/entrar"]) {
      const policy = policies.find(policy => policy.source === source) ?? app;
      for (const [directive, required] of Object.entries(requiredSources)) {
        // Soft navigation does not replace the document's security policy.
        expect(networkSources(policy.value, directive), source)
          .toEqual(expect.arrayContaining([...new Set([...required, ...networkSources(app.value, directive)])]));
      }
    }
  });

  it("permits character WebAssembly in production without enabling JavaScript eval", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    try {
      const { default: productionConfig } = await import("../next.config");
      const policies = (await productionConfig.headers!()).flatMap(route =>
        route.headers.filter(header => header.key === "Content-Security-Policy").map(header => header.value));
      expect(policies.length).toBeGreaterThan(0);
      for (const policy of policies) {
        const script = policy.split(";").map(value => value.trim()).find(value => value.startsWith("script-src "))!;
        expect(script.split(/\s+/)).toContain("'wasm-unsafe-eval'");
        expect(script.split(/\s+/)).not.toContain("'unsafe-eval'");
      }
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it("retains an explicit authentication allowlist instead of permitting arbitrary origins", async () => {
    const headers = await config.headers!();
    for (const route of headers) {
      const policy = route.headers.find(header => header.key === "Content-Security-Policy")?.value;
      if (!policy) continue;
      for (const directive of ["connect-src", "script-src", "frame-src"]) {
        const rule = policy.split(";").map(value => value.trim()).find(value => value.startsWith(`${directive} `))!;
        expect(rule.split(/\s+/)).not.toContain("*");
        expect(rule.split(/\s+/)).not.toContain("https:");
      }
    }
  });
});
