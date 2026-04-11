import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { getSchedulingDayOverview } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { isAdmin } = await getRequestUserContext();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId.' }, { status: 400 });
    }

    const overview = await getSchedulingDayOverview(sessionId);
    return NextResponse.json({ success: true, overview });
  } catch (error) {
    console.error('[admin/scheduling/day] error', error);
    const message = error instanceof Error ? error.message : 'Failed to load day overview.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
