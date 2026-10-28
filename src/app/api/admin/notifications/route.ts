import { workspaceApi } from "@/server/workspace/http";
import { getNotificationSettings, processOperationalNotifications, updateNotificationSettings } from "@/server/notifications/service";
import { assertOnlyKeys, readJsonObject, RequestPayloadError } from "@/server/http/request";
import { consumeRateLimit } from "@/server/http/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;

export async function GET(request: Request) {
  return workspaceApi(request, { admin: true }, getNotificationSettings);
}

export async function PATCH(request: Request) {
  return workspaceApi(request, { admin: true, write: true }, async principal => {
    const body = await readJsonObject(request, 2_000);
    assertOnlyKeys(body, ["recipientEmail", "enabled"]);
    await consumeRateLimit({ namespace: "notification-settings", identifier: principal.uid, limit: 20, windowMs: 60_000 });
    return updateNotificationSettings(body, principal.uid);
  });
}

export async function POST(request: Request) {
  return workspaceApi(request, { admin: true, write: true }, async principal => {
    const body = await readJsonObject(request, 1_000);
    assertOnlyKeys(body, ["action"]);
    if (body.action !== "process") throw new RequestPayloadError("Ação de avisos inválida.");
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.configured) throw new RequestPayloadError("Ative e configure o envio de e-mail antes de processar a fila.", 409);
    await consumeRateLimit({ namespace: "notification-process", identifier: principal.uid, limit: 5, windowMs: 60_000 });
    const delivery = await processOperationalNotifications();
    return { settings: await getNotificationSettings(), delivery };
  });
}
