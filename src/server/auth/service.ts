import "server-only";
import { getAdminDb } from "../firebase";
import { prepareOperationalNotifications } from "@/server/notifications/outbox";
import { scheduleOperationalNotifications } from "@/server/notifications/background";

/** Profile creation/update after token verification. No course fields or published-rule migration. */
export async function recordVerifiedLogin(identity: { uid: string; email?: string; name?: unknown }) {
  const reference = getAdminDb().collection("users").doc(identity.uid);
  const notifications = await getAdminDb().runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const now = new Date().toISOString();
    if (snapshot.exists) {
      transaction.update(reference, { lastLoginDate: now, updatedAt: now });
      return [];
    } else {
      const name = typeof identity.name === "string" && identity.name.trim() ? identity.name.trim().slice(0, 120) : "Usuário";
      const enqueue = await prepareOperationalNotifications(transaction, [{ kind: "new_signup", userId: identity.uid, userName: name, userEmail: identity.email || "", occurredAt: now }]);
      transaction.create(reference, {
        id: identity.uid, email: identity.email ?? "",
        name,
        subscriptionStatus: "free", accountStatus: "pending", createdAt: now, lastLoginDate: now, updatedAt: now,
      });
      return enqueue();
    }
  });
  scheduleOperationalNotifications(notifications);
}
