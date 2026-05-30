import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { requestLiveSessionBooking } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId: requestedUserId, slotStart, slotEnd, notes } = body;
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
      allowLegacyCookie: true,
    });

    if (!principal) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    if (!slotStart || !slotEnd) {
      return NextResponse.json({ error: 'Missing booking payload.' }, { status: 400 });
    }

    if (requestedUserId && principal.role !== 'admin' && requestedUserId !== principal.uid) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const userId = principal.role === 'admin' && requestedUserId
      ? requestedUserId
      : principal.uid;

    const session = await requestLiveSessionBooking({ userId, slotStart, slotEnd, notes });
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[scheduling/request] error', error);
    const message = error instanceof Error ? error.message : 'Failed to request booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
