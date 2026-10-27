import { workspaceApi } from "@/server/workspace/http";
import { getManagementSnapshot } from "@/server/management/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;
export async function GET(request: Request) {
  return workspaceApi(request, { admin: true }, getManagementSnapshot);
}
