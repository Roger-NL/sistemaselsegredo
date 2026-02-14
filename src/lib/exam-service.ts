import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    orderBy,
    limit
} from "firebase/firestore";

export type ExamStatus = 'pending' | 'approved' | 'rejected';

export interface PillarExam {
    id?: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    pillarId: number;
    quizScore: number; // 0 a 100
    quizAttempts: number;
    writtenAnswer: string; // "O que achou + 3 exemplos"
    status: ExamStatus;
    adminFeedback?: string;
    createdAt: any;
    gradedAt?: any;
}

const COLLECTION = "pillar_exams";

/**
 * Enviar uma nova prova
 */
export async function submitExam(examData: Omit<PillarExam, 'status' | 'createdAt' | 'id'>) {
    try {
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
        const examRef = doc(db, COLLECTION, examId);
        await updateDoc(examRef, {
            status,
            adminFeedback: feedback || "",
            gradedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao avaliar." };
    }
}
