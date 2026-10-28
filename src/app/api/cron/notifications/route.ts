import { timingSafeEqual } from "node:crypto";
import { processOperationalNotifications } from "@/server/notifications/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (!secret || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return Response.json({ error: "Não autorizado." }, { status: 401 });
  try { return Response.json(await processOperationalNotifications({ limit: 5 }), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ error: "Não foi possível processar os avisos." }, { status: 503, headers: { "Cache-Control": "private, no-store" } }); }
}
