import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { updateSchedulingStatusByAdmin } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { sessionId, decision, reason } = body as {
      sessionId?: string;
      decision?: 'confirm' | 'pending' | 'reject';
      reason?: string;
    };

    if (!sessionId || !decision) {
      return NextResponse.json({ error: 'Missing decision payload.' }, { status: 400 });
    }

    await updateSchedulingStatusByAdmin({ sessionId, decision, reason });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/scheduling/decision] error', error);
    const message = error instanceof Error ? error.message : 'Failed to update scheduling status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
