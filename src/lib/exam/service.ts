import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
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

            transaction.update(examRef, {
                status,
                adminFeedback: feedback || "",
                gradedAt: serverTimestamp()
            });

            if (status === "approved") {
                const userRef = doc(db, "users", exam.userId);
                const userSnapshot = await transaction.get(userRef);
                const currentApprovedPillar = Number(userSnapshot.data()?.approvedPillar || 1);
                const nextApprovedPillar = Math.max(currentApprovedPillar, exam.pillarId + 1);

                transaction.update(userRef, {
                    approvedPillar: nextApprovedPillar,
                });
            }
        });
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
