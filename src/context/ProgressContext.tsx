"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PILLARS, PLANETS, type Pillar, type Planet, type PillarStatus } from "@/data/curriculum";

// ============================================================================
// PROGRESS CONTEXT
// Gerenciamento de estado do progresso do aluno
// Persiste no localStorage para manter progresso entre sessões
// ============================================================================

interface ProgressContextType {
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
    resetProgress: () => void;
    /** Desbloqueia uma especialização específica (inicia estudo) */
    unlockSpecialization: (planetId: string) => void;
    /** Define o progresso até um pilar específico (Dev Mode) */
    setPillarLevel: (level: number) => void;
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
}

const ProgressContext = createContext<ProgressContextType | null>(null);

// Key para localStorage
const STORAGE_KEY = "es-english-progress-v2";

// Estado inicial: apenas pilar 1 desbloqueado
function getInitialStatus(): Record<string, PillarStatus> {
    const status: Record<string, PillarStatus> = {};
    PILLARS.forEach((pillar, index) => {
        status[pillar.id] = index === 0 ? "unlocked" : "locked";
    });
    return status;
}

// Provider
export function ProgressProvider({ children }: { children: ReactNode }) {
    const [pillarStatus, setPillarStatus] = useState<Record<string, PillarStatus>>(getInitialStatus);
    const [chosenSpecialization, setChosenSpecialization] = useState<string | null>(null);
    const [specializationStatus, setSpecializationStatus] = useState<'studying' | 'pending_approval' | 'completed' | null>(null);
    const [completedSpecializations, setCompletedSpecializations] = useState<string[]>([]);
    const [completedModules, setCompletedModules] = useState<Record<string, number[]>>({});
    const [isHydrated, setIsHydrated] = useState(false);

    // Carrega progresso do localStorage na montagem
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Retrocompatibilidade (se for string antiga sem chosenSpecialization)
                if (parsed.pillarStatus) {
                    setPillarStatus(parsed.pillarStatus);
                    setChosenSpecialization(parsed.chosenSpecialization || null);
                    setSpecializationStatus(parsed.specializationStatus || null);
                    setCompletedSpecializations(parsed.completedSpecializations || []);
                    setCompletedModules(parsed.completedModules || {});
                } else {
                    // Formato antigo (apenas status)
                    setPillarStatus(parsed);
                }
            } catch {
                setPillarStatus(getInitialStatus());
            }
        }
        setIsHydrated(true);
    }, []);

    // Salva no localStorage quando muda
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                pillarStatus,
                chosenSpecialization,
                specializationStatus,
                completedSpecializations,
                completedModules
            }));
        }
    }, [pillarStatus, chosenSpecialization, specializationStatus, completedSpecializations, completedModules, isHydrated]);

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
    const setPillarLevel = (level: number) => {
        const newStatus: Record<string, PillarStatus> = {};
        PILLARS.forEach((pillar, index) => {
            const pillarNum = index + 1;
            if (pillarNum < level) {
                newStatus[pillar.id] = "completed";
            } else if (pillarNum === level) {
                newStatus[pillar.id] = "unlocked";
            } else {
                newStatus[pillar.id] = "locked";
            }
        });
        setPillarStatus(newStatus);
    };

    // Retorna número do pilar atual
    const getCurrentPillarNumber = (): number => {
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
        return Object.values(pillarStatus).filter((s) => s === "completed").length;
    };

    // Verifica se todos completos
    const areAllPillarsComplete = (): boolean => {
        return getCompletedCount() === 9;
    };

    // Verifica se pilar está desbloqueado
    const isPillarUnlocked = (pillarNumber: number): boolean => {
        const status = pillarStatus[`pilar-${pillarNumber}`];
        return status === "unlocked" || status === "completed";
    };

    // Retorna pilares com status atualizado
    const getPillarsWithStatus = (): Pillar[] => {
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
        const allPillarsComplete = areAllPillarsComplete();
        return allPillarsComplete;
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
        }

        return Math.min(Math.round(pillarProgress + specProgress), 100);
    };

    // Retorna planetas com status atualizado
    const getPlanetsWithStatus = (): Planet[] => {
        const allComplete = areAllPillarsComplete();
        return PLANETS.map((planet) => ({
            ...planet,
            status: (allComplete && chosenSpecialization === planet.id) ? "unlocked" : "locked",
        }));
    };

    // Reseta progresso
    const resetProgress = () => {
        const initial = getInitialStatus();
        setPillarStatus(initial);
        setChosenSpecialization(null);
        setSpecializationStatus(null);
        setCompletedSpecializations([]);
        setCompletedModules({});
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            pillarStatus: initial,
            chosenSpecialization: null,
            specializationStatus: null,
            completedSpecializations: [],
            completedModules: {}
        }));
        window.location.reload();
    };

    return (
        <ProgressContext.Provider
            value={{
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