import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { cancelLiveSessionBooking } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId: requestedUserId } = body;
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
      allowLegacyCookie: true,
    });

    if (!principal) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
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
    console.error('[scheduling/cancel] error', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
