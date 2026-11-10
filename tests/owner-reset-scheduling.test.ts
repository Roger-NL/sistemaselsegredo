import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";

const memory = vi.hoisted(() => {
  type Data = Record<string, unknown>;
  const docs = new Map<string, Data>();
  const uid = "FvhS6SDcIJfGiDteKjAlGzBJAQq1";
  let afterSessionRead: (() => Promise<void>) | null = null;
  const ref = (path: string) => ({ path, id: path.split("/").at(-1)!, collection: (name: string) => collection(`${path}/${name}`), get: async () => { const result = snapshot(path); if (path === `live_sessions/${uid}_p2` && afterSessionRead) { const callback = afterSessionRead; afterSessionRead = null; await callback(); } return result; }, set: async (value: Data, options?: { merge?: boolean }) => { docs.set(path, { ...(options?.merge ? docs.get(path) : {}), ...structuredClone(value) }); } });
  function snapshot(path: string) {
    const exists = docs.has(path), data = structuredClone(docs.get(path));
    return { id: path.split("/").at(-1)!, ref: ref(path), exists, data: () => structuredClone(data) };
  }
  function collection(path: string, filters: [string, unknown][] = [], limit = 1000) {
    return { doc: (id = crypto.randomUUID()) => ref(`${path}/${id}`), where: (key: string, _op: string, value: unknown) => collection(path, [...filters, [key, value]], limit), limit: (next: number) => collection(path, filters, next), get: async () => { const selected = [...docs].filter(([key, value]) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/") && filters.every(([field, test]) => value[field] === test)).slice(0, limit); return { size: selected.length, docs: selected.map(([key]) => snapshot(key)) }; } };
  }
  const db = { collection, runTransaction: async <T>(callback: (tx: unknown) => Promise<T>) => {
    const writes: (() => void)[] = [];
    const tx = {
      get: (target: { get: () => Promise<unknown> }) => { if (writes.length) throw new Error("read after write"); return target.get(); },
      set: (target: { path: string }, data: Data, options?: { merge?: boolean }) => writes.push(() => docs.set(target.path, { ...(options?.merge ? docs.get(target.path) : {}), ...structuredClone(data) })),
      update: (target: { path: string }, data: Data) => writes.push(() => docs.set(target.path, { ...docs.get(target.path), ...structuredClone(data) })),
      create: (target: { path: string }, data: Data) => writes.push(() => docs.set(target.path, structuredClone(data))),
      delete: (target: { path: string }) => writes.push(() => { docs.delete(target.path); }),
    };
    const result = await callback(tx); writes.forEach(write => write()); return result;
  } };
  return { docs, db, uid, afterRead: (callback: (() => Promise<void>) | null) => { afterSessionRead = callback; }, calendar: vi.fn(), cancelCalendar: vi.fn(), createCalendar: vi.fn() };
});

vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db, getAdminAuth: () => ({ getUser: async () => ({ uid: memory.uid, email: "raugerac@gmail.com", emailVerified: true, disabled: false }) }) }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: vi.fn(async () => {}) }));
vi.mock("@/server/integrations/google-calendar", () => ({ getSchedulingTimezone: () => "UTC", getSchedulingTutorEmail: () => "teacher@example.test", getCalendarEventState: memory.calendar, cancelCalendarEvent: memory.cancelCalendar, createCalendarEventForBooking: memory.createCalendar }));

import { getSchedulingStatusForUser } from "@/server/scheduling/service";
import { mutateTestProgress } from "@/server/superuser/service";

const uid = memory.uid;
const path = `live_sessions/${uid}_p2`;
const owner: RequestPrincipal = { uid, email: "raugerac@gmail.com", role: "admin", source: "session_cookie", subscriptionStatus: "premium" };
const session = () => ({ id: `${uid}_p2`, userId: uid, sourcePillarId: 2, title: "Primeira aula ao vivo", status: "pending_confirmation", requestedSlotStart: "2026-12-15T10:00:00Z", requestedSlotEnd: "2026-12-15T10:50:00Z", calendarEventId: "old-event", calendarHtmlLink: "https://calendar.test/old", bookingRevision: 2, updatedAt: new Date().toISOString() });

beforeEach(() => {
  vi.clearAllMocks(); memory.docs.clear(); memory.afterRead(null);
  memory.docs.set(`users/${uid}`, { accountStatus: "active", subscriptionStatus: "premium" });
  memory.docs.set(path, session());
  memory.calendar.mockResolvedValue({ summary: "[CONFIRMADO]", htmlLink: "https://calendar.test/new", status: "confirmed" });
});

describe("legacy scheduling cannot resurrect a reset owner session", () => {
  it("discards a Calendar sync result when Apagar tudo deleted the session during provider I/O", async () => {
    memory.calendar.mockImplementationOnce(async () => {
      await mutateTestProgress(owner, { action: "reset-all", revision: 0, saveVersion: 0 });
      return { summary: "[CONFIRMADO]", htmlLink: "https://calendar.test/new", status: "confirmed" };
    });
    const result = await getSchedulingStatusForUser(uid);
    expect(memory.docs.has(path)).toBe(false);
    expect(result).toMatchObject({ session: null, canRequestScheduling: false, canManageCurrentBooking: false });
    expect(memory.cancelCalendar).not.toHaveBeenCalled();
    expect(memory.createCalendar).not.toHaveBeenCalled();
  });

  it("preserves a concurrent manager decision rather than overwriting it with a stale Calendar response", async () => {
    memory.calendar.mockImplementationOnce(async () => {
      memory.docs.set(path, { ...session(), status: "cancelled", bookingRevision: 3, calendarEventId: null });
      return { summary: "[CONFIRMADO]", htmlLink: "https://calendar.test/stale", status: "confirmed" };
    });
    const result = await getSchedulingStatusForUser(uid);
    expect(result.session).toMatchObject({ status: "cancelled", bookingRevision: 3 });
    expect(memory.docs.get(path)).toMatchObject({ status: "cancelled", bookingRevision: 3, calendarEventId: null });
  });

  it("does not promote and recreate a release-window session removed after its initial read", async () => {
    memory.docs.set(path, { ...session(), status: "awaiting_release_window", calendarEventId: null, earliestScheduleAt: "2020-01-01T00:00:00Z" });
    memory.afterRead(async () => { await mutateTestProgress(owner, { action: "reset-all", revision: 0, saveVersion: 0 }); });
    expect((await getSchedulingStatusForUser(uid)).session).toBeNull();
    expect(memory.docs.has(path)).toBe(false);
    expect(memory.calendar).not.toHaveBeenCalled();
  });

  it("keeps ordinary Calendar sync and release-window promotion working for existing sessions", async () => {
    expect((await getSchedulingStatusForUser(uid)).session).toMatchObject({ status: "confirmed", calendarHtmlLink: "https://calendar.test/new" });
    memory.docs.set(path, { ...session(), status: "awaiting_release_window", calendarEventId: null, earliestScheduleAt: "2020-01-01T00:00:00Z" });
    expect((await getSchedulingStatusForUser(uid)).session?.status).toBe("ready_to_schedule");
    expect(memory.docs.get(path)?.status).toBe("ready_to_schedule");
  });
});
