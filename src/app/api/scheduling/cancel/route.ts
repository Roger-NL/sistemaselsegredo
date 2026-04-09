import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { cancelLiveSessionBooking } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;
    const { sessionUserId, isAdmin } = await getRequestUserContext();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    if (!isAdmin && sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await cancelLiveSessionBooking(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[scheduling/cancel] error', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel booking.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
