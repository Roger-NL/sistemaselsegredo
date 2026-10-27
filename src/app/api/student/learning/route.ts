import { workspaceApi } from "@/server/workspace/http";
import { saveLearning } from "@/server/workspace/service";
import { readJsonObject } from "@/server/http/request";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function PUT(request: Request) {
  return workspaceApi(request, { write: true }, async principal => saveLearning(principal, await readJsonObject(request, 850_000)));
}
