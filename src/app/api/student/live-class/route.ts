import { workspaceApi } from "@/server/workspace/http";
import { bookLiveClass, getLiveClass } from "@/server/live-class/service";
import { readJsonObject } from "@/server/http/request";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function GET(request: Request) {
  return workspaceApi(request, {}, principal => getLiveClass(principal, new URL(request.url).searchParams.get("month")));
}
export async function POST(request: Request) {
  return workspaceApi(request, { write: true }, async principal => bookLiveClass(principal, await readJsonObject(request, 4_000)));
}
