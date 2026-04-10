import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { getSchedulingStatusForUser } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const { sessionUserId, isAdmin } = await getRequestUserContext();
    const userId = requestedUserId || sessionUserId;
    const isDevFallback = process.env.NODE_ENV !== 'production' && !sessionUserId && !!requestedUserId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    if (!isAdmin && !isDevFallback && sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const payload = await getSchedulingStatusForUser(userId);
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error('[scheduling/status] error', error);
    return NextResponse.json({ error: 'Failed to load scheduling status.' }, { status: 500 });
  }
}
