import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc 
} from "firebase/firestore";
import { User } from "@/lib/auth/service";

type AccessRequestUser = Pick<User, "name" | "email" | "approvedPillar">;

/**
 * Request Access to Next Pillar
 */
export async function requestPillarAccess(userId: string, currentPillar: number): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return { success: false, error: "Usuário não encontrado." };
        
        const userData = userSnap.data() as Partial<AccessRequestUser>;
        const requestedPillar = currentPillar + 1;

        // Check if already approved
        if ((typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1) >= requestedPillar) {
            return { success: true }; // Already approved
        }

        // Check if pending request exists
        const requestsRef = collection(db, "access_requests");
        const q = query(
            requestsRef, 
            where("userId", "==", userId), 
            where("requestedPillar", "==", requestedPillar),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return { success: true }; // Already requested
        }

        // Create Request
        await addDoc(collection(db, "access_requests"), {
            userId,
            userName: typeof userData.name === "string" ? userData.name : "Aluno",
            userEmail: typeof userData.email === "string" ? userData.email : "",
            currentPillar,
            requestedPillar,
            status: "pending",
            createdAt: serverTimestamp()
        });

        return { success: true };

    } catch (error) {
        console.error("Request Access Error:", error);
        return { success: false, error: "Erro ao solicitar acesso." };
    }
}

/**
 * Check if request is pending
 */
export async function checkPendingRequest(userId: string, requestedPillar: number): Promise<boolean> {
    try {
        const requestsRef = collection(db, "access_requests");
        const q = query(
            requestsRef, 
            where("userId", "==", userId), 
            where("requestedPillar", "==", requestedPillar),
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch {
        return false;
    }
}
