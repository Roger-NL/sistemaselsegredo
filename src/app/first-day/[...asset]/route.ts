import type { NextRequest } from "next/server";

const origin = "https://ljeseaqtmyrvd1ak.private.blob.vercel-storage.com";
const mediaPath = /^(?:(?:dialogue|narration)\/)?[a-z0-9-]+\.(?:jpg|mp3|wav)$/;
const versionedArtPath = /^art-v[0-9]+\/[a-z0-9-]+\.webp$/;
const mediaHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET(request: NextRequest, { params }: RouteContext<"/first-day/[...asset]">) {
  const pathname = (await params).asset.join("/");
  const versionedArt = versionedArtPath.test(pathname);
  if (!versionedArt && !mediaPath.test(pathname)) {
    return new Response(null, { status: 404, headers: mediaHeaders });
  }

  const token = process.env.FIRST_DAY_READ_WRITE_TOKEN;
  if (!token) return new Response(null, { status: 503, headers: mediaHeaders });

  const requestHeaders = new Headers({ Authorization: `Bearer ${token}` });
  const range = request.headers.get("range");
  if (range) requestHeaders.set("Range", range);

  const media = await fetch(`${origin}/first-day/${pathname}`, {
    headers: requestHeaders,
    cache: "no-store",
    redirect: "error",
    signal: request.signal,
  });
  if (!media.ok && media.status !== 416) {
    return new Response(null, { status: media.status === 404 ? 404 : 502, headers: mediaHeaders });
  }

  const responseHeaders = new Headers(mediaHeaders);
  if (versionedArt && media.status === 200) {
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  for (const name of ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"]) {
    const value = media.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(media.body, { status: media.status, headers: responseHeaders });
}
