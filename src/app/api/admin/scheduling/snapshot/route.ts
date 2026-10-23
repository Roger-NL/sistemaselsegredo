import { NextResponse } from 'next/server';
import { requireAdminPrincipal } from "@/server/auth/route-guards";
import { RequestAuthError } from "@/server/auth/request-auth";
import { getAdminSchedulingSnapshot } from '@/server/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdminPrincipal(req);

    const snapshot = await getAdminSchedulingSnapshot();
    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    if (error instanceof RequestAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[admin/scheduling/snapshot] error', error);
    return NextResponse.json({ error: 'Failed to load admin scheduling snapshot.' }, { status: 500 });
  }
}
