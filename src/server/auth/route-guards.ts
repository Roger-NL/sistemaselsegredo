import "server-only";
import { RequestAuthError, requireRequestPrincipal } from "./request-auth";

/** Authorization for preserved administrative APIs; never use cookie presence as authority. */
export async function requireAdminPrincipal(req: Request) {
  const principal = await requireRequestPrincipal(req, { allowBearer: true, allowSessionCookie: true });
  if (principal.role !== "admin") throw new RequestAuthError("Forbidden.", 403);
  return principal;
}
