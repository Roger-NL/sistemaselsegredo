import { describe, expect, it } from "vitest";
import type { UserRecord } from "firebase-admin/auth";
import { filterUsers } from "@/features/admin/model";
import { normalizeDraft, parseAdminAction } from "@/server/management/validation";
import { managementUser } from "@/server/management/service";
import { learningFromData, parseDemoSnapshot, parseStudySnapshot } from "@/server/workspace/validation";
import { createDemo } from "@/features/demo/model/reducer";
import { encodeSnapshot } from "@/features/demo/session/storage";
import { emptyProgress, studySteps } from "@/features/theory/progress";
import { isRetiredPage } from "@/lib/page-aliases";
import robots from "@/app/robots";
const draft = { name: "  Pessoa  ", email: " USER@EXAMPLE.COM ", role: "student", notes: " " };
const identity = { uid: "uid-1", displayName: "Júlia", email: "julia@example.com", disabled: false, customClaims: {}, metadata: { creationTime: "2026-10-01T00:00:00Z" } } as UserRecord;

describe("real management data validation", () => {
  it("keeps the admin route separate and excluded from indexing", () => {
    expect(isRetiredPage("/adm")).toBe(false);
    expect(robots().rules).toMatchObject({ disallow: expect.arrayContaining(["/adm"]) });
  });
  it("normalizes identity fields and rejects malformed drafts and unknown fields", () => {
    expect(normalizeDraft(draft)).toEqual({ name: "Pessoa", email: "user@example.com", role: "student", notes: "" });
    for (const invalid of [{ ...draft, name: " " }, { ...draft, email: "invalid" }, { ...draft, role: "admin" }, { ...draft, notes: "x".repeat(1001) }, { ...draft, subscriptionStatus: "premium" }]) expect(() => normalizeDraft(invalid)).toThrow();
  });
  it("allows only known operations and safe document IDs", () => {
    expect(parseAdminAction({ type: "approve", userId: "uid-1" })).toMatchObject({ type: "approve", userId: "uid-1" });
    for (const input of [{ type: "delete", userId: "uid-1" }, { type: "approve", userId: "users/other" }, { type: "approve", userId: "uid-1", premium: true }]) expect(() => parseAdminAction(input)).toThrow();
  });
  it("uses verified Auth claims for roles, never editable profile roles or legacy course percentages", () => {
    const user = managementUser(identity, { role: "manager", isAdmin: true, progress: 99, currentStreak: 200 });
    expect(user).toMatchObject({ role: "student", status: "active", progress: 0, lastLoginAt: null });
    expect(managementUser({ ...identity, customClaims: { admin: true } } as unknown as UserRecord).role).toBe("manager");
  });
  it("honors Auth disablement and explicitly rejected profiles", () => {
    expect(managementUser({ ...identity, disabled: true } as UserRecord).status).toBe("suspended");
    expect(managementUser({ ...identity, disabled: true } as UserRecord, { accountStatus: "rejected" }).status).toBe("rejected");
    expect(managementUser(identity, { accountStatus: "pending" }).status).toBe("pending");
  });
  it("combines actual conversation and study progress and supports accent-insensitive filters", () => {
    const user = managementUser(identity, {}, { demoPercent: 100, studySnapshot: JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) }) });
    expect(user.progress).toBe(100);
    expect(filterUsers([user], "julia", "active", "student")).toEqual([user]);
    expect(filterUsers([user], "example.com", "pending", "all")).toEqual([]);
  });
  it("starts empty and validates replayable conversation snapshots instead of trusting sent percentages", () => {
    expect(learningFromData()).toMatchObject({ revision: 0, demoPercent: 0, studyCompleted: 0, demoSnapshot: null, studySnapshot: null });
    const raw = encodeSnapshot(createDemo("beginner", "real-run-001", Date.now()));
    expect(parseDemoSnapshot(raw)).toEqual({ demoSnapshot: raw, demoPercent: 0 });
    expect(() => parseDemoSnapshot(JSON.stringify({ demoPercent: 100 }))).toThrow();
    expect(() => parseDemoSnapshot("x".repeat(750001))).toThrow();
  });
  it("validates the real study IDs and rejects duplicated or fabricated completions", () => {
    const valid = { ...emptyProgress, completed: [studySteps[0].step.id] };
    expect(parseStudySnapshot(JSON.stringify(valid)).studyCompleted).toBe(1);
    for (const completed of [["fabricated"], [studySteps[0].step.id, studySteps[0].step.id]]) expect(() => parseStudySnapshot(JSON.stringify({ ...emptyProgress, completed }))).toThrow();
    expect(parseStudySnapshot(null)).toEqual({ studySnapshot: null, studyCompleted: 0 });
  });
});
