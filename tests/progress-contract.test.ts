import { describe, expect, it } from "vitest";
import { buildProgressSnapshotSeed, type ProgressContractFacts } from "@/lib/progress/contract";

const completeP2Facts: ProgressContractFacts = {
    subscriptionStatus: "premium",
    pillar1ModulesComplete: true,
    pillar1ExamStatus: "approved",
    pillar2ModulesComplete: true,
    pillar2ExamStatus: "approved",
    pillar2LiveSessionStatus: "confirmed",
};

describe("progress contract", () => {
    it("does not treat selecting or completing a specialization as completion of all pillars", () => {
        const snapshot = buildProgressSnapshotSeed({
            ...completeP2Facts,
            chosenSpecialization: true,
            completedSpecializationsCount: 1,
        });

        expect(snapshot.highestUnlockedPillar).toBe(3);
        expect(snapshot.eligibleForSpecialization).toBe(false);
    });

    it("requires premium before opening pillar 2", () => {
        const snapshot = buildProgressSnapshotSeed({
            ...completeP2Facts,
            subscriptionStatus: "free",
        });

        expect(snapshot.highestUnlockedPillar).toBe(1);
        expect(snapshot.blockedReason).toBe("premium_required");
    });

    it("requires the confirmed live session before pillar 3", () => {
        const snapshot = buildProgressSnapshotSeed({
            ...completeP2Facts,
            pillar2LiveSessionStatus: "pending_confirmation",
        });

        expect(snapshot.highestUnlockedPillar).toBe(2);
        expect(snapshot.nextAction).toBe("wait_pillar_2_live_session_confirmation");
    });
});
