import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { getSchedulingAvailability } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const { sessionUserId, isAdmin } = await getRequestUserContext();
    const userId = requestedUserId || sessionUserId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    if (!isAdmin && sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const slots = await getSchedulingAvailability(userId);
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('[scheduling/availability] error', error);
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
  }
}
