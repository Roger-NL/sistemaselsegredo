import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
    limit,
    runTransaction,
    type DocumentData
} from "firebase/firestore";
import {
    buildStoredProgressSnapshot,
    deriveLegacyApprovedPillar,
    type WriterExamStatus,
    type WriterLiveSessionStatus,
} from "@/lib/auth/premium-access";

export type ExamStatus = 'pending' | 'approved' | 'rejected';

export interface PillarExam {
    id?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    pillarId: number;
    quizScore: number; // 0 a 100
    quizAttempts: number;
    writtenAnswer: string; // "O que achou + 3 exemplos"
    status: ExamStatus;
    adminFeedback?: string;
    createdAt: Timestamp | null;
    gradedAt?: Timestamp | null;
}

const COLLECTION = "pillar_exams";

async function recomputeUserProgressSnapshot(
    userId: string,
    overrides?: {
        pillar1ExamStatus?: WriterExamStatus;
        pillar2ExamStatus?: WriterExamStatus;
    }
) {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
        return;
    }

    const userData = userSnapshot.data() as {
        subscriptionStatus?: string;
        completedPillarModules?: string[];
        approvedPillar?: number;
    };

    const [pillar1Exam, pillar2Exam, liveSessionSnapshot] = await Promise.all([
        getUserExamStatus(userId, 1),
        getUserExamStatus(userId, 2),
        getDoc(doc(db, "live_sessions", `${userId}_p2`)),
    ]);

    const snapshot = buildStoredProgressSnapshot({
        subscriptionStatus: userData.subscriptionStatus,
        completedPillarModules: userData.completedPillarModules,
        pillar1ExamStatus: overrides?.pillar1ExamStatus ?? ((pillar1Exam?.status ?? "not_started") as WriterExamStatus),
        pillar2ExamStatus: overrides?.pillar2ExamStatus ?? ((pillar2Exam?.status ?? "not_started") as WriterExamStatus),
        pillar2LiveSessionStatus: (
            liveSessionSnapshot.exists()
                ? (liveSessionSnapshot.data()?.status as WriterLiveSessionStatus | undefined)
                : "not_created"
        ),
        currentApprovedPillar: typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1,
    });

    await updateDoc(userRef, {
        progressSnapshot: snapshot,
        approvedPillar: deriveLegacyApprovedPillar(snapshot),
    });
}

/**
 * Enviar uma nova prova
 */
export async function submitExam(examData: Omit<PillarExam, 'status' | 'createdAt' | 'id'>) {
    try {
        const pendingQuery = query(
            collection(db, COLLECTION),
            where("userId", "==", examData.userId),
            where("pillarId", "==", examData.pillarId),
            where("status", "==", "pending"),
            limit(1)
        );
        const pendingSnapshot = await getDocs(pendingQuery);

        if (!pendingSnapshot.empty) {
            return {
                success: false,
                error: "Ja existe uma missao pendente para este pilar. Aguarde a correcao antes de enviar novamente.",
            };
        }

        await addDoc(collection(db, COLLECTION), {
            ...examData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        await recomputeUserProgressSnapshot(
            examData.userId,
            examData.pillarId === 1
                ? { pillar1ExamStatus: "pending" }
                : examData.pillarId === 2
                    ? { pillar2ExamStatus: "pending" }
                    : undefined
        );
        return { success: true };
    } catch (error) {
        console.error("Erro ao enviar prova:", error);
        return { success: false, error: "Falha ao enviar missão." };
    }
}

/**
 * Buscar status da prova atual de um pilar
 */
export async function getUserExamStatus(userId: string, pillarId: number): Promise<PillarExam | null> {
    try {
        // Pega a última prova enviada para este pilar
        const q = query(
            collection(db, COLLECTION),
            where("userId", "==", userId),
            where("pillarId", "==", pillarId)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        // Sort in memory to get the latest (descending by createdAt)
        // Adjust for potential nulls or different timestamp formats if necessary
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PillarExam));
        docs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });

        return docs[0];
    } catch (error) {
        console.error("Erro ao buscar status da prova:", error);
        return null;
    }
}

/**
 * (ADMIN) Avaliar prova
 */
export async function gradeExam(examId: string, status: 'approved' | 'rejected', feedback?: string) {
    try {
        let affectedUserId: string | null = null;
        let affectedPillarId: number | null = null;

        await runTransaction(db, async (transaction) => {
            const examRef = doc(db, COLLECTION, examId);
            const examSnapshot = await transaction.get(examRef);

            if (!examSnapshot.exists()) {
                throw new Error("EXAM_NOT_FOUND");
            }

            const exam = {
                id: examSnapshot.id,
                ...examSnapshot.data(),
            } as PillarExam;
            affectedUserId = exam.userId;
            affectedPillarId = exam.pillarId;

            // Agora sim, as "escritas" (updates/sets)
            transaction.update(examRef, {
                status,
                adminFeedback: feedback || "",
                gradedAt: serverTimestamp()
            });
        });

        if (affectedUserId) {
            await recomputeUserProgressSnapshot(
                affectedUserId,
                affectedPillarId === 1
                    ? { pillar1ExamStatus: status }
                    : affectedPillarId === 2
                        ? { pillar2ExamStatus: status }
                        : undefined
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Erro ao avaliar prova:", error);
        return { success: false, error: "Erro ao avaliar." };
    }
}

/**
 * (ADMIN) Apenas editar feedback sem mudar status
 */
export async function updateExamFeedback(examId: string, feedback: string) {
    try {
        const examRef = doc(db, COLLECTION, examId);
        await updateDoc(examRef, {
            adminFeedback: feedback,
            gradedAt: serverTimestamp() // Update timestamp on edit? debatable, but safe.
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar feedback:", error);
        return { success: false, error: "Erro ao atualizar feedback." };
    }
}

export async function getExamById(examId: string): Promise<PillarExam | null> {
    try {
        const examRef = doc(db, COLLECTION, examId);
        const snapshot = await getDoc(examRef);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...(snapshot.data() as DocumentData),
        } as PillarExam;
    } catch (error) {
        console.error("Erro ao buscar prova:", error);
        return null;
    }
}

export async function deleteUserExams(userId: string) {
    try {
        const examsQuery = query(
            collection(db, COLLECTION),
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(examsQuery);
        await Promise.all(snapshot.docs.map((examDoc) => deleteDoc(examDoc.ref)));
        await recomputeUserProgressSnapshot(userId);
        return { success: true, deletedExams: snapshot.docs.length };
    } catch (error) {
        console.error("Erro ao apagar provas do usuário:", error);
        return { success: false, error: "Erro ao limpar provas." };
    }
}
