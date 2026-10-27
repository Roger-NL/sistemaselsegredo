import { workspaceApi } from "@/server/workspace/http";
import { appendConversationMessage } from "@/server/workspace/service";
import { readJsonObject } from "@/server/http/request";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return workspaceApi(request, { write: true }, async principal => appendConversationMessage(principal, (await context.params).id, await readJsonObject(request, 20_000)));
}
