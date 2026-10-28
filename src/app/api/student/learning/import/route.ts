import { workspaceApi } from "@/server/workspace/http";
import { importGuestLearning } from "@/server/workspace/service";
import { readJsonObject } from "@/server/http/request";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function POST(request: Request) {
  return workspaceApi(request, { write: true }, async principal => importGuestLearning(principal, await readJsonObject(request, 850_000)));
}
