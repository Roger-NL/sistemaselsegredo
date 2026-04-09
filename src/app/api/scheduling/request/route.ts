import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { requestLiveSessionBooking } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, slotStart, slotEnd, notes } = body;
    const { sessionUserId, isAdmin } = await getRequestUserContext();

    if (!userId || !slotStart || !slotEnd) {
      return NextResponse.json({ error: 'Missing booking payload.' }, { status: 400 });
    }

    if (!isAdmin && sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const session = await requestLiveSessionBooking({ userId, slotStart, slotEnd, notes });
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[scheduling/request] error', error);
    const message = error instanceof Error ? error.message : 'Failed to request booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
