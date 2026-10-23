import { assertOnlyKeys, readJsonObject, RequestPayloadError, requestPayloadErrorResponse } from "@/server/http/request";
import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/server/auth/principal';
import { cancelLiveSessionBooking } from '@/server/scheduling/service';

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
    assertOnlyKeys(body, ['userId']);
    const { userId: requestedUserId } = body;
    if (requestedUserId !== undefined && (typeof requestedUserId !== "string" || !requestedUserId || requestedUserId.length > 256)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    if (requestedUserId && principal.role !== 'admin' && requestedUserId !== principal.uid) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const userId = principal.role === 'admin' && requestedUserId
      ? requestedUserId
      : principal.uid;

    await cancelLiveSessionBooking(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    console.error('[scheduling/cancel] error', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
