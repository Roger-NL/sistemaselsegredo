import { workspaceApi } from "@/server/workspace/http";
import { mutateManagement } from "@/server/management/service";
import { parseAdminAction } from "@/server/management/validation";
import { readJsonObject } from "@/server/http/request";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;
export async function POST(request: Request) {
  return workspaceApi(request, { admin: true, write: true }, async principal => mutateManagement(principal, parseAdminAction(await readJsonObject(request, 20_000))));
}
