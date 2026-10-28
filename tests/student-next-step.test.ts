import { describe, expect, it } from "vitest";
import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import type { LiveClassBooking } from "@/contracts/live-class";
import { studentNextStep, teacherReplies } from "@/features/dashboard/next-step";

const workspace = (): StudentWorkspace => ({ account: { id: "student", name: "", email: "", status: "active", role: "student" }, learning: { revision: 0, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null }, activities: [], conversations: [], liveClass: null });
const booking: LiveClassBooking = { id: "student", userId: "student", studentName: "", studentEmail: "", status: "pending", start: "2026-11-01T13:00:00Z", end: "2026-11-01T14:00:00Z", timezone: "Europe/Lisbon", revision: 0, createdAt: "", updatedAt: "", reason: "", meetingUrl: "" };

describe("the student's next useful step", () => {
  it("starts with the conversation, then offers study and only releases booking at all practices", () => {
    const data = workspace();
    expect(studentNextStep(data)).toMatchObject({ kind: "conversation", word: "Começar." });
    data.learning.studyCompleted = 23;
    expect(studentNextStep(data)).toMatchObject({ kind: "study", href: "/demo/estudo" });
    data.learning.studyCompleted = 24;
    expect(studentNextStep(data)).toMatchObject({ kind: "booking", href: "#aula-ao-vivo" });
  });
  it("keeps the reservation after progress reset and never offers a second completed free lesson", () => {
    const data = { ...workspace(), liveClass: booking };
    expect(studentNextStep(data)).toMatchObject({ kind: "requested", href: "#aula-ao-vivo" });
    data.liveClass = { ...booking, status: "confirmed" };
    expect(studentNextStep(data)).toMatchObject({ kind: "confirmed", status: "Aula confirmada" });
    data.liveClass = { ...booking, status: "completed" };
    data.learning.studyCompleted = 24;
    expect(studentNextStep(data)).toMatchObject({ kind: "completed", href: "/demo/estudo" });
    data.liveClass = { ...booking, status: "cancelled" };
    expect(studentNextStep(data).kind).toBe("booking");
    data.learning.studyCompleted = 0;
    expect(studentNextStep(data).kind).toBe("conversation");
  });
  it("respects unavailable access and rejects another account's booking", () => {
    const data = { ...workspace(), liveClass: { ...booking, userId: "someone-else" } };
    expect(studentNextStep(data).kind).toBe("conversation");
    data.account.status = "pending"; data.learning.studyCompleted = 24;
    expect(studentNextStep(data).kind).toBe("booking");
    for (const status of ["suspended", "rejected"] as const) {
      data.account.status = status; data.learning.studyCompleted = 24;
      expect(studentNextStep(data).kind).toBe("access");
      expect(studentNextStep(data).href).toBeUndefined();
    }
  });
  it("highlights actual latest teacher replies, including closed threads, without claiming unread messages", () => {
    const thread = (id: string, role: "student" | "manager", updatedAt: string): TeacherConversation => ({ id, userId: "student", userName: "", userEmail: "", subject: "Dúvida", status: "closed", createdAt: "", updatedAt, messages: [{ id, authorId: role, authorName: "", role, body: "Mensagem", at: updatedAt }] });
    const replies = teacherReplies([thread("old", "manager", "2026-10-01T00:00:00Z"), thread("mine", "student", "2026-10-28T00:00:00Z"), thread("recent", "manager", "2026-10-27T00:00:00Z")]);
    expect(replies.map(item => item.id)).toEqual(["recent", "old"]);
  });
});
