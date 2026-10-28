import { workspaceApi } from "@/server/workspace/http";
import { decideLiveClass, listLiveClasses } from "@/server/live-class/service";
import { readJsonObject } from "@/server/http/request";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function GET(request: Request) {
  return workspaceApi(request, { admin: true }, () => listLiveClasses());
}
export async function POST(request: Request) {
  return workspaceApi(request, { admin: true, write: true }, async principal => decideLiveClass(principal, await readJsonObject(request, 8_000)));
}
