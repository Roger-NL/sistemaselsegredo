import "server-only";
import { NextResponse } from "next/server";
import { RequestAuthError, requireRequestPrincipal, type RequestPrincipal } from "@/server/auth/request-auth";
import { requireAdminPrincipal } from "@/server/auth/route-guards";
import { RequestPayloadError, hasSameOrigin } from "@/server/http/request";
import { RateLimitError, rateLimitErrorResponse } from "@/server/http/rate-limit";

export const privateHeaders = { "Cache-Control": "private, no-store" };
export function privateJson(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: privateHeaders }); }
export async function workspaceApi(request: Request, options: { admin?: boolean; write?: boolean }, handler: (principal: RequestPrincipal) => Promise<unknown>) {
  try {
    if (options.write && !hasSameOrigin(request)) throw new RequestAuthError("Origem da solicitação inválida.", 403);
    const principal = options.admin ? await requireAdminPrincipal(request) : await requireRequestPrincipal(request);
    const expectedUid = request.headers.get("x-workspace-uid");
    if (options.write && ((!options.admin && expectedUid !== principal.uid) || (expectedUid && expectedUid !== principal.uid))) throw new RequestAuthError("A conta conectada mudou. Atualize o painel antes de continuar.", 409);
    return privateJson(await handler(principal));
  } catch (error) {
    if (error instanceof RequestAuthError || error instanceof RequestPayloadError) return privateJson({ error: error.message }, error.status);
    if (error instanceof RateLimitError) {
      const response = rateLimitErrorResponse(error);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "auth/email-already-exists") return privateJson({ error: "Já existe uma conta com este e-mail." }, 409);
    if (code === "auth/user-not-found") return privateJson({ error: "Esta conta não foi encontrada." }, 404);
    if (code === "auth/invalid-email" || code === "auth/invalid-display-name") return privateJson({ error: "Confira o nome e o e-mail informados." }, 400);
    console.error("[workspace] operation failed", code || (error instanceof Error ? error.name : "UnknownError"));
    return privateJson({ error: "Não foi possível concluir a operação. Atualize os dados e tente novamente." }, 503);
  }
}
