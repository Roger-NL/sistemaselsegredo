import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/server/auth/principal';
import { getSchedulingAvailability } from '@/server/scheduling/service';
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from '@/server/http/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
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

    await consumeRateLimit({
      namespace: 'scheduling-availability',
      identifier: `${principal.uid}:${userId}`,
      limit: 60,
      windowMs: 60 * 1000,
    });

    const slots = await getSchedulingAvailability(userId);
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);
    const message = error instanceof Error ? error.message : '';
    const code = /^[A-Z0-9_]+$/.test(message) ? message : 'UNEXPECTED_ERROR';
    console.error(JSON.stringify({ level: 'error', event: 'scheduling_availability_failed', code }));
    return NextResponse.json({ error: 'Failed to load availability.' }, { status: 500 });
  }
}
