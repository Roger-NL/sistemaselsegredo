import "server-only";

import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const RATE_LIMIT_COLLECTION = "rate_limits";

export interface RateLimitOptions {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
  cost?: number;
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}

function getRateLimitDocumentId(namespace: string, identifier: string) {
  return createHash("sha256").update(`${namespace}:${identifier}`).digest("hex");
}

export async function consumeRateLimit({
  namespace,
  identifier,
  limit,
  windowMs,
  cost = 1,
}: RateLimitOptions) {
  if (!namespace || !identifier || !Number.isFinite(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("INVALID_RATE_LIMIT_CONFIGURATION");
  }

  const normalizedCost = Math.max(1, Math.trunc(cost));
  const nowMs = Date.now();
  const ref = adminDb.collection(RATE_LIMIT_COLLECTION).doc(getRateLimitDocumentId(namespace, identifier));

  const result = await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data() as { windowStartedAtMs?: number; consumed?: number } | undefined;
    const storedWindowStart = Number(data?.windowStartedAtMs);
    const windowStartedAtMs = Number.isFinite(storedWindowStart) && nowMs - storedWindowStart < windowMs
      ? storedWindowStart
      : nowMs;
    const consumed = windowStartedAtMs === storedWindowStart && Number.isFinite(Number(data?.consumed))
      ? Math.max(0, Number(data?.consumed))
      : 0;
    const nextConsumed = consumed + normalizedCost;
    const resetAtMs = windowStartedAtMs + windowMs;

    if (nextConsumed > limit) {
      return {
        allowed: false as const,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000)),
      };
    }

    transaction.set(ref, {
      namespace,
      windowStartedAtMs,
      consumed: nextConsumed,
      limit,
      updatedAt: Timestamp.fromMillis(nowMs),
      expiresAt: Timestamp.fromMillis(resetAtMs + windowMs),
    });

    return {
      allowed: true as const,
      remaining: Math.max(0, limit - nextConsumed),
      resetAtMs,
    };
  });

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfterSeconds);
  }

  return result;
}

export function rateLimitErrorResponse(error: RateLimitError) {
  return NextResponse.json(
    { error: "RATE_LIMIT_EXCEEDED" },
    {
      status: 429,
      headers: { "Retry-After": String(error.retryAfterSeconds) },
    }
  );
}
