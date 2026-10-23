import { NextResponse } from 'next/server';
import { requireAdminPrincipal } from "@/server/auth/route-guards";
import { RequestAuthError } from "@/server/auth/request-auth";
import { getSchedulingDayOverview } from '@/server/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdminPrincipal(req);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId.' }, { status: 400 });
    }

    const overview = await getSchedulingDayOverview(sessionId);
    return NextResponse.json({ success: true, overview });
  } catch (error) {
    if (error instanceof RequestAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[admin/scheduling/day] error', error);
    const message = error instanceof Error ? error.message : 'Failed to load day overview.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
