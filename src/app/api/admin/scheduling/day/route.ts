import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { getSchedulingDayOverview } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
      allowLegacyCookie: true,
    });

    if (!principal) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    if (principal.role !== 'admin') {
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
