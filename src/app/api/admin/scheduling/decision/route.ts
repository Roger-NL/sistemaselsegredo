import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { updateSchedulingStatusByAdmin } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { isAdmin } = await getRequestUserContext();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId, decision } = body as {
      sessionId?: string;
      decision?: 'confirm' | 'pending' | 'reject';
    };

    if (!sessionId || !decision) {
      return NextResponse.json({ error: 'Missing decision payload.' }, { status: 400 });
    }

    await updateSchedulingStatusByAdmin({ sessionId, decision });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/scheduling/decision] error', error);
    const message = error instanceof Error ? error.message : 'Failed to update scheduling status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
