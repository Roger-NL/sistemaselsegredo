import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/server/auth/request-auth";
import { updateProgressServer, type ProgressUpdateInput } from "@/lib/progress/server-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const principal = await requireAuthenticatedUser(req);
    const payload = (await req.json()) as ProgressUpdateInput;
    const result = await updateProgressServer(principal.uid, payload, principal.role === "admin");
    return NextResponse.json({ success: true, progressSnapshot: result.progressSnapshot });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "PROGRESS_UPDATE_FAILED";
    const status = message === "USER_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
