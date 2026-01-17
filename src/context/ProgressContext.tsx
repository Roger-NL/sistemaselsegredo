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
    /** Desbloqueia uma especialização específica */
    unlockSpecialization: (planetId: string) => void;
    /** ID da especialização escolhida (ou null) */
    chosenSpecialization: string | null;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

// Key para localStorage
const STORAGE_KEY = "es-english-progress";

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
                chosenSpecialization
            }));
        }
    }, [pillarStatus, chosenSpecialization, isHydrated]);

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

    // Desbloqueia especialização
    const unlockSpecialization = (planetId: string) => {
        setChosenSpecialization(planetId);
    };

    // Retorna planetas com status atualizado
    // Ghost (locked visível) se não completou pilares
    // Unlocked APENAS se completou pilares E foi escolhido
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            pillarStatus: initial,
            chosenSpecialization: null
        }));
        // Force reload para garantir limpeza visual
        window.location.reload();
    };

    // Não renderiza filhos até hidratar (evita hydration mismatch)
    if (!isHydrated) {
        return null;
    }

    return (
        <ProgressContext.Provider
            value={{
                pillarStatus,
                completePillar,
                getCurrentPillarNumber,
                getCompletedCount,
                areAllPillarsComplete,
                isPillarUnlocked,
                getPillarsWithStatus,
                getPlanetsWithStatus,
                resetProgress,
                unlockSpecialization,
                chosenSpecialization,
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
