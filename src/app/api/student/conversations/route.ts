import { workspaceApi } from "@/server/workspace/http";
import { createConversation } from "@/server/workspace/service";
import { readJsonObject } from "@/server/http/request";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function POST(request: Request) {
  return workspaceApi(request, { write: true }, async principal => createConversation(principal, await readJsonObject(request, 20_000)));
}
