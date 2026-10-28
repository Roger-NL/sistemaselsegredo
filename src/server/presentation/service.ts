import "server-only";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError } from "@/server/auth/request-auth";

/** Deliberately independent of learning snapshots, entitlements and account approval. */
export async function getPresentation(uid: string) {
  const snapshot = await getAdminDb().collection("users").doc(uid).get();
  return { uid, completed: typeof snapshot.data()?.presentationCompletedAt === "string" };
}

export async function completePresentation(uid: string) {
  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new RequestAuthError("Seu perfil ainda não está disponível. Tente novamente.", 409);
    if (typeof snapshot.data()?.presentationCompletedAt === "string") return;
    transaction.update(ref, { presentationCompletedAt: new Date().toISOString() });
  });
  return { uid, completed: true };
}
