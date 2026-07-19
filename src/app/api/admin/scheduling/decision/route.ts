import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { updateSchedulingStatusByAdmin } from '@/lib/scheduling/service';
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const principal = await getRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
    });

    if (!principal) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    if (principal.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId, decision, reason } = body as {
      sessionId?: string;
      decision?: 'confirm' | 'pending' | 'reject';
      reason?: string;
    };

    if (
      typeof sessionId !== 'string' ||
      sessionId.length > 256 ||
      !decision ||
      !['confirm', 'pending', 'reject'].includes(decision) ||
      (reason !== undefined && (typeof reason !== 'string' || reason.length > 2_000))
    ) {
      return NextResponse.json({ error: 'Missing decision payload.' }, { status: 400 });
    }

    await consumeRateLimit({
      namespace: 'admin-scheduling-decision',
      identifier: principal.uid,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });

    await updateSchedulingStatusByAdmin({ sessionId, decision, reason });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);
    const message = error instanceof Error ? error.message : 'Failed to update scheduling status.';
    const code = /^[A-Z0-9_]+$/.test(message) ? message : 'UNEXPECTED_ERROR';
    console.error(JSON.stringify({ level: 'error', event: 'admin_scheduling_decision_failed', code }));
    return NextResponse.json({
      error: code === 'UNEXPECTED_ERROR' ? 'Failed to update scheduling status.' : code,
    }, { status: 500 });
  }
}
