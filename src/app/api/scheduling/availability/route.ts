import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { getSchedulingAvailability } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
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

    const slots = await getSchedulingAvailability(userId);
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('[scheduling/availability] error', error);
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
  }
}
