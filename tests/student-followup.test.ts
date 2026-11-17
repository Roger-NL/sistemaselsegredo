import { describe, expect, it } from "vitest";
import type { UserRecord } from "firebase-admin/auth";
import type { LiveClassBooking } from "@/contracts/live-class";
import { managementUser } from "@/server/management/service";
import { filterJourney, journeyCounts, journeyStage } from "@/features/admin/student-journey";
import { completeLessonSnapshot, lessonInput } from "./helpers/first-encounters-progress";
import { encodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
const identity = { uid: "student", displayName: "Júlia", email: "julia@example.com", disabled: false, customClaims: {}, metadata: {} } as UserRecord;
const fullStudy = completeLessonSnapshot();
const booking = { id: "student", userId: "student", status: "confirmed", start: "2026-11-01T13:00:00Z", end: "2026-11-01T14:00:00Z", timezone: "Europe/Lisbon" } as LiveClassBooking;
const user = (data: Record<string, unknown> = {}, status = "active", lesson: LiveClassBooking | null = null) => managementUser(identity, { accountStatus: status }, data, lesson);

describe("student follow-up grounded in saved account data", () => {
  it("only labels a student ready to book from valid completed practices and an available account", () => {
    expect(journeyStage(user({ studyCompleted: 24, demoPercent: 100 }))).toBe("not_started");
    expect(user({ studyCompleted: 24 }).canBookLiveClass).toBe(false);
    expect(journeyStage(user({ lessonSnapshot: fullStudy }))).toBe("ready");
    expect(journeyStage(user({ lessonSnapshot: fullStudy }, "pending"))).toBe("ready");
    expect(journeyStage(user({ lessonSnapshot: fullStudy }, "suspended"))).toBe("inactive");
  });
  it("tracks the new lesson without inheriting the retired ten-part conversation", () => {
    const started = user({ lessonSnapshot: encodeLessonAccountSnapshot(lessonInput(10)) });
    expect(started.conversation).toBeNull(); expect(started.studyTotal).toBe(49);
    expect(started.progress).toBe(39); expect(journeyStage(started)).toBe("study");
    const legacy = user({ demoSnapshot: "retired", studyCompleted: 24, demoPercent: 100 });
    expect(legacy.progress).toBe(0); expect(journeyStage(legacy)).toBe("not_started");
  });
  it("does not confuse a booking with eligibility, or lose a reservation after progress reset/access suspension", () => {
    const reserved = user({ lessonSnapshot: fullStudy }, "active", booking);
    expect(reserved.canBookLiveClass).toBe(false);
    expect(journeyStage(reserved)).toBe("scheduled");
    expect(journeyStage(user({}, "suspended", { ...booking, status: "pending" }))).toBe("requested");
    expect(journeyStage(user({}, "active", { ...booking, status: "completed" }))).toBe("completed");
    expect(journeyStage(user({ lessonSnapshot: fullStudy }, "active", { ...booking, status: "cancelled" }))).toBe("ready");
    expect(user({}, "active", { ...booking, userId: "someone-else" }).liveClass).toBeNull();
  });
  it("keeps manager accounts out of student cohorts unless explicitly included", () => {
    const students = [user({}, "pending"), { ...user({ lessonSnapshot: fullStudy }), id: "ready" }];
    const manager = { ...user({}, "active", booking), id: "manager", role: "manager" as const };
    expect(filterJourney([...students, manager], "", "all")).toHaveLength(2);
    expect(journeyCounts(filterJourney([...students, manager], "", "all"))).toMatchObject({ pending: 1, ready: 1, scheduled: 0 });
    expect(filterJourney([...students, manager], "", "scheduled", true)).toEqual([manager]);
  });
  it("supports accent-insensitive search and latest saved practice, without inventing activity from login", () => {
    const old = { ...user({ updatedAt: "2026-10-01T00:00:00Z" }), id: "old" };
    const recent = { ...user({ updatedAt: "2026-10-28T00:00:00Z" }), id: "recent" };
    const noPractice = { ...user(), id: "none", lastLoginAt: "2026-10-29T00:00:00Z" };
    expect(filterJourney([noPractice, old, recent], "julia", "all").map(item => item.id)).toEqual(["recent", "old", "none"]);
    expect(noPractice.lastLearningAt).toBeNull();
  });
});
