import "server-only";
import type { UserRecord } from "firebase-admin/auth";
import type { RequestPrincipal } from "@/server/auth/principal";
import { getAdminAuth } from "@/server/firebase";
import { RequestAuthError } from "@/server/auth/request-auth";
// Existing Firebase identity, verified read-only on 2026-11-02. Never a browser claim or manager role.
const OWNER_UID = "FvhS6SDcIJfGiDteKjAlGzBJAQq1";
const OWNER_EMAIL = "raugerac@gmail.com";
/** Candidate detection only; authorization still requires the current Auth identity. */
export const isTestOwnerUid = (uid: string) => uid === OWNER_UID;
export function isTestOwner(identity: Pick<UserRecord, "uid" | "email" | "emailVerified" | "disabled">) {
  return isTestOwnerUid(identity.uid) && identity.email?.toLowerCase() === OWNER_EMAIL && identity.emailVerified === true && !identity.disabled;
}
export async function requireTestOwner(principal: RequestPrincipal) {
  if (!isTestOwnerUid(principal.uid)) throw new RequestAuthError("Controles exclusivos da conta de testes.", 403);
  if (!isTestOwner(await getAdminAuth().getUser(principal.uid))) throw new RequestAuthError("Identidade de testes indisponível.", 403);
}
