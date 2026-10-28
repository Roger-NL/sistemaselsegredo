import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";
import { studySteps } from "@/features/theory/progress";
import { monthSlots } from "@/features/live-class/calendar";

type Data = Record<string, unknown>;
const memory = vi.hoisted(() => {
  const docs = new Map<string, Data>(); let seq = 0;
  const snapshot = (path: string) => ({ exists: docs.has(path), id: path.split("/").at(-1), data: () => docs.get(path) });
  const ref = (path: string) => ({ path, get: async () => snapshot(path), collection: (name: string) => collection(`${path}/${name}`) });
  const collection = (path: string, filter?: [string, unknown]) => ({
    doc: (id?: string) => ref(`${path}/${id || `auto-${++seq}`}`),
    where: (key: string, _op: string, value: unknown) => collection(path, [key, value]),
    get: async () => ({ docs: [...docs.keys()].filter(key => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/") && (!filter || docs.get(key)?.[filter[0]] === filter[1])).map(snapshot) }),
  });
  return { docs, db: { collection, runTransaction: async <T>(fn: (tx: unknown) => Promise<T>) => {
    const writes: (() => void)[] = [];
    const tx = { get: async (r: { path: string }) => snapshot(r.path), set: (r: { path: string }, data: Data) => writes.push(() => docs.set(r.path, structuredClone(data))), create: (r: { path: string }, data: Data) => writes.push(() => docs.set(r.path, structuredClone(data))), delete: (r: { path: string }) => writes.push(() => docs.delete(r.path)) };
    const result = await fn(tx); writes.forEach(write => write()); return result;
  } } };
});
vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: vi.fn(async () => undefined) }));
import { bookLiveClass, decideLiveClass, getLiveClass, listLiveClasses } from "@/server/live-class/service";
const student: RequestPrincipal = { uid: "student", email: "student@example.com", role: "student", source: "session_cookie", subscriptionStatus: "free" };
const manager: RequestPrincipal = { ...student, uid: "manager", role: "admin" };
function complete(count = studySteps.length, uid = student.uid) {
  memory.docs.set(`learning_states/${uid}`, { studySnapshot: JSON.stringify({ version: 1, position: 0, completed: studySteps.slice(0, count).map(s => s.step.id), supported: [] }) });
}
const now = new Date("2026-10-15T12:30:00Z");
const start = monthSlots("2026-10", "Europe/Lisbon", now)[0].start;
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(now); vi.stubEnv("LIVE_CLASS_TIMEZONE", "Europe/Lisbon"); memory.docs.clear(); memory.docs.set("users/student", { name: "Student", accountStatus: "active" }); });

afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("free lesson entitlement and real booking lifecycle", () => {
  it("blocks both the agenda and direct booking at 23/24, regardless of a forged percentage", async () => {
    complete(23); memory.docs.set("learning_states/student", { ...memory.docs.get("learning_states/student"), studyCompleted: 24, demoPercent: 100 });
    expect(await getLiveClass(student, null)).toMatchObject({ eligible: false, completed: 23, total: 24, slots: [] });
    await expect(bookLiveClass(student, { start })).rejects.toMatchObject({ status: 403 });
    expect((await listLiveClasses()).bookings).toEqual([]);
  });
  it("unlocks for a free account only after all 24 saved practices, including supported practices", async () => {
    complete(); const result = await getLiveClass(student, null);
    expect(result.eligible).toBe(true); expect(result.slots.length).toBeGreaterThan(24);
    expect(new Set(result.slots.map(s => s.day))).toContain("2026-10-18");
  });
  it("allows a signed-in pending account with all saved practices to request its free lesson without prior approval", async () => {
    complete(); memory.docs.set("users/student", { accountStatus: "pending" });
    expect((await getLiveClass(student, null)).eligible).toBe(true);
    expect((await bookLiveClass(student, { start })).booking).toMatchObject({ userId: student.uid, status: "pending" });
    await decideLiveClass(manager, { id: student.uid, revision: 1, decision: "confirm" });
    expect((await getLiveClass(student, null)).booking?.status).toBe("confirmed");
  });
  it("keeps suspended and rejected accounts locked even with completed study", async () => {
    complete();
    for (const status of ["suspended", "rejected"]) {
      memory.docs.set("users/student", { accountStatus: status });
      expect((await getLiveClass(student, null)).eligible).toBe(false);
      await expect(bookLiveClass(student, { start })).rejects.toMatchObject({ status: 403 });
    }
  });
  it("persists one booking, makes retries idempotent, and shows the same request to ADM", async () => {
    complete(); const first = await bookLiveClass(student, { start });
    expect(await bookLiveClass(student, { start })).toEqual(first);
    expect((await getLiveClass(student, null)).booking).toEqual(first.booking);
    expect((await listLiveClasses()).bookings).toEqual([first.booking]);
    expect(memory.docs.size).toBe(7); // profile, study, booking, lock, two activities and the durable notification
    expect([...memory.docs.entries()].filter(([path]) => path.startsWith("operational_notifications/"))).toHaveLength(1);
    await expect(bookLiveClass(student, { start: monthSlots("2026-10", "Europe/Lisbon", now)[1].start })).rejects.toMatchObject({ status: 409 });
  });
  it("prevents another student from reserving a taken slot and hides it from availability", async () => {
    complete(); await bookLiveClass(student, { start });
    memory.docs.set("users/other", { accountStatus: "active" }); complete(24, "other");
    const other = { ...student, uid: "other" };
    expect((await getLiveClass(other, null)).slots.some(slot => slot.start === start)).toBe(false);
    await expect(bookLiveClass(other, { start })).rejects.toMatchObject({ status: 409 });
  });
  it("reflects ADM confirmation and meeting access on the student panel; rejects stale decisions", async () => {
    complete(); const { booking } = await bookLiveClass(student, { start });
    await decideLiveClass(manager, { id: booking.id, revision: 1, decision: "confirm", meetingUrl: "https://meet.google.com/abc-defg-hij" });
    expect((await getLiveClass(student, null)).booking).toMatchObject({ status: "confirmed", revision: 2, meetingUrl: "https://meet.google.com/abc-defg-hij" });
    await expect(decideLiveClass(manager, { id: booking.id, revision: 1, decision: "cancel", reason: "Changed" })).rejects.toMatchObject({ status: 409 });
  });
  it("releases a cancelled slot and allows rescheduling without a second entitlement", async () => {
    complete(); await bookLiveClass(student, { start });
    await decideLiveClass(manager, { id: student.uid, revision: 1, decision: "cancel", reason: "Escolha outro dia" });
    expect((await getLiveClass(student, null)).booking).toMatchObject({ status: "cancelled", reason: "Escolha outro dia" });
    const result = await bookLiveClass(student, { start }); expect(result.booking.revision).toBe(3);
    expect((await listLiveClasses()).bookings).toHaveLength(1);
  });
  it("rechecks progress after reset and never duplicates a completed lesson", async () => {
    complete(); await bookLiveClass(student, { start });
    await decideLiveClass(manager, { id: student.uid, revision: 1, decision: "confirm" });
    vi.setSystemTime(new Date("2026-10-16T12:00:00Z"));
    await decideLiveClass(manager, { id: student.uid, revision: 2, decision: "complete" });
    complete(0); expect((await getLiveClass(student, null)).booking?.status).toBe("completed");
    complete(); await expect(bookLiveClass(student, { start: monthSlots("2026-10", "Europe/Lisbon", new Date())[0].start })).rejects.toMatchObject({ status: 409 });
  });
  it("rejects unoffered dates, unsafe meeting links, early completion and invalid months", async () => {
    complete(); await expect(bookLiveClass(student, { start: "2026-10-18T12:15:00.000Z" })).rejects.toMatchObject({ status: 409 });
    await expect(getLiveClass(student, "2027-01")).rejects.toMatchObject({ status: 400 });
    await bookLiveClass(student, { start });
    await expect(decideLiveClass(manager, { id: student.uid, revision: 1, decision: "confirm", meetingUrl: "javascript:alert(1)" })).rejects.toMatchObject({ status: 400 });
    await expect(decideLiveClass(manager, { id: student.uid, revision: 1, decision: "complete" })).rejects.toMatchObject({ status: 409 });
  });
});

it("skips the nonexistent Lisbon hour and never duplicates slots on daylight-saving changes", () => {
  const spring = monthSlots("2027-03", "Europe/Lisbon", new Date("2027-03-01T00:00:00Z"));
  expect(spring.some(slot => slot.day === "2027-03-28" && slot.time === "01:00")).toBe(false);
  expect(new Set(spring.map(slot => slot.start)).size).toBe(spring.length);
});
