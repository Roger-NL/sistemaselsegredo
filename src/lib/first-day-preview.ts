import { createHash, timingSafeEqual } from "node:crypto";

export const firstDayPreviewCookie = "__Host-first-day-preview";
export const firstDayPreviewPath = "/dev/first-day";
export const firstDayPrivateHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function isPreviewKey(value: string | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function matches(value: string | undefined, expected: string) {
  return isPreviewKey(value) && timingSafeEqual(Buffer.from(value, "hex"), Buffer.from(expected, "hex"));
}

function cookieValue(token: string) {
  return createHash("sha256").update(`first-day-preview:${token}`).digest("hex");
}

export function redeemFirstDayPreview(key: string | undefined) {
  const token = process.env.FIRST_DAY_PREVIEW_TOKEN;
  return isPreviewKey(token) && matches(key, token) ? cookieValue(token) : null;
}

export function hasFirstDayPreviewAccess(cookie: string | undefined) {
  const token = process.env.FIRST_DAY_PREVIEW_TOKEN;
  return isPreviewKey(token) && matches(cookie, cookieValue(token));
}
