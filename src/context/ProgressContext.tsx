"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PILLARS, PLANETS, type Pillar, type Planet, type PillarStatus } from "@/data/curriculum";
import { secureStorage } from "@/lib/secure-storage";
import { useAuth } from "@/context/AuthContext";

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
    /** Verifica se o usuário já viu a tela de 'Missão Concluída' */
    hasSeenMissionComplete: boolean;
    /** Marca que o usuário viu a tela de 'Missão Concluída' */
    markMissionCompleteSeen: () => void;
    /** Lista de IDs de módulos de pilares completados (ex: 'p1-m1') */
    completedPillarModules: string[];
    /** Marca um módulo de pilar como completado */
    markPillarModuleAsCompleted: (moduleId: string) => void;
    /** Verifica se um módulo de pilar está completado */
    isPillarModuleCompleted: (moduleId: string) => boolean;
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
    const { subscriptionStatus } = useAuth();
    const [pillarStatus, setPillarStatus] = useState<Record<string, PillarStatus>>(getInitialStatus);
    const [chosenSpecialization, setChosenSpecialization] = useState<string | null>(null);
    const [specializationStatus, setSpecializationStatus] = useState<'studying' | 'pending_approval' | 'completed' | null>(null);
    const [completedSpecializations, setCompletedSpecializations] = useState<string[]>([]);
    const [completedModules, setCompletedModules] = useState<Record<string, number[]>>({});
    const [completedPillarModules, setCompletedPillarModules] = useState<string[]>([]);
    const [hasSeenMissionComplete, setHasSeenMissionComplete] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // ... (useEffect logic remains same) ...

    // Verifica se pilar está desbloqueado
    const isPillarUnlocked = (pillarNumber: number): boolean => {
        // Regra de Ouro: Pilar 1 é sempre livre (Freemium)
        if (pillarNumber === 1) return true;

        // Regra Premium: Pilar 2+ exige assinatura ativa
        if (subscriptionStatus !== 'active') return false;

        // Regra de Progresso: Só libera se o anterior estiver feito (lógica antiga)
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

    // Marca módulo de pilar como completado
    const markPillarModuleAsCompleted = (moduleId: string) => {
        if (!completedPillarModules.includes(moduleId)) {
            setCompletedPillarModules(prev => [...prev, moduleId]);
        }
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
        secureStorage.setItem(STORAGE_KEY, {
            pillarStatus: initial,
            chosenSpecialization: null,
            specializationStatus: null,
            completedSpecializations: [],
            completedModules: {},
            completedPillarModules: [],
            hasSeenMissionComplete: false
        });
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
                completedPillarModules,
                markPillarModuleAsCompleted,
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