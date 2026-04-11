import { NextResponse } from 'next/server';
import { getRequestUserContext } from '@/lib/auth/request-user';
import { getAdminSchedulingSnapshot } from '@/lib/scheduling/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { isAdmin } = await getRequestUserContext();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const snapshot = await getAdminSchedulingSnapshot();
    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    console.error('[admin/scheduling/snapshot] error', error);
    return NextResponse.json({ error: 'Failed to load admin scheduling snapshot.' }, { status: 500 });
  }
}
