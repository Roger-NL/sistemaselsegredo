import "server-only";
import { getAdminDb } from "../firebase";

/** Profile creation/update after token verification. No course fields or published-rule migration. */
export async function recordVerifiedLogin(identity: { uid: string; email?: string; name?: unknown }) {
  const reference = getAdminDb().collection("users").doc(identity.uid);
  await getAdminDb().runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const now = new Date().toISOString();
    if (snapshot.exists) {
      transaction.update(reference, { lastLoginDate: now, updatedAt: now });
    } else {
      transaction.create(reference, {
        id: identity.uid, email: identity.email ?? "",
        name: typeof identity.name === "string" && identity.name.trim() ? identity.name.trim().slice(0, 120) : "Usuário",
        subscriptionStatus: "free", accountStatus: "pending", createdAt: now, lastLoginDate: now, updatedAt: now,
      });
    }
  });
}
