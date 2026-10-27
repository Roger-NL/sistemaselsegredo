import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/server/firebase";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/session-cookie";
import { displayAccountName, type DashboardAccount } from "@/contracts/dashboard";

/** A cookie's presence alone never grants access to the dashboard or profile writes. */
export async function getDashboardIdentity() {
  const cookie = (await cookies()).get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try { return await getAdminAuth().verifySessionCookie(cookie, true); }
  catch { return null; }
}

export async function getDashboardAccount(): Promise<DashboardAccount | null> {
  const identity = await getDashboardIdentity();
  if (!identity) return null;
  let name = displayAccountName(identity.name);
  try {
    const profile = await getAdminDb().collection("users").doc(identity.uid).get();
    name = displayAccountName(profile.data()?.name) || name;
  } catch {
    // A profile read failure must not invalidate a verified Firebase session.
  }
  return { name, email: identity.email ?? "" };
}
