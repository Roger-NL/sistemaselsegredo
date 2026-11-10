import "server-only";
import type { DocumentSnapshot, Query, Transaction } from "firebase-admin/firestore";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError } from "@/server/auth/request-auth";

// Application safeguards, not Firestore quotas. Firestore also enforces its 10 MiB
// transaction limit, including deleted index entries, and rolls back every write.
const maxDeletes = 450;
const maxDocumentBytes = 2 * 1024 * 1024;
const tooLarge = () => new RequestAuthError("Os dados desta conta são grandes demais para apagar tudo de uma vez com segurança. Nenhum dado foi alterado.", 409);

/** Build the entire owner-scoped plan before the caller makes ANY writes. */
export async function prepareOwnerJourneyReset(tx: Transaction, uid: string) {
  const db = getAdminDb();
  const planned = new Map<string, DocumentSnapshot>();
  let bytes = 0;
  function include(doc: DocumentSnapshot) {
    if (!doc.exists || planned.has(doc.ref.path)) return;
    bytes += Buffer.byteLength(JSON.stringify(doc.data()), "utf8");
    planned.set(doc.ref.path, doc);
    if (planned.size > maxDeletes || bytes > maxDocumentBytes) throw tooLarge();
  }
  async function read(query: Query) {
    // A sentinel prevents silently accepting only a prefix of a larger result.
    const snapshot = await tx.get(query.limit(maxDeletes + 1));
    if (snapshot.size > maxDeletes) throw tooLarge();
    return snapshot.docs;
  }
  const owned = (collection: string) => db.collection(collection).where("userId", "==", uid);
  const [activity, bookings, slots, sessions, legacySlots, conversations, managementActivity, notifications, directBooking, directSession] = await Promise.all([
    read(db.collection("users").doc(uid).collection("student_activity")),
    read(owned("demo_live_classes")),
    read(owned("demo_live_class_slots")),
    read(owned("live_sessions")),
    read(owned("live_session_slot_locks")),
    read(owned("teacher_conversations")),
    read(owned("management_activity")),
    read(owned("operational_notifications")),
    tx.get(db.collection("demo_live_classes").doc(uid)),
    tx.get(db.collection("live_sessions").doc(`${uid}_p2`)),
  ]);
  // Canonical keys also cover old records missing userId. A contradictory UID
  // must stop the reset, never authorize deleting somebody else's reservation.
  for (const doc of [directBooking, directSession]) {
    if (doc.exists && doc.data()?.userId != null && doc.data()?.userId !== uid) {
      throw new RequestAuthError("Um agendamento desta conta tem uma identidade incompatível. Nenhum dado foi alterado.", 409);
    }
    include(doc);
  }
  // An outbox worker sends outside Firestore after taking a processing lease.
  // Refusing the whole reset avoids claiming success while a send is in flight.
  if (notifications.some(doc => doc.data().status === "processing")) {
    throw new RequestAuthError("Um aviso desta conta está sendo enviado. Aguarde a conclusão e tente apagar tudo novamente. Nenhum dado foi alterado.", 409);
  }
  for (const group of [activity, bookings, slots, sessions, legacySlots, conversations, managementActivity, notifications]) {
    for (const doc of group) include(doc);
  }
  const sessionIds = new Set(sessions.map(doc => doc.id));
  if (directSession.exists) sessionIds.add(directSession.id);
  // Historical locks can identify their owner only by sessionId. Require a
  // proven owned session, and never override an explicit foreign userId.
  const linkedLocks = await Promise.all([...sessionIds].map(sessionId => read(db.collection("live_session_slot_locks").where("sessionId", "==", sessionId))));
  for (const group of linkedLocks) {
    for (const doc of group) if (doc.data().userId == null || doc.data().userId === uid) include(doc);
  }
  return () => { for (const doc of planned.values()) tx.delete(doc.ref); };
}

export function ownerResetFailure(error: unknown): never {
  // Firestore may reject a smaller plan because index sizes count toward its
  // limit too. There is deliberately no fallback to partial/chunked deletion.
  if (error && typeof error === "object" && "code" in error && (error.code === 8 || error.code === "resource-exhausted" || (error.code === 3 && error instanceof Error && /size|too large|10\s*MiB/i.test(error.message)))) throw tooLarge();
  throw error;
}
