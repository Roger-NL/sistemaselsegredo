import { describe, expect, it } from "vitest";
import config from "../next.config";

function networkSources(policy: string, directive: string) {
  const rule = policy.split(";").map(value => value.trim()).find(value => value.startsWith(`${directive} `));
  return rule?.split(/\s+/).slice(1).filter(value => value.startsWith("https:") || value.startsWith("wss:")) ?? [];
}

describe("authentication after client-side navigation", () => {
  it("keeps Firebase and Google reachable from documents opened on the landing or story", async () => {
    const headers = await config.headers!();
    const policies = headers.flatMap(route => route.headers.filter(header => header.key === "Content-Security-Policy").map(header => ({ source: route.source, value: header.value })));
    const app = policies.find(policy => policy.source === "/:path*")!;
    for (const source of ["/", "/demo"]) {
      const policy = policies.find(policy => policy.source === source)!;
      expect(policy).toBeDefined();
      for (const directive of ["connect-src", "script-src", "frame-src"]) {
        // Soft navigation does not replace the document's security policy.
        expect(networkSources(policy.value, directive)).toEqual(expect.arrayContaining(networkSources(app.value, directive)));
      }
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
