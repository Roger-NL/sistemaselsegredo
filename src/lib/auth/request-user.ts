import { getRequestPrincipal } from "@/lib/auth/principal";

export async function getRequestUserContext(req?: Request) {
  const principal = await getRequestPrincipal(req, {
    allowBearer: true,
    allowSessionCookie: true,
    allowLegacyCookie: true,
  });

  return {
    sessionUserId: principal?.uid ?? null,
    isAdmin: principal?.role === "admin",
    role: principal?.role ?? "student",
    subscriptionStatus: principal?.subscriptionStatus ?? "free",
    source: principal?.source ?? null,
    principal,
  };
}
