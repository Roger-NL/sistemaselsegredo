import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
    type QueryDocumentSnapshot,
    type DocumentData,
} from "firebase/firestore";

const EXAMS_COLLECTION = "pillar_exams";
const LIVE_SESSIONS_COLLECTION = "live_sessions";
const USERS_COLLECTION = "users";
const BATCH_LIMIT = 400;

function chunkDocs<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

export async function resetUserCourseProgress(userId: string) {
    const examsSnapshot = await getDocs(
        query(collection(db, EXAMS_COLLECTION), where("userId", "==", userId))
    );
    const liveSessionsSnapshot = await getDocs(
        query(collection(db, LIVE_SESSIONS_COLLECTION), where("userId", "==", userId))
    );

    const examDocs = examsSnapshot.docs as QueryDocumentSnapshot<DocumentData>[];
    const liveSessionDocs = liveSessionsSnapshot.docs as QueryDocumentSnapshot<DocumentData>[];
    const allDocs = [...examDocs, ...liveSessionDocs];
    const batches = chunkDocs(allDocs, BATCH_LIMIT);
    const userRef = doc(db, USERS_COLLECTION, userId);

    if (batches.length === 0) {
        const batch = writeBatch(db);
        batch.update(userRef, {
            approvedPillar: 1,
            chosenSpecialization: null,
            specializationStatus: null,
            completedSpecializations: [],
            completedModules: {},
            completedPillarModules: [],
            hasSeenMissionComplete: false,
            localPillarStatus: {},
            currentStreak: 0,
        });
        await batch.commit();
        return { success: true, deletedExams: 0, deletedSessions: 0 };
    }

    for (let index = 0; index < batches.length; index++) {
        const batch = writeBatch(db);

        if (index === 0) {
            batch.update(userRef, {
                approvedPillar: 1,
                chosenSpecialization: null,
                specializationStatus: null,
                completedSpecializations: [],
                completedModules: {},
                completedPillarModules: [],
                hasSeenMissionComplete: false,
                localPillarStatus: {},
                currentStreak: 0,
            });
        }

        batches[index].forEach((examDoc) => batch.delete(examDoc.ref));
        await batch.commit();
    }

    return { success: true, deletedExams: examDocs.length, deletedSessions: liveSessionDocs.length };
}
