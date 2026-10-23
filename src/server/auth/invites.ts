import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const INVITE_CODES_COLLECTION = "invite_codes";
export const DEFAULT_INVITE_EXPIRY_DAYS = 30;

export function normalizeSecureInviteCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function hashInviteCode(value: string) {
  return createHash("sha256").update(normalizeSecureInviteCode(value)).digest("hex");
}

export function getHashedInviteDocumentId(codeHash: string) {
  return `sha256_${codeHash}`;
}

export function generateSecureInviteCode() {
  const entropy = randomBytes(8).toString("hex").toUpperCase();
  return `BS-${entropy.slice(0, 8)}-${entropy.slice(8)}`;
}

export function getInviteCodeLastFour(value: string) {
  const normalized = normalizeSecureInviteCode(value);
  return normalized.slice(-4);
}

export function getMaskedInviteCode(lastFour: string | undefined) {
  return `BS-••••-${lastFour?.slice(-4).toUpperCase() || "••••"}`;
}

export function timestampLikeToMillis(value: unknown): number | null {
  if (value && typeof value === "object" && "toMillis" in value) {
    const toMillis = (value as { toMillis?: unknown }).toMillis;
    if (typeof toMillis === "function") {
      const result = Number(toMillis.call(value));
      return Number.isFinite(result) ? result : null;
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
