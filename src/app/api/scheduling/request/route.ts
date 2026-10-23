import { assertOnlyKeys, readJsonObject, RequestPayloadError, requestPayloadErrorResponse } from "@/server/http/request";
import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/server/auth/principal';
import { requestLiveSessionBooking } from '@/server/scheduling/service';
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from '@/server/http/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
    });

    if (!principal) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await readJsonObject(req, 8 * 1024);
    assertOnlyKeys(body, ['userId', 'slotStart', 'slotEnd', 'notes']);
    const { userId: requestedUserId, slotStart, slotEnd, notes } = body;
    if (requestedUserId !== undefined && (typeof requestedUserId !== "string" || !requestedUserId || requestedUserId.length > 256)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    if (
      typeof slotStart !== 'string' ||
      typeof slotEnd !== 'string' ||
      (notes !== undefined && (typeof notes !== 'string' || notes.length > 2_000))
    ) {
      return NextResponse.json({ error: 'Missing booking payload.' }, { status: 400 });
    }

    if (requestedUserId && principal.role !== 'admin' && requestedUserId !== principal.uid) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const userId = principal.role === 'admin' && requestedUserId
      ? requestedUserId
      : principal.uid;

    await consumeRateLimit({
      namespace: 'scheduling-request',
      identifier: `${principal.uid}:${userId}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    const session = await requestLiveSessionBooking({ userId, slotStart, slotEnd, notes });
    return NextResponse.json({ success: true, session });
  } catch (error) {
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);
    const message = error instanceof Error ? error.message : 'Failed to request booking.';
    const code = /^[A-Z0-9_]+$/.test(message) ? message : 'UNEXPECTED_ERROR';
    console.error(JSON.stringify({ level: 'error', event: 'scheduling_request_failed', code }));
    return NextResponse.json({
      error: code === 'UNEXPECTED_ERROR' ? 'Failed to request booking.' : code,
    }, { status: 500 });
  }
}
