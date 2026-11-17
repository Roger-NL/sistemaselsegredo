import { describe, expect, it } from "vitest";
import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import type { LiveClassBooking } from "@/contracts/live-class";
import { studentNextStep, teacherReplies } from "@/features/dashboard/next-step";
import { encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { completeLessonSnapshot, lessonInput } from "./helpers/first-encounters-progress";
const workspace = (): StudentWorkspace => ({ account: { id: "student", name: "", email: "", status: "active", role: "student" }, learning: { revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: null, lessonSnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49, updatedAt: null }, activities: [], conversations: [], liveClass: null });
const booking: LiveClassBooking = { id: "student", userId: "student", studentName: "", studentEmail: "", status: "pending", start: "2027-01-01T13:00:00Z", end: "2027-01-01T14:00:00Z", timezone: "Europe/Lisbon", revision: 0, createdAt: "", updatedAt: "", reason: "", meetingUrl: "" };
describe("the next step in the main49-step lesson", () => {
  it("uses only the new validated snapshot, including the actual introduction and lesson positions", () => {
    const data = workspace();
    expect(studentNextStep(data)).toMatchObject({ kind: "lesson", word: "Começar.", href: "/demo" });
    data.learning.demoPercent = 100; data.learning.studyCompleted = 49;
    expect(studentNextStep(data).kind).toBe("lesson");
    data.learning.lessonSnapshot = encodeLessonAccountSnapshot({ ...lessonInput(), introPosition: '{"version":1,"index":2}' });
    expect(studentNextStep(data).description).toContain("4%");
    data.learning.lessonSnapshot = encodeLessonAccountSnapshot(lessonInput(10));
    expect(studentNextStep(data)).toMatchObject({ word: "Continuar.", description: expect.stringContaining("39%") });
    expect(studentNextStep(data).description).not.toMatch(/parte.*10|cafeteria/i);
    data.learning.lessonSnapshot = completeLessonSnapshot();
    expect(studentNextStep(data)).toMatchObject({ kind: "booking", href: "#aula-ao-vivo" });
  });
  it("keeps real bookings accessible without offering a second completed free class", () => {
    const data = { ...workspace(), liveClass: booking };
    expect(studentNextStep(data).kind).toBe("requested");
    data.liveClass = { ...booking, status: "confirmed" }; expect(studentNextStep(data).kind).toBe("confirmed");
    data.liveClass = { ...booking, status: "completed" }; expect(studentNextStep(data).kind).toBe("completed");
    data.liveClass = { ...booking, status: "cancelled" }; data.learning.lessonSnapshot = completeLessonSnapshot();
    expect(studentNextStep(data).kind).toBe("booking");
  });
  it("preserves booking history after explicit resets and never books from simulated completion", () => {
    const data = { ...workspace(), liveClass: { ...booking, status: "confirmed" as const } }; data.learning.revision = 1;
    const previous = structuredClone(data);
    expect(studentNextStep(data)).toMatchObject({ kind: "lesson", word: "Começar." }); expect(data).toEqual(previous);
    data.learning.lessonSnapshot = completeLessonSnapshot(); data.learning.testMode = true;
    expect(studentNextStep(data)).toMatchObject({ kind: "lesson", status: "Conclusão simulada" });
    expect(data.liveClass).toEqual(previous.liveClass);
  });
  it("blocks unavailable accounts and ignores another principal's booking", () => {
    const data = { ...workspace(), liveClass: { ...booking, userId: "other" } };
    expect(studentNextStep(data).kind).toBe("lesson");
    data.account.status = "pending"; data.learning.lessonSnapshot = completeLessonSnapshot(); expect(studentNextStep(data).kind).toBe("booking");
    for (const status of ["suspended", "rejected"] as const) { data.account.status = status; expect(studentNextStep(data).kind).toBe("access"); expect(studentNextStep(data).href).toBeUndefined(); }
  });
  it("reports actual latest teacher replies without inventing unread messages", () => {
    const thread = (id: string, role: "student" | "manager", updatedAt: string): TeacherConversation => ({ id, userId: "student", userName: "", userEmail: "", subject: "Dúvida", status: "closed", createdAt: "", updatedAt, messages: [{ id, authorId: role, authorName: "", role, body: "Mensagem", at: updatedAt }] });
    expect(teacherReplies([thread("old", "manager", "2026-10-01"), thread("mine", "student", "2026-10-28"), thread("recent", "manager", "2026-10-27")]).map(item => item.id)).toEqual(["recent", "old"]);
  });
});
