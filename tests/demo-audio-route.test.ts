import { afterEach, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/demo/audio/route";
afterEach(() => vi.unstubAllGlobals());
it("keeps the retired audio endpoint closed without fetching, synthesis or credential disclosure", async () => {
  const network = vi.fn(() => { throw new Error("No network allowed"); }); vi.stubGlobal("fetch", network);
  for (const method of [GET, POST]) for (const body of [null, { text: "arbitrary", voiceId: "override" }, { audioUrl: "http://169.254.169.254/" }]) {
    const request = new Request("http://localhost/api/demo/audio", { method: "POST", headers: { origin: "https://foreign.example", "content-type": "application/json" }, body: JSON.stringify(body) });
    const response = await Reflect.apply(method, undefined, [request]);
    expect(response.status).toBe(410); expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "API_RETIRED", message: "Este recurso foi aposentado." });
  }
  expect(network).not.toHaveBeenCalled();
});
