import "server-only";
import type { UserRecord } from "firebase-admin/auth";
import type { RequestPrincipal } from "@/server/auth/principal";
import { getAdminAuth } from "@/server/firebase";
import { RequestAuthError } from "@/server/auth/request-auth";
// Existing Firebase identity, verified read-only on 2026-11-02. Never a browser claim or manager role.
const OWNER_UID = "FvhS6SDcIJfGiDteKjAlGzBJAQq1";
const OWNER_EMAIL = "raugerac@gmail.com";
export function isTestOwner(identity: Pick<UserRecord, "uid" | "email" | "emailVerified" | "disabled">) {
  return identity.uid === OWNER_UID && identity.email?.toLowerCase() === OWNER_EMAIL && identity.emailVerified === true && !identity.disabled;
}
export async function requireTestOwner(principal: RequestPrincipal) {
  if (principal.uid !== OWNER_UID) throw new RequestAuthError("Controles exclusivos da conta de testes.", 403);
  if (!isTestOwner(await getAdminAuth().getUser(principal.uid))) throw new RequestAuthError("Identidade de testes indisponível.", 403);
}
