import { NextResponse } from 'next/server';
import { getRequestPrincipal } from '@/lib/auth/principal';
import { getAdminSchedulingSnapshot } from '@/lib/scheduling/service';

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

    const snapshot = await getAdminSchedulingSnapshot();
    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    console.error('[admin/scheduling/snapshot] error', error);
    return NextResponse.json({ error: 'Failed to load admin scheduling snapshot.' }, { status: 500 });
  }
}
