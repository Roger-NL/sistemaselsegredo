import { NextResponse } from "next/server";
import { RequestAuthError, requireRequestPrincipal } from "@/server/auth/request-auth";
import { hasSameOrigin, readJsonObject, RequestPayloadError } from "@/server/http/request";
import { completePresentation, getPresentation } from "@/server/presentation/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });

async function handle(request: Request, write: boolean) {
  try {
    if (write && !hasSameOrigin(request)) throw new RequestAuthError("Origem da solicitação inválida.", 403);
    const principal = await requireRequestPrincipal(request, { allowBearer: false });
    if (write) {
      if (request.headers.get("x-presentation-uid") !== principal.uid) throw new RequestAuthError("A conta conectada mudou. Entre novamente para continuar.", 409);
      const body = await readJsonObject(request, 128);
      if (Object.keys(body).length !== 1 || body.completed !== true) throw new RequestPayloadError("INVALID_PRESENTATION_COMPLETION");
      return json(await completePresentation(principal.uid));
    }
    return json(await getPresentation(principal.uid));
  } catch (error) {
    if (error instanceof RequestAuthError || error instanceof RequestPayloadError) return json({ error: error.message }, error.status);
    return json({ error: "Não foi possível salvar ou consultar sua apresentação. Tente novamente." }, 503);
  }
}
export async function GET(request: Request) { return handle(request, false); }
export async function POST(request: Request) { return handle(request, true); }
