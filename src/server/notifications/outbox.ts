import "server-only";
import { createHash } from "node:crypto";
import type { Transaction, WriteBatch } from "firebase-admin/firestore";
import type { OperationalNotificationKind, OperationalNotificationStatus } from "@/contracts/notifications";
import { getAdminDb } from "@/server/firebase";
import type { NotificationEnvelope } from "./provider";

export type OperationalEvent = {
  kind: OperationalNotificationKind;
  userId: string;
  userName: string;
  userEmail: string;
  occurredAt: string;
  entityId?: string;
  details?: string;
};
export type OutboxNotification = OperationalEvent & {
  status: OperationalNotificationStatus;
  createdAt: string;
  attempts: number;
  nextAttemptAt: string;
  firstAttemptAt?: string;
  leaseUntil?: string | null;
  leaseToken?: string | null;
  envelope?: NotificationEnvelope;
  sentAt?: string;
  errorCode?: string | null;
  providerId?: string;
};

export const operationalNotifications = () => getAdminDb().collection("operational_notifications");
export function operationalNotificationId(event: Pick<OperationalEvent, "kind" | "userId" | "entityId">) {
  return createHash("sha256").update(JSON.stringify([event.kind, event.userId, event.entityId || "first"])).digest("hex");
}

/** Read before ANY transaction writes. The returned closure writes atomically with the real event. */
export async function prepareOperationalNotifications(tx: Transaction, events: OperationalEvent[]) {
  const refs = events.map(event => operationalNotifications().doc(operationalNotificationId(event)));
  const existing = await Promise.all(refs.map(ref => tx.get(ref)));
  const fresh = events.filter((_, index) => !existing[index].exists);
  return () => writeOperationalNotifications(tx, fresh);
}

/** For a batch, entityId must identify a newly created event, never a reusable user record. */
export function writeOperationalNotifications(writer: Transaction | WriteBatch, events: OperationalEvent[]): string[] {
  return events.map(event => {
    const id = operationalNotificationId(event);
    writer.create(operationalNotifications().doc(id), {
      ...event, status: "pending", createdAt: event.occurredAt, attempts: 0, nextAttemptAt: event.occurredAt,
    } satisfies OutboxNotification);
    return id;
  });
}
