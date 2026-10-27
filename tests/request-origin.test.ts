import { describe, expect, it } from "vitest";
import { hasSameOrigin } from "@/server/http/request";
describe("same-origin requests behind Next's normalized URL", () => {
  it("accepts the actual Host with a normalized localhost URL", () => {
    expect(hasSameOrigin(new Request("http://localhost:3000/api/test", { headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" } }))).toBe(true);
    expect(hasSameOrigin(new Request("http://localhost/api/test", { headers: { host: "www.basedspeak.com", "x-forwarded-proto": "https", origin: "https://www.basedspeak.com" } }))).toBe(true);
  });
  it("rejects foreign, missing, null and forged forwarded-host origins", () => {
    for (const origin of ["https://attacker.test", "null", "https://basedspeak.com/path", ""]) expect(hasSameOrigin(new Request("https://basedspeak.com/api/test", { headers: { host: "basedspeak.com", "x-forwarded-host": "attacker.test", origin } }))).toBe(false);
  });
  it("preserves exact origin checks without proxy headers", () => {
    expect(hasSameOrigin(new Request("https://basedspeak.test/api/test", { headers: { origin: "https://basedspeak.test" } }))).toBe(true);
    expect(hasSameOrigin(new Request("https://basedspeak.test/api/test", { headers: { origin: "http://basedspeak.test" } }))).toBe(false);
  });
});
