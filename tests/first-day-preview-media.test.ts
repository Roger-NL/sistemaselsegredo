import { NextRequest } from "next/server";
import { afterEach, expect, it, vi } from "vitest";
import { GET } from "@/app/first-day/[...asset]/route";

const path = ["art-v1", "janela.webp"];

function getMedia(asset = path) {
  const request = new NextRequest(`https://preview.example/first-day/${asset.join("/")}`, {
    headers: { Range: "bytes=0-3", Cookie: "session=example", Authorization: "Bearer browser" },
  });
  return GET(request, { params: Promise.resolve({ asset }) });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("proxies a preview range from published media without forwarding browser credentials", async () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("FIRST_DAY_READ_WRITE_TOKEN", undefined);
  const fetchMedia = vi.fn<typeof fetch>().mockResolvedValue(new Response("RIFF", {
    status: 206, headers: { "Content-Type": "image/webp", "Content-Range": "bytes 0-3/58024" },
  }));
  vi.stubGlobal("fetch", fetchMedia);
  const response = await getMedia();
  const [url, init] = fetchMedia.mock.calls[0];
  expect(url).toBe("https://www.basedspeak.com/first-day/art-v1/janela.webp");
  expect(Array.from(new Headers(init?.headers))).toEqual([["range", "bytes=0-3"]]);
  expect(response.status).toBe(206);
  expect(response.headers.get("content-range")).toBe("bytes 0-3/58024");
  expect(await response.text()).toBe("RIFF");
});

it("does not proxy unrecognized paths or fall back to the public site in production", async () => {
  vi.stubEnv("FIRST_DAY_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("VERCEL_ENV", "preview");
  const fetchMedia = vi.fn();
  vi.stubGlobal("fetch", fetchMedia);
  expect((await getMedia(["unknown.txt"])).status).toBe(404);
  vi.stubEnv("VERCEL_ENV", "production");
  expect((await getMedia()).status).toBe(503);
  expect(fetchMedia).not.toHaveBeenCalled();
});
