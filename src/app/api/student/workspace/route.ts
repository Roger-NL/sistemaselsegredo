import { workspaceApi } from "@/server/workspace/http";
import { getStudentWorkspace } from "@/server/workspace/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function GET(request: Request) {
  return workspaceApi(request, { write: false }, principal => getStudentWorkspace(principal));
}
