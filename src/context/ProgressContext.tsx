"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { PILLARS, PLANETS, type Pillar, type Planet, type PillarStatus } from "@/data/curriculum";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import { secureStorage } from "@/lib/storage/secure-storage";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/auth/service";
import type { ProgressSnapshotSeed } from "@/lib/progress/contract";

// ============================================================================
// PROGRESS CONTEXT
// Gerenciamento de estado do progresso do aluno
// Persiste no localStorage para manter progresso entre sessões
// ============================================================================

interface ProgressContextType {
    progressSnapshot: AppProgressSnapshot | null;
    /** Status de cada pilar (por ID) */
    pillarStatus: Record<string, PillarStatus>;
    /** Marca um pilar como completado e desbloqueia o próximo */
    completePillar: (pillarNumber: number) => void;
    /** Retorna o número do pilar atual (primeiro não-completed) */
    getCurrentPillarNumber: () => number;
    /** Conta pilares completados */
    getCompletedCount: () => number;
    /** Verifica se todos os pilares foram completados */
    areAllPillarsComplete: () => boolean;
    /** Verifica se um pilar específico está desbloqueado */
    isPillarUnlocked: (pillarNumber: number) => boolean;
    /** Retorna lista de pilares com status atualizado */
    getPillarsWithStatus: () => Pillar[];
    /** Retorna lista de planetas com status atualizado */
    getPlanetsWithStatus: () => Planet[];
    /** Reseta todo o progresso (para testes) */
    resetProgress: () => Promise<void>;
    /** Desbloqueia uma especialização específica (inicia estudo) */
    unlockSpecialization: (planetId: string) => void;
    /** Define o progresso até um pilar específico (Dev Mode) */
    setPillarLevel: (level: number) => Promise<void>;
    /** ID da especialização escolhida/ativa (ou null se nenhuma) */
    chosenSpecialization: string | null;
    /** Status da especialização atual: 'studying' | 'pending_approval' | 'completed' | null */
    specializationStatus: 'studying' | 'pending_approval' | 'completed' | null;
    /** Lista de IDs de especializações já completadas */
    completedSpecializations: string[];
    /** Retorna o objeto da especialização atual com nome e dados */
    getCurrentSpecialization: () => Planet | null;
    /** Verifica se pode escolher nova especialização */
    canChooseSpecialization: () => boolean;
    /** Marca um módulo de especialização como completado */
    completeModule: (specId: string, moduleIndex: number) => void;
    /** Verifica se um módulo específico está completado */
    isModuleCompleted: (specId: string, moduleIndex: number) => boolean;
    /** Retorna porcentagem global de conclusão (0-100) */
    getGlobalProgress: () => number;
    /** Finaliza a especialização atual, marca tudo como completo e volta para o menu */
    finishCurrentSpecialization: () => void;
    /** Verifica se o curso inteiro está completo (pilares + especialização) */
    isCourseFullyComplete: () => boolean;
    /** Verifica se uma especialização específica está completa */
    isSpecializationComplete: (specId: string) => boolean;
    /** Verifica se o usuário já viu a tela de 'Missão Concluída' */
    hasSeenMissionComplete: boolean;
    /** Marca que o usuário viu a tela de 'Missão Concluída' */
    markMissionCompleteSeen: () => void;
    /** Lista de IDs de módulos de pilares completados (ex: 'p1-m1') */
    completedPillarModules: string[];
    /** Marca um módulo de pilar como completado */
    markPillarModuleAsCompleted: (moduleId: string) => void;
    /** Alterna manualmente o status de um módulo de pilar (DevTools) */
    setPillarModuleCompletion: (moduleId: string, completed: boolean) => Promise<void>;
    /** Marca todos os módulos de todos os pilares como completos (DevTools) */
    completeAllPillarModules: () => Promise<void>;
    /** Marca todos os módulos de um pilar como completos (DevTools) */
    completePillarModulesForPillar: (pillarNumber: number) => Promise<void>;
    /** Limpa todos os módulos concluídos de um pilar (DevTools) */
    clearPillarModulesForPillar: (pillarNumber: number) => Promise<void>;
    /** Limpa todos os módulos concluídos dos pilares (DevTools) */
    clearAllPillarModules: () => Promise<void>;
    /** Remove as provas da conta atual (DevTools) */
    clearCurrentUserExams: () => Promise<void>;
    /** Verifica se um módulo de pilar está completado */
    isPillarModuleCompleted: (moduleId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

// Key para localStorage
const STORAGE_KEY = "es-english-progress-v2";

type ProgressSnapshot = Pick<
    User,
    | "chosenSpecialization"
    | "specializationStatus"
    | "completedSpecializations"
    | "completedModules"
    | "completedPillarModules"
    | "hasSeenMissionComplete"
> & {
    pillarStatus: Record<string, PillarStatus>;
};

type AppProgressSnapshot = ProgressSnapshotSeed & {
    legacyAccessOverride?: boolean;
};

type UserWithProgressSnapshot = User & {
    progressSnapshot?: AppProgressSnapshot | null;
};

// Estado inicial: apenas pilar 1 desbloqueado
function getInitialStatus(): Record<string, PillarStatus> {
    const status: Record<string, PillarStatus> = {};
    PILLARS.forEach((pillar, index) => {
        status[pillar.id] = index === 0 ? "unlocked" : "locked";
    });
    return status;
}

function getAllPillarModuleIds(): string[] {
    return Object.values(PILLARS_CONTENT).flatMap((pillar) => pillar.modules?.map((module) => module.id) ?? []);
}

function getPillarModuleIds(pillarNumber: number): string[] {
    return PILLARS_CONTENT[pillarNumber]?.modules?.map((module) => module.id) ?? [];
}

function isNumberArray(value: unknown): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function extractProgressSnapshot(user: User | null): AppProgressSnapshot | null {
    const snapshot = (user as UserWithProgressSnapshot | null)?.progressSnapshot;
    if (!snapshot || typeof snapshot !== "object") {
        return null;
    }

    const candidate = snapshot as Partial<AppProgressSnapshot>;
    if (
        typeof candidate.currentPillar !== "number" ||
        typeof candidate.highestUnlockedPillar !== "number" ||
        !isNumberArray(candidate.completedPillars) ||
        typeof candidate.nextAction !== "string" ||
        typeof candidate.gateState !== "string" ||
        typeof candidate.eligibleForSpecialization !== "boolean"
    ) {
        return null;
    }

    return {
        currentPillar: candidate.currentPillar,
        highestUnlockedPillar: candidate.highestUnlockedPillar,
        completedPillars: candidate.completedPillars,
        blockedReason: candidate.blockedReason ?? null,
        nextAction: candidate.nextAction,
        gateState: candidate.gateState,
        eligibleForSpecialization: candidate.eligibleForSpecialization,
        legacyAccessOverride: candidate.legacyAccessOverride,
    };
}

function buildPillarStatusFromSnapshot(snapshot: AppProgressSnapshot): Record<string, PillarStatus> {
    const completedPillars = new Set(snapshot.completedPillars);

    return PILLARS.reduce<Record<string, PillarStatus>>((acc, pillar, index) => {
        const pillarNumber = index + 1;

        if (completedPillars.has(pillarNumber)) {
            acc[pillar.id] = "completed";
        } else if (pillarNumber <= snapshot.highestUnlockedPillar) {
            acc[pillar.id] = "unlocked";
        } else {
            acc[pillar.id] = "locked";
        }

        return acc;
    }, {});
}

function serializeRemoteProgress(data: Pick<
    ProgressSnapshot,
    | "chosenSpecialization"
    | "specializationStatus"
    | "completedSpecializations"
    | "completedModules"
    | "completedPillarModules"
    | "hasSeenMissionComplete"
>) {
    return JSON.stringify({
        chosenSpecialization: data.chosenSpecialization ?? null,
        specializationStatus: data.specializationStatus ?? null,
        completedSpecializations: data.completedSpecializations ?? [],
        completedModules: data.completedModules ?? {},
        completedPillarModules: data.completedPillarModules ?? [],
        hasSeenMissionComplete: data.hasSeenMissionComplete ?? false,
    });
}

// Provider
export function ProgressProvider({ children }: { children: ReactNode }) {
    const { user, subscriptionStatus } = useAuth(); // NOW using user
    const isAdminUser = !!user?.email && ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"].includes(user.email);
    const progressSnapshot = extractProgressSnapshot(user);
    const [pillarStatus, setPillarStatus] = useState<Record<string, PillarStatus>>(getInitialStatus);
    const [chosenSpecialization, setChosenSpecialization] = useState<string | null>(null);
    const [specializationStatus, setSpecializationStatus] = useState<'studying' | 'pending_approval' | 'completed' | null>(null);
    const [completedSpecializations, setCompletedSpecializations] = useState<string[]>([]);
    const [completedModules, setCompletedModules] = useState<Record<string, number[]>>({});
    const [completedPillarModules, setCompletedPillarModules] = useState<string[]>([]);
    const [hasSeenMissionComplete, setHasSeenMissionComplete] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const lastRemoteProgressSyncRef = useRef<string | null>(null);

    // Dynamic key based on user ID to prevent shared progress
    const storageKey = user?.id ? `${STORAGE_KEY}-${user.id}` : null;

    // Carrega progresso do localStorage na montagem ou quando user muda
    useEffect(() => {
        if (!storageKey) {
            // ... (reset logica)
            if (!user) {
                setPillarStatus(getInitialStatus());
                setChosenSpecialization(null);
                setSpecializationStatus(null);
                setCompletedSpecializations([]);
                setCompletedModules({});
                setCompletedPillarModules([]);
                setHasSeenMissionComplete(false);
            }
            return;
        }

        const stored = secureStorage.getItem<ProgressSnapshot>(storageKey);

        let initialStatus = getInitialStatus();
        if (stored && stored.pillarStatus) {
            initialStatus = stored.pillarStatus;
        }

        if (stored) {
            setChosenSpecialization(stored.chosenSpecialization || null);
            setSpecializationStatus(stored.specializationStatus || null);
            setCompletedSpecializations(stored.completedSpecializations || []);
            setCompletedModules(stored.completedModules || {});
            setCompletedPillarModules(stored.completedPillarModules || []);
            setHasSeenMissionComplete(stored.hasSeenMissionComplete || false);
        }

        // SYNC WITH FIREBASE (progress snapshot preferred, legacy approvedPillar as fallback)
        if (user) {
            if (progressSnapshot) {
                initialStatus = buildPillarStatusFromSnapshot(progressSnapshot);
            } else if (user.approvedPillar) {
                // Legacy fallback while progressSnapshot is still rolling out.
                const approvedLevel = user.approvedPillar;
                const hasRemoteLocalPillarStatus = user.localPillarStatus !== undefined;
                const newStatus: Record<string, PillarStatus> = {};
                PILLARS.forEach((pillar, index) => {
                    const pillarNum = index + 1;
                    if (pillarNum < approvedLevel) {
                        newStatus[pillar.id] = "completed";
                    } else if (pillarNum === approvedLevel) {
                        const localCompleted = hasRemoteLocalPillarStatus
                            ? user.localPillarStatus?.[pillar.id] === "completed"
                            : initialStatus[pillar.id] === "completed" || user.localPillarStatus?.[pillar.id] === "completed";

                        if (localCompleted) {
                            newStatus[pillar.id] = "completed";
                        } else {
                            newStatus[pillar.id] = "unlocked";
                        }
                    } else {
                        newStatus[pillar.id] = "locked";
                    }
                });
                initialStatus = newStatus;
            }

            // 2. Specialty Progress (Firebase Authority if exists, else merge/fallback)
            // If Firebase has data, it wins over local storage to allow cross-device sync.
            if (user.chosenSpecialization !== undefined) setChosenSpecialization(user.chosenSpecialization);
            if (user.specializationStatus !== undefined) setSpecializationStatus(user.specializationStatus);
            if (user.completedSpecializations !== undefined) setCompletedSpecializations(user.completedSpecializations);

            // For complex objects, we might want to merge or prefer server. Let's prefer server if present.
            if (user.completedModules !== undefined) {
                setCompletedModules(user.completedModules);
            }
            if (user.completedPillarModules !== undefined) {
                setCompletedPillarModules(user.completedPillarModules);
            }
            if (user.hasSeenMissionComplete !== undefined) setHasSeenMissionComplete(user.hasSeenMissionComplete);
        }

        setPillarStatus(initialStatus);

        setIsHydrated(true);
    }, [progressSnapshot, storageKey, user]); // Re-run when user changes

    // Salva progresso no localStorage sempre que mudar
    // Salva progresso no localStorage E FIREBASE sempre que mudar
    useEffect(() => {
        if (storageKey && isHydrated) {
            const progressData: ProgressSnapshot = {
                pillarStatus,
                chosenSpecialization,
                specializationStatus,
                completedSpecializations,
                completedModules,
                completedPillarModules,
                hasSeenMissionComplete
            };

            // 1. Local Persistence (Fast, Offline)
            secureStorage.setItem(storageKey, progressData);

            if (!user?.id) return;

            const nextRemoteProgress = {
                chosenSpecialization,
                specializationStatus,
                completedSpecializations,
                completedModules,
                completedPillarModules,
                hasSeenMissionComplete,
            };
            const nextRemoteProgressJson = serializeRemoteProgress(nextRemoteProgress);
            const currentRemoteProgressJson = serializeRemoteProgress({
                chosenSpecialization: user.chosenSpecialization,
                specializationStatus: user.specializationStatus,
                completedSpecializations: user.completedSpecializations,
                completedModules: user.completedModules,
                completedPillarModules: user.completedPillarModules,
                hasSeenMissionComplete: user.hasSeenMissionComplete,
            });

            if (
                nextRemoteProgressJson === currentRemoteProgressJson ||
                nextRemoteProgressJson === lastRemoteProgressSyncRef.current
            ) {
                lastRemoteProgressSyncRef.current = nextRemoteProgressJson;
                return;
            }

            const timeout = window.setTimeout(() => {
                lastRemoteProgressSyncRef.current = nextRemoteProgressJson;
                import("@/lib/auth/service").then(({ updateUserProgress }) => {
                    updateUserProgress(user.id, nextRemoteProgress);
                });
            }, 900);

            return () => window.clearTimeout(timeout);
        }
    }, [
        pillarStatus,
        chosenSpecialization,
        specializationStatus,
        completedSpecializations,
        completedModules,
        completedPillarModules,
        hasSeenMissionComplete,
        storageKey,
        user?.id,
        user?.chosenSpecialization,
        user?.specializationStatus,
        user?.completedSpecializations,
        user?.completedModules,
        user?.completedPillarModules,
        user?.hasSeenMissionComplete,
        isHydrated
    ]);

    // Marca pilar como completado e desbloqueia próximo
    const completePillar = (pillarNumber: number) => {
        setPillarStatus((prev) => {
            const newStatus = { ...prev };
            const currentPillarId = `pilar-${pillarNumber}`;
            const nextPillarId = `pilar-${pillarNumber + 1}`;

            // Marca atual como completed
            newStatus[currentPillarId] = "completed";

            // Desbloqueia próximo (se existir)
            if (pillarNumber < 9 && newStatus[nextPillarId]) {
                newStatus[nextPillarId] = "unlocked";
            }

            return newStatus;
        });
    };

    // Define nível específico (Dev Mode)
    const setPillarLevel = async (level: number) => {
        const safeLevel = Math.min(Math.max(level, 1), 9);

        if (safeLevel <= 1) {
            const initial = getInitialStatus();
            setPillarStatus(initial);
            setChosenSpecialization(null);
            setSpecializationStatus(null);
            setCompletedSpecializations([]);
            setCompletedModules({});
            setCompletedPillarModules([]);
            setHasSeenMissionComplete(false);

            if (storageKey) {
                secureStorage.setItem(storageKey, {
                    pillarStatus: initial,
                    chosenSpecialization: null,
                    specializationStatus: null,
                    completedSpecializations: [],
                    completedModules: {},
                    completedPillarModules: [],
                    hasSeenMissionComplete: false
                });
            }

            if (user?.id) {
                const { resetUserCourseProgress } = await import("@/lib/admin/reset-user-course-progress");
                await resetUserCourseProgress(user.id);
            }
            return;
        }

        const newStatus: Record<string, PillarStatus> = {};
        PILLARS.forEach((pillar, index) => {
            const pillarNum = index + 1;
            if (pillarNum < safeLevel) {
                newStatus[pillar.id] = "completed";
            } else if (pillarNum === safeLevel) {
                newStatus[pillar.id] = "unlocked";
            } else {
                newStatus[pillar.id] = "locked";
            }
        });
        setPillarStatus(newStatus);
        setCompletedPillarModules([]);
        // Dev override keeps the legacy pillar pointer in sync during transition,
        // but no longer persists localPillarStatus as remote gating authority.
        if (user?.id) {
            import("@/lib/auth/service").then(({ updateUserProgress }) => {
                updateUserProgress(user.id, {
                    completedPillarModules: [],
                    approvedPillar: safeLevel, // Sync the "Server Authority" as well
                });
            });
        }
    };

    // Retorna número do pilar atual
    const getCurrentPillarNumber = (): number => {
        if (progressSnapshot?.currentPillar) {
            return progressSnapshot.currentPillar;
        }

        if (!isAdminUser && subscriptionStatus !== "premium") {
            return 1;
        }

        // First trust the user object if available
        if (user?.approvedPillar) return user.approvedPillar;

        for (let i = 1; i <= 9; i++) {
            const status = pillarStatus[`pilar-${i}`];
            if (status !== "completed") {
                return i;
            }
        }
        return 9; // Todos completos
    };

    // Conta pilares completados
    const getCompletedCount = (): number => {
        if (progressSnapshot) {
            return progressSnapshot.completedPillars.length;
        }

        return Object.values(pillarStatus).filter((s) => s === "completed").length;
    };

    // Verifica se todos completos
    const areAllPillarsComplete = (): boolean => {
        return getCompletedCount() === 9;
    };

    // Verifica se pilar está desbloqueado
    const isPillarUnlocked = (pillarNumber: number): boolean => {
        // Regra de Ouro: Pilar 1 é sempre livre (Freemium)
        if (pillarNumber === 1) return true;

        if (progressSnapshot) {
            return pillarNumber <= progressSnapshot.highestUnlockedPillar;
        }

        // Pilar 2+ exige premium sem excecao.
        if (!isAdminUser && subscriptionStatus !== 'premium') return false;

        // Regra de Admin/Progresso:
        // Se user.approvedPillar for definido, ele tem prioridade absoluta.
        if (user?.approvedPillar && pillarNumber <= user.approvedPillar) {
            return true;
        }

        // Utilizar o `pillarStatus` como fonte única de verdade
        const status = pillarStatus[`pilar-${pillarNumber}`];
        return status === "unlocked" || status === "completed";
    };

    // Retorna pilares com status atualizado
    const getPillarsWithStatus = (): Pillar[] => {
        if (progressSnapshot) {
            const snapshotStatus = buildPillarStatusFromSnapshot(progressSnapshot);

            return PILLARS.map((pillar, index) => ({
                ...pillar,
                status: index === 0 && !isAdminUser && subscriptionStatus !== "premium"
                    ? (snapshotStatus[pillar.id] || "unlocked")
                    : (snapshotStatus[pillar.id] || "locked"),
            }));
        }

        if (!isAdminUser && subscriptionStatus !== "premium") {
            return PILLARS.map((pillar, index) => ({
                ...pillar,
                status: index === 0 ? (pillarStatus[pillar.id] || "unlocked") : "locked",
            }));
        }

        return PILLARS.map((pillar) => ({
            ...pillar,
            status: pillarStatus[pillar.id] || "locked",
        }));
    };

    // Desbloqueia especialização - inicia estudo dela
    const unlockSpecialization = (planetId: string) => {
        setChosenSpecialization(planetId);
        setSpecializationStatus('studying');
    };

    // Retorna o objeto da especialização atual
    const getCurrentSpecialization = (): Planet | null => {
        if (!chosenSpecialization) return null;
        return PLANETS.find(p => p.id === chosenSpecialization) || null;
    };

    // Verifica se pode escolher nova especialização
    const canChooseSpecialization = (): boolean => {
        return progressSnapshot?.eligibleForSpecialization ?? areAllPillarsComplete();
    };

    // Marca módulo como completo
    const completeModule = (specId: string, moduleIndex: number) => {
        setCompletedModules(prev => {
            const current = prev[specId] || [];
            if (!current.includes(moduleIndex)) {
                return { ...prev, [specId]: [...current, moduleIndex] };
            }
            return prev;
        });
    };

    // Verifica se módulo está completo
    const isModuleCompleted = (specId: string, moduleIndex: number) => {
        return completedModules[specId]?.includes(moduleIndex) || false;
    };

    // Verifica se uma especialização específica está completa
    const isSpecializationComplete = (specId: string) => {
        const count = completedModules[specId]?.length || 0;
        return count >= 5; // Assumindo 5 módulos
    };

    // Verifica conclusão total (Base + Especialização)
    const isCourseFullyComplete = () => {
        if (!areAllPillarsComplete()) return false;
        if (specializationStatus === "completed" && completedSpecializations.length > 0) return true;
        if (!chosenSpecialization) return false;
        return isSpecializationComplete(chosenSpecialization);
    };

    // Finaliza a especialização atual (marca como completa e sai)
    const finishCurrentSpecialization = () => {
        if (chosenSpecialization) {
            // Marca todos os 5 módulos como completos
            setCompletedModules(prev => ({
                ...prev,
                [chosenSpecialization]: [1, 2, 3, 4, 5]
            }));
            setCompletedSpecializations(prev =>
                prev.includes(chosenSpecialization) ? prev : [...prev, chosenSpecialization]
            );
            setSpecializationStatus("completed");
            // Sai da especialização (volta para o menu de escolha)
            setChosenSpecialization(null);
        }
    };

    // Calcula progresso global (0-100)
    // Nova lógica: 50% = pilares completos, 50% = especialização completa
    const getGlobalProgress = () => {
        // Pilares valem 50% do total
        const pillarProgress = (getCompletedCount() / 9) * 50;

        // Especialização vale os outros 50%
        let specProgress = 0;
        if (chosenSpecialization) {
            const completedModulesCount = completedModules[chosenSpecialization]?.length || 0;
            // Cada módulo (de 5) vale 10% do total (50% / 5 = 10%)
            specProgress = Math.min(completedModulesCount * 10, 50);
        } else if (specializationStatus === "completed" && completedSpecializations.length > 0) {
            specProgress = 50;
        }

        return Math.min(Math.round(pillarProgress + specProgress), 100);
    };

    // Marca módulo de pilar como completado
    const markPillarModuleAsCompleted = (moduleId: string) => {
        if (!completedPillarModules.includes(moduleId)) {
            setCompletedPillarModules(prev => [...prev, moduleId]);
        }
    };

    const syncCompletedPillarModules = async (moduleIds: string[]) => {
        if (user?.id) {
            const { updateUserProgress } = await import("@/lib/auth/service");
            await updateUserProgress(user.id, {
                completedPillarModules: moduleIds,
            });
        }
    };

    const setPillarModuleCompletion = async (moduleId: string, completed: boolean) => {
        const next = completed
            ? Array.from(new Set([...completedPillarModules, moduleId]))
            : completedPillarModules.filter((id) => id !== moduleId);

        setCompletedPillarModules(next);
        await syncCompletedPillarModules(next);
    };

    const completeAllPillarModules = async () => {
        const allModuleIds = getAllPillarModuleIds();
        setCompletedPillarModules(allModuleIds);
        await syncCompletedPillarModules(allModuleIds);
    };

    const completePillarModulesForPillar = async (pillarNumber: number) => {
        const ids = getPillarModuleIds(pillarNumber);
        const next = Array.from(new Set([...completedPillarModules, ...ids]));
        setCompletedPillarModules(next);
        await syncCompletedPillarModules(next);
    };

    const clearPillarModulesForPillar = async (pillarNumber: number) => {
        const ids = getPillarModuleIds(pillarNumber);
        const next = completedPillarModules.filter((id) => !ids.includes(id));
        setCompletedPillarModules(next);
        await syncCompletedPillarModules(next);
    };

    const clearAllPillarModules = async () => {
        setCompletedPillarModules([]);
        await syncCompletedPillarModules([]);
    };

    const clearCurrentUserExams = async () => {
        if (!user?.id) return;
        const { deleteUserExams } = await import("@/lib/exam/service");
        await deleteUserExams(user.id);
    };

    // Verifica se módulo de pilar está completado
    const isPillarModuleCompleted = (moduleId: string) => {
        return completedPillarModules.includes(moduleId);
    };

    // Marca que o usuário viu a tela de Missão Concluída
    const markMissionCompleteSeen = () => {
        setHasSeenMissionComplete(true);
    };

    // Retorna planetas com status atualizado
    const getPlanetsWithStatus = (): Planet[] => {
        const allComplete = progressSnapshot?.eligibleForSpecialization ?? areAllPillarsComplete();
        return PLANETS.map((planet) => ({
            ...planet,
            status: allComplete ? "unlocked" : "locked",
        }));
    };

    // Reseta progresso
    const resetProgress = async () => {
        const initial = getInitialStatus();
        setPillarStatus(initial);
        setChosenSpecialization(null);
        setSpecializationStatus(null);
        setCompletedSpecializations([]);
        setCompletedModules({});
        setCompletedPillarModules([]);
        setHasSeenMissionComplete(false);
        if (storageKey) {
            secureStorage.setItem(storageKey, {
                pillarStatus: initial,
                chosenSpecialization: null,
                specializationStatus: null,
                completedSpecializations: [],
                completedModules: {},
                completedPillarModules: [],
                hasSeenMissionComplete: false
            });
        }
        // Reset only the currently logged-in account in DevTools, including exams,
        // so old Pillar 1 submissions don't auto-open Pillar 2 again.
        if (user?.id) {
            const { resetUserCourseProgress } = await import("@/lib/admin/reset-user-course-progress");
            await resetUserCourseProgress(user.id);
        }
    };

    return (
        <ProgressContext.Provider
            value={{
                progressSnapshot,
                pillarStatus,
                completePillar,
                setPillarLevel,
                getCurrentPillarNumber,
                getCompletedCount,
                areAllPillarsComplete,
                isPillarUnlocked,
                getPillarsWithStatus,
                getPlanetsWithStatus,
                resetProgress,
                unlockSpecialization,
                chosenSpecialization,
                specializationStatus,
                completedSpecializations,
                getCurrentSpecialization,
                canChooseSpecialization,
                completeModule,
                isModuleCompleted,
                isCourseFullyComplete,
                isSpecializationComplete,
                finishCurrentSpecialization,
                getGlobalProgress,
                completedPillarModules,
                markPillarModuleAsCompleted,
                setPillarModuleCompletion,
                completeAllPillarModules,
                completePillarModulesForPillar,
                clearPillarModulesForPillar,
                clearAllPillarModules,
                clearCurrentUserExams,
                isPillarModuleCompleted,
                hasSeenMissionComplete,
                markMissionCompleteSeen,
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
}

// Hook para usar o contexto
export function useProgress() {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error("useProgress must be used within a ProgressProvider");
    }
    return context;
}
