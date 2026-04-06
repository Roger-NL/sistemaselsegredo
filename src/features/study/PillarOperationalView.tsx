"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    AlertCircle, CheckCircle2, Lightbulb, Target, Zap, Play,
    Table as TableIcon, MessageSquare, Terminal, Cpu, HelpCircle,
    Eye, ChevronDown, Lock, Unlock, ArrowRight, Brain, Crosshair, Volume2, Gamepad2
} from "lucide-react";
import { ContentBlock, PillarData } from "@/types/study";
import { cn } from "@/lib/ui/cn";
import { useProgress } from "@/context/ProgressContext";
import { AudioButton } from "@/components/ui/AudioButton";
import { parseTranslatable, extractTranslatableText, parseTextWithTranslations } from "@/utils/translation";
import { parseQuizContent, splitOutsideTranslatable } from "@/utils/content-parsers";
import { playUiSfx } from "@/utils/ui-sfx";

interface PillarOperationalViewProps {
    data: PillarData;
}

// Utility functions removed, now using centralized ones from @/utils/translation
// ============================================================================
// DARK MODE BLOCK RENDERER
// ============================================================================

const BoxIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "box-goal": return <Target className="w-5 h-5 text-emerald-400" />;
        case "box-insight": return <Lightbulb className="w-5 h-5 text-cyan-400" />;
        case "box-warning": return <AlertCircle className="w-5 h-5 text-amber-400" />;
        case "box-action": return <Zap className="w-5 h-5 text-violet-400" />;
        case "micro-win": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        case "pillar-end": return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
        default: return null;
    }
};

const BoxStyles = {
    "box-goal": "bg-emerald-950/30 border-emerald-500/30 text-emerald-100",
    "box-insight": "bg-cyan-950/30 border-cyan-500/30 text-cyan-100",
    "box-warning": "bg-amber-950/30 border-amber-500/30 text-amber-100",
    "box-action": "bg-violet-950/30 border-violet-500/30 text-violet-100",
    "micro-win": "bg-emerald-950/40 border-emerald-400/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    "pillar-end": "bg-emerald-950/20 border-emerald-500/50 text-emerald-50 text-center py-6 md:py-10",
};

const InteractiveQuiz = ({ question, options, answer }: { question: string, options: string[], answer: number }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (idx: number) => {
        setSelected(idx);
        setShowResult(true);
        playUiSfx(idx === answer ? "success" : "error");
    };

    return (
        <div className="my-6 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-slate-200 font-mono text-xs md:text-sm tracking-wider">QUIZ RÁPIDO</h4>
            </div>
            <p className="text-base md:text-lg text-slate-300 mb-6 leading-relaxed">{parseTextWithTranslations(question)}</p>
            <div className="grid gap-3">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={showResult}
                        className={cn(
                            "w-full text-left px-4 py-3 md:py-4 rounded border transition-all duration-200 flex justify-between items-center text-sm md:text-base",
                            showResult && idx === answer
                                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                : showResult && idx === selected && idx !== answer
                                    ? "bg-red-900/40 border-red-500/50 text-red-100"
                                    : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400"
                        )}
                    >
                        <span className="flex-1 mr-2">{parseTextWithTranslations(opt)}</span>
                        {showResult && idx === answer && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                        {showResult && idx === selected && idx !== answer && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

type MazeConfig = {
    title?: string;
    subtitle?: string;
    goal?: string;
    context?: string;
    winMessage?: string;
    stages?: {
        id?: string;
        title: string;
        situation: string;
        prompt: string;
        options: string[];
        answer: number;
        explain?: string;
        successText?: string;
        errorText?: string;
    }[];
    grid?: string[];
    start?: [number, number];
    end?: [number, number];
    questions?: {
        q: string;
        options: string[];
        answer: number;
        explain?: string;
    }[];
    easyQuestions?: {
        q: string;
        options: string[];
        answer: number;
        explain?: string;
    }[];
    mazeVariants?: string[][];
};

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const DEFAULT_MAZE: Required<MazeConfig> = {
    title: "Rota da Conversa",
    subtitle: "Transforme o que o módulo ensinou em uma interação completa.",
    goal: "Saia do primeiro contato e chegue ao fechamento da conversa usando escolhas que soam naturais.",
    context: "Cenário: você entrou em um café e quer pedir algo sem soar seco. Cada checkpoint representa uma etapa real da conversa.",
    winMessage: "Interação concluída. Você abriu contato, pediu, ajustou e fechou com naturalidade.",
    stages: [
        {
            id: "start-contact",
            title: "Abrir contato",
            situation: "Você quer chamar o atendente sem parecer brusco.",
            prompt: "Qual abertura cria contato do jeito mais natural?",
            options: ["Hey.", "Hi, excuse me.", "I need you."],
            answer: 1,
            explain: "\"Hi, excuse me\" abre espaço social antes do pedido. Soa leve e respeitoso.",
            successText: "Contato aberto sem pressão.",
            errorText: "Essa abertura até chama atenção, mas não prepara bem o resto da conversa.",
        },
        {
            id: "make-request",
            title: "Fazer pedido",
            situation: "Agora você vai pedir algo simples.",
            prompt: "Qual pedido mantém tom gentil e claro?",
            options: ["I want a coffee.", "Could I have a coffee, please?", "Coffee now."],
            answer: 1,
            explain: "\"Could I have... please?\" transforma a fala em pedido social, não em ordem seca.",
            successText: "Pedido feito com clareza.",
            errorText: "Foi entendido, mas soou mais duro do que precisava.",
        },
        {
            id: "handle-fast-speech",
            title: "Ganhar tempo",
            situation: "A pessoa respondeu rápido e você não pegou tudo.",
            prompt: "Qual resposta mantém a conversa viva sem fingir que entendeu?",
            options: ["What?", "Could you repeat that, please?", "Never mind."],
            answer: 1,
            explain: "Pedir repetição com gentileza mostra cuidado, não fraqueza.",
            successText: "Você manteve a conversa andando.",
            errorText: "Aqui o melhor é pedir ajuda sem quebrar o clima da conversa.",
        },
        {
            id: "confirm",
            title: "Confirmar",
            situation: "Você quer ter certeza de que o pedido ficou certo.",
            prompt: "Qual frase confirma sem soar travado?",
            options: ["So, just to confirm: one coffee, right?", "You understand me?", "Coffee. Right. Okay."],
            answer: 0,
            explain: "Confirmar em resumo evita erro e ainda mostra organização.",
            successText: "Confirmação feita sem atrito.",
            errorText: "Faltou um fechamento mais claro e natural nessa etapa.",
        },
        {
            id: "close",
            title: "Fechar bem",
            situation: "A interação terminou. Agora é hora de sair bem.",
            prompt: "Qual fechamento deixa a conversa leve até o final?",
            options: ["Okay.", "Great, thank you!", "Done."],
            answer: 1,
            explain: "Fechamento gentil melhora a percepção do seu inglês e encerra a conversa com naturalidade.",
            successText: "Você fechou a interação com naturalidade.",
            errorText: "Dá para fechar melhor com uma resposta curta e gentil.",
        },
    ],
    grid: [
        "#########",
        "#S....#.#",
        "###.#.#.#",
        "#...#...#",
        "#.###.###",
        "#...#...#",
        "#.#.###.#",
        "#.#....E#",
        "#########",
    ],
    mazeVariants: [
        [
            "#########",
            "#S....#.#",
            "###.#.#.#",
            "#...#...#",
            "#.###.###",
            "#...#...#",
            "#.#.###.#",
            "#.#....E#",
            "#########",
        ],
        [
            "#########",
            "#S#.....#",
            "#.#.###.#",
            "#.#...#.#",
            "#.###.#.#",
            "#...#.#.#",
            "###.#.#.#",
            "#....#E.#",
            "#########",
        ],
        [
            "#########",
            "#S......#",
            "###.###.#",
            "#...#...#",
            "#.###.###",
            "#...#...#",
            "#.###.#.#",
            "#.....#E#",
            "#########",
        ],
        [
            "#########",
            "#S#...#E#",
            "#.#.#.#.#",
            "#.#.#.#.#",
            "#...#...#",
            "###.###.#",
            "#.......#",
            "#.#####.#",
            "#########",
        ],
        [
            "#########",
            "#S..#...#",
            "#.#.#.#.#",
            "#.#...#.#",
            "#.#####.#",
            "#.....#.#",
            "###.#.#.#",
            "#...#..E#",
            "#########",
        ],
    ],
    start: [1, 1],
    end: [7, 7],
    questions: [
        {
            q: "Qual frase é mais educada para pedir algo?",
            options: ["Give me water.", "Could I have some water, please?", "Water now."],
            answer: 1,
            explain: "Pedidos com 'Could I...' + 'please' soam mais naturais.",
        },
        {
            q: "Se não entendeu o que a pessoa disse, qual é a melhor resposta?",
            options: ["What?", "I don't understand English.", "Could you repeat that, please?"],
            answer: 2,
            explain: "Pedir repetição de forma gentil mantém a conversa fluindo.",
        },
        {
            q: "Qual fechamento passa mais clareza e educação?",
            options: ["Okay.", "Great, thank you!", "Hmm..."],
            answer: 1,
            explain: "Fechamento positivo ajuda na percepção da sua comunicação.",
        },
    ],
    easyQuestions: [
        {
            q: "Como se diz \"água\" em inglês?",
            options: ["Water", "House", "Car"],
            answer: 0,
            explain: "Correto: água em inglês é \"water\".",
        },
        {
            q: "Como se diz \"obrigado\" em inglês?",
            options: ["Please", "Thank you", "Sorry"],
            answer: 1,
            explain: "Correto: obrigado = thank you.",
        },
        {
            q: "Qual dessas palavras é uma saudação em inglês?",
            options: ["Goodbye", "Hello", "Later"],
            answer: 1,
            explain: "Correto: \"Hello\" é uma saudação.",
        },
        {
            q: "Complete a expressão: \"Good ____\"",
            options: ["morning", "banana", "street"],
            answer: 0,
            explain: "Correto: \"Good morning\" é uma expressão básica.",
        },
        {
            q: "Qual é o significado de \"blue\"?",
            options: ["Verde", "Azul", "Preto"],
            answer: 1,
            explain: "Correto: blue = azul.",
        },
        {
            q: "Como se diz \"bom dia\" em inglês?",
            options: ["Good night", "Good morning", "Good bye"],
            answer: 1,
            explain: "Correto: bom dia = good morning.",
        },
        {
            q: "Qual palavra significa \"obrigado(a)\"?",
            options: ["Please", "Thanks / Thank you", "Excuse me"],
            answer: 1,
            explain: "Correto: obrigado(a) = thank you.",
        },
        {
            q: "Como se diz \"por favor\" em inglês?",
            options: ["Please", "Sorry", "Maybe"],
            answer: 0,
            explain: "Correto: por favor = please.",
        },
        {
            q: "Qual dessas é uma despedida?",
            options: ["Hello", "Goodbye", "Morning"],
            answer: 1,
            explain: "Correto: goodbye é despedida.",
        },
        {
            q: "Como se diz \"sim\" em inglês?",
            options: ["No", "Yes", "Maybe"],
            answer: 1,
            explain: "Correto: sim = yes.",
        },
        {
            q: "Como se diz \"não\" em inglês?",
            options: ["No", "Now", "Know"],
            answer: 0,
            explain: "Correto: não = no.",
        },
        {
            q: "Qual significa \"desculpa\" em inglês?",
            options: ["Sorry", "Sure", "Some"],
            answer: 0,
            explain: "Correto: desculpa = sorry.",
        },
        {
            q: "Como se diz \"com licença\" em inglês?",
            options: ["Excuse me", "Help me", "Take me"],
            answer: 0,
            explain: "Correto: com licença = excuse me.",
        },
        {
            q: "Qual palavra significa \"casa\"?",
            options: ["Horse", "House", "Hot"],
            answer: 1,
            explain: "Correto: house = casa.",
        },
        {
            q: "Qual palavra significa \"carro\"?",
            options: ["Car", "Card", "Care"],
            answer: 0,
            explain: "Correto: car = carro.",
        },
        {
            q: "Como se diz \"até logo\" em inglês?",
            options: ["See you", "Thank you", "Good morning"],
            answer: 0,
            explain: "Correto: até logo = see you.",
        },
        {
            q: "Qual dessas frases é um pedido educado?",
            options: ["Give me coffee.", "Could I have coffee, please?", "Coffee now."],
            answer: 1,
            explain: "Correto: com \"Could I... please\" fica educado.",
        },
        {
            q: "Como se diz \"boa noite\" (ao se despedir)?",
            options: ["Good morning", "Good night", "Good noon"],
            answer: 1,
            explain: "Correto: boa noite = good night.",
        },
        {
            q: "Qual cor é \"red\"?",
            options: ["Azul", "Vermelho", "Verde"],
            answer: 1,
            explain: "Correto: red = vermelho.",
        },
    ],
};

const MazeGame = ({ data, onComplete }: { data: MazeConfig; onComplete?: () => void }) => {
    const cfg = { ...DEFAULT_MAZE, ...data };
    const fallbackStages = React.useMemo(() => {
        const pool = cfg.questions?.length ? cfg.questions : DEFAULT_MAZE.questions;
        return pool.map((q, index) => ({
            id: `fallback-${index}`,
            title: `Checkpoint ${index + 1}`,
            situation: "Escolha a opção que ajuda a conversa a continuar melhor.",
            prompt: q.q,
            options: q.options,
            answer: q.answer,
            explain: q.explain,
            successText: "Boa decisão.",
            errorText: "Essa escolha dificultaria a conversa.",
        }));
    }, [cfg.questions]);
    const stages = React.useMemo(
        () => (cfg.stages?.length ? cfg.stages : fallbackStages),
        [cfg.stages, fallbackStages]
    );
    const [position, setPosition] = useState(0);
    const [visitedStage, setVisitedStage] = useState<number | null>(null);
    const [completedStages, setCompletedStages] = useState<number[]>([]);
    const [activeStage, setActiveStage] = useState<number | null>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [stageFeedback, setStageFeedback] = useState<string | null>(null);
    const [statusText, setStatusText] = useState("Avance checkpoint por checkpoint e complete a conversa do jeito que este módulo ensina.");
    const [attempts, setAttempts] = useState(0);
    const completionNotifiedRef = useRef(false);
    const currentStage = activeStage !== null ? stages[activeStage] : null;
    const isFinished = completedStages.length === stages.length;

    const reset = useCallback((withSound = true) => {
        setPosition(0);
        setVisitedStage(null);
        setCompletedStages([]);
        setActiveStage(0);
        setSelectedOption(null);
        setStageFeedback(null);
        setStatusText("Avance checkpoint por checkpoint e complete a conversa do jeito que este módulo ensina.");
        setAttempts(0);
        completionNotifiedRef.current = false;
        if (withSound) playUiSfx("click");
    }, []);

    const move = useCallback((dir: "back" | "forward") => {
        if (isFinished) return;
        if (dir === "back") {
            setPosition((prev) => Math.max(0, prev - 1));
            setStatusText("Você voltou um passo para revisar a rota da conversa.");
            playUiSfx("click");
            return;
        }

        if (activeStage !== null) {
            setStatusText("Resolva este checkpoint primeiro para continuar a interação.");
            playUiSfx("error");
            return;
        }

        setPosition((prev) => {
            const next = Math.min(stages.length, prev + 1);
            if (next < stages.length && !completedStages.includes(next)) {
                setActiveStage(next);
                setVisitedStage(next);
                setSelectedOption(null);
                setStageFeedback(null);
                setStatusText("Novo checkpoint. Escolha a opção que faz a conversa seguir melhor.");
            } else if (next === stages.length && completedStages.length === stages.length) {
                setStatusText(cfg.winMessage);
            }
            playUiSfx("click");
            return next;
        });
    }, [activeStage, cfg.winMessage, completedStages, isFinished, stages.length]);

    const answerStage = (idx: number) => {
        if (activeStage === null || isFinished) return;
        const stage = stages[activeStage];
        const correct = idx === stage.answer;
        setSelectedOption(idx);
        setAttempts((prev) => prev + 1);

        if (correct) {
            setCompletedStages((prev) => prev.includes(activeStage) ? prev : [...prev, activeStage]);
            setStageFeedback(stage.explain || stage.successText || "Boa decisão.");
            setStatusText(stage.successText || "Checkpoint concluído. Agora a conversa pode seguir.");
            setActiveStage(null);
            playUiSfx("success");

            const nextCompletedCount = completedStages.includes(activeStage) ? completedStages.length : completedStages.length + 1;
            if (nextCompletedCount === stages.length && !completionNotifiedRef.current) {
                completionNotifiedRef.current = true;
                window.setTimeout(() => {
                    setPosition(stages.length);
                    setStatusText(cfg.winMessage);
                    onComplete?.();
                }, 220);
            }
            return;
        }

        const fallbackPosition = Math.max(0, activeStage - 1);
        setPosition(fallbackPosition);
        setActiveStage(fallbackPosition < stages.length ? fallbackPosition : null);
        setVisitedStage(activeStage);
        setStageFeedback(stage.errorText || "Essa escolha empurra a conversa para um tom pior. Volte e tente uma opção mais natural.");
        setStatusText(stage.errorText || "A conversa perdeu fluidez. Volte um passo e ajuste o tom.");
        playUiSfx("error");
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
            e.preventDefault();
            if (e.key === "ArrowLeft") move("back");
            if (e.key === "ArrowRight") move("forward");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [move]);

    return (
        <div className="my-8 rounded-xl border border-cyan-700/40 bg-slate-900/40 p-3 md:p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h4 className="font-mono text-cyan-300 text-sm md:text-base font-bold uppercase tracking-wider">
                        {parseTextWithTranslations(cfg.title)}
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">{parseTextWithTranslations(cfg.subtitle)}</p>
                </div>
                <button
                    onClick={() => reset()}
                    className="px-3 py-2 rounded-md border border-slate-600 text-slate-300 hover:border-cyan-500/60 text-xs font-mono"
                >
                    Reiniciar
                </button>
            </div>

            <p className="text-slate-300 text-xs md:text-sm mb-3">{parseTextWithTranslations(cfg.goal)}</p>
            <div className="rounded-lg border border-slate-700/70 bg-slate-950/40 p-3 mb-4">
                <p className="text-[11px] uppercase tracking-wider font-mono text-cyan-300 mb-1">Cenário</p>
                <p className="text-sm text-slate-100">{parseTextWithTranslations(cfg.context)}</p>
            </div>

            <div className="rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-4 mb-4 overflow-hidden">
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                    <div className={cn(
                        "snap-start shrink-0 rounded-xl border p-4 w-[220px] md:w-[240px] min-h-[168px] flex flex-col justify-between",
                        position === 0 ? "border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_24px_rgba(6,182,212,0.12)]" : "border-slate-700 bg-slate-900/60"
                    )}>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.24em] font-mono text-slate-400">Início</p>
                            <p className="text-2xl mt-3">🙂</p>
                            <p className="text-lg text-slate-100 mt-3 leading-snug">Você entra na conversa.</p>
                        </div>
                        <p className="text-xs text-slate-400">Primeiro passo: abrir contato sem pressão.</p>
                    </div>

                    {stages.map((stage, index) => {
                        const isCompleted = completedStages.includes(index);
                        const isActive = activeStage === index;
                        const isHere = position === index + 1;
                        const wasVisited = visitedStage === index;
                        return (
                            <React.Fragment key={stage.id || `${stage.title}-${index}`}>
                                <div className="hidden md:flex shrink-0 items-center justify-center w-12">
                                    <div className={cn(
                                        "h-px w-full",
                                        isCompleted ? "bg-emerald-500/60" : isActive || isHere ? "bg-cyan-500/60" : "bg-slate-700"
                                    )} />
                                </div>
                                <div className={cn(
                                    "snap-start shrink-0 rounded-xl border p-4 w-[220px] md:w-[260px] min-h-[168px] flex flex-col justify-between transition-all",
                                    isCompleted
                                        ? "border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                                        : isActive
                                            ? "border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_24px_rgba(6,182,212,0.12)]"
                                            : isHere
                                                ? "border-amber-500/60 bg-amber-950/20"
                                                : wasVisited
                                                    ? "border-rose-500/40 bg-rose-950/10"
                                                    : "border-slate-700 bg-slate-900/60"
                                )}>
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[11px] uppercase tracking-[0.24em] font-mono text-slate-400">Checkpoint {index + 1}</p>
                                            <span className="text-base">{isCompleted ? "✓" : isActive ? "●" : isHere ? "🙂" : "○"}</span>
                                        </div>
                                        <p className="text-lg text-slate-100 mt-3 leading-tight">{parseTextWithTranslations(stage.title)}</p>
                                        <p className="text-sm text-slate-400 mt-3 leading-relaxed">{parseTextWithTranslations(stage.situation)}</p>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {isCompleted ? "Etapa concluída." : isActive ? "Você está decidindo agora." : "Avance para destravar esta etapa."}
                                    </p>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => move("back")}
                    disabled={position === 0}
                    className={cn(
                        "px-4 py-3 rounded-lg border text-slate-200 text-lg active:scale-95 min-w-[72px]",
                        position === 0 ? "border-slate-700 text-slate-500" : "border-slate-600 hover:border-cyan-500/60"
                    )}
                >
                    ←
                </button>
                <button
                    onClick={() => move("forward")}
                    disabled={isFinished}
                    className={cn(
                        "px-4 py-3 rounded-lg border text-slate-200 text-lg active:scale-95 min-w-[72px]",
                        isFinished ? "border-slate-700 text-slate-500" : "border-slate-600 hover:border-cyan-500/60"
                    )}
                >
                    →
                </button>
                <p className="text-xs text-slate-500 font-mono ml-1">Use esquerda/direita para navegar pela rota.</p>
            </div>

            <div className="mt-3 text-xs text-slate-400 font-mono">
                Checkpoints concluídos: {completedStages.length}/{stages.length} · Tentativas: {attempts}
            </div>
            <div className="mt-2 text-xs text-cyan-200">{parseTextWithTranslations(statusText)}</div>

            {currentStage && (
                <div className="mt-4 p-4 rounded-lg border border-cyan-500/40 bg-cyan-950/15">
                    <div className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-2">{parseTextWithTranslations(currentStage.title)}</div>
                    <p className="text-slate-100 text-sm mb-3">{parseTextWithTranslations(currentStage.prompt)}</p>
                    <div className="grid gap-2">
                        {currentStage.options.map((opt, idx) => {
                            const isCorrect = idx === currentStage.answer;
                            const isSelected = idx === selectedOption;
                            return (
                            <button
                                key={idx}
                                onClick={() => answerStage(idx)}
                                disabled={selectedOption !== null}
                                className={cn(
                                    "w-full text-left px-3 py-3 rounded-md border text-sm active:scale-[0.99]",
                                    selectedOption !== null && isCorrect
                                        ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                        : selectedOption !== null && isSelected && !isCorrect
                                            ? "bg-red-900/40 border-red-500/50 text-red-100"
                                            : "border-slate-600 bg-slate-900/50 text-slate-100"
                                )}
                            >
                                {parseTextWithTranslations(opt)}
                            </button>
                            );
                        })}
                    </div>
                    {stageFeedback && <p className="text-xs text-cyan-100 mt-3">{parseTextWithTranslations(stageFeedback)}</p>}
                </div>
            )}

            {isFinished && (
                <div className="mt-4 p-3 rounded border border-emerald-500/40 bg-emerald-900/20 text-emerald-200 text-sm">
                    {parseTextWithTranslations(cfg.winMessage)}
                </div>
            )}
        </div>
    );
};

type ModuleChallengeQuestion = { question: string; answer: boolean };

const RevealBox = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="my-6 border border-dashed border-slate-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors text-left"
            >
                <span className="font-semibold text-slate-300 flex items-center gap-2 font-mono text-xs md:text-sm">
                    <Eye className="w-4 h-4 text-cyan-500" />
                    {parseTextWithTranslations(title)}
                </span>
                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="p-4 md:p-6 bg-slate-950/50 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 text-slate-300 text-sm md:text-base">
                    {children}
                </div>
            )}
        </div>
    )
}

const ScrambleExercise = ({
    targetSentence,
    translation,
}: {
    targetSentence: string;
    translation?: string;
}) => {
    // Basic tokenizer - split by spaces, keep punctuation simple for now
    const initialWords = targetSentence.split(' ').map((word, id) => ({ id: `${id}-${word}`, text: word }));

    // Shuffle the array initially
    const [words, setWords] = useState(() => {
        const shuffled = [...initialWords];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });

    const [isMobile, setIsMobile] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentSentence = words.map(w => w.text).join(' ');
    const isSuccess = currentSentence === targetSentence;

    return (
        <div className="my-8 rounded-xl border border-violet-500/30 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">
            <div className="bg-gradient-to-r from-violet-900/40 to-slate-900/40 px-4 py-3 md:px-6 md:py-4 border-b border-violet-500/30 flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-violet-400" />
                <span className="font-bold text-violet-400 font-mono text-xs md:text-sm tracking-wider">CÓDIGO EMBARALHADO</span>
                {isSuccess && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-400 animate-in zoom-in duration-300" />}
            </div>

            <div className="p-4 md:p-6 flex flex-col items-center">
                <p className="text-sm md:text-base text-slate-300 mb-6 text-center">
                    {isMobile ? "Arraste as palavras para cima ou para baixo." : "Arraste as palavras para o lado."}
                </p>

                <Reorder.Group
                    axis={isMobile ? "y" : "x"}
                    values={words}
                    onReorder={setWords}
                    className={cn(
                        "flex justify-center gap-2 md:gap-3 mb-6 min-h-[60px] w-full",
                        isMobile ? "flex-col items-stretch max-w-xs" : "flex-wrap"
                    )}
                >
                    {words.map((word) => (
                        <Reorder.Item
                            key={word.id}
                            value={word}
                            style={{ touchAction: 'none' }}
                        >
                            <motion.div
                                layout
                                className={cn(
                                    "px-4 py-2 md:px-5 md:py-3 rounded-md font-mono text-sm md:text-base shadow-md cursor-grab active:cursor-grabbing border select-none transition-colors text-center",
                                    isSuccess
                                        ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        : "bg-slate-800 border-slate-600 text-slate-200 hover:border-violet-400"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {word.text}
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-950/40 text-emerald-200 px-6 py-3 rounded-lg border border-emerald-500/30 text-center text-sm md:text-base w-full"
                    >
                        <strong>Sucesso!</strong> A estrutura está perfeita.
                    </motion.div>
                )}

                <div className="w-full mt-5 border-t border-violet-500/20 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowAnswer((prev) => !prev)}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-violet-500/15 text-violet-200 border border-violet-400/30 hover:bg-violet-500/25 transition"
                    >
                        {showAnswer ? "Ocultar resposta" : "Ver resposta"}
                    </button>

                    {showAnswer && (
                        <div className="mt-3 p-3 rounded-lg border border-violet-400/30 bg-violet-950/20 text-sm">
                            <p className="text-violet-100 font-medium">{targetSentence}</p>
                            {translation && (
                                <p className="text-violet-200/80 mt-1">Tradução: {translation}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Game 1: Sort between Formal (Lab) and Combat English
const CombatSortGame = ({ data }: { data: { text: string; type: 'lab' | 'combat' }[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const handleSort = (choice: 'lab' | 'combat') => {
        if (isFinished || feedback) return;

        const isCorrect = data[currentIndex].type === choice;
        if (isCorrect) setScore(s => s + 1);
        playUiSfx(isCorrect ? "success" : "error");

        setFeedback(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex + 1 < data.length) {
                setCurrentIndex(curr => curr + 1);
            } else {
                setIsFinished(true);
            }
        }, 800);
    };

    return (
        <div className="my-8 rounded-xl border border-amber-500/30 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl relative">
            <div className="bg-gradient-to-r from-amber-900/40 to-slate-900/40 px-4 py-3 md:px-6 md:py-4 border-b border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Crosshair className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-amber-400 font-mono text-xs md:text-sm tracking-wider">LEITURA RÁPIDA DA FRASE</span>
                </div>
                {!isFinished && (
                    <span className="font-mono text-xs text-amber-500 bg-amber-950/50 px-2 py-1 rounded">
                        {currentIndex + 1}/{data.length}
                    </span>
                )}
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
                {isFinished ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h4 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">Simulação Concluída!</h4>
                        <p className="text-slate-400 mb-6">Precisão: {Math.round((score / data.length) * 100)}% ({score}/{data.length})</p>
                        <button onClick={() => { setCurrentIndex(0); setScore(0); setIsFinished(false); }} className="px-6 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition">Tentar novamente</button>
                    </motion.div>
                ) : (
                    <div className="w-full max-w-lg">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className={cn(
                                    "p-6 md:p-10 mb-8 rounded-xl border text-center font-mono text-xl md:text-2xl font-bold shadow-lg transition-colors",
                                    feedback === 'correct' ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400" :
                                        feedback === 'wrong' ? "bg-red-950/60 border-red-500/50 text-red-400" :
                                            "bg-slate-800/80 border-slate-600 text-slate-200"
                                )}
                            >
                                &ldquo;{data[currentIndex].text}&rdquo;
                            </motion.div>
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSort('lab')}
                                disabled={feedback !== null}
                                className="p-4 rounded-lg font-bold border-2 border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:border-red-500/50 transition-all flex flex-col items-center gap-2"
                            >
                                <span className="text-2xl">📚</span>
                                <span className="text-xs md:text-sm uppercase tracking-wider">Inglês travado</span>
                            </button>
                            <button
                                onClick={() => handleSort('combat')}
                                disabled={feedback !== null}
                                className="p-4 rounded-lg font-bold border-2 border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2"
                            >
                                <span className="text-2xl">✅</span>
                                <span className="text-xs md:text-sm uppercase tracking-wider">Inglês natural</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Game 2: Decode native pronunciation
const AudioDecodeGame = ({ data }: { data: { phonetic: string; options: string[]; answer: number }[] }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const handleSelect = (idx: number) => {
        if (showResult || isFinished) return;
        setSelectedOption(idx);
        setShowResult(true);

        if (idx === data[currentStep].answer) {
            setScore(s => s + 1);
        }
        playUiSfx(idx === data[currentStep].answer ? "success" : "error");

        setTimeout(() => {
            setShowResult(false);
            setSelectedOption(null);
            if (currentStep + 1 < data.length) {
                setCurrentStep(c => c + 1);
            } else {
                setIsFinished(true);
            }
        }, 1200);
    };

    return (
        <div className="my-8 rounded-xl border border-cyan-500/30 overflow-hidden bg-slate-900 shadow-xl">
            <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-4 py-3 md:px-6 md:py-4 border-b border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-cyan-400 font-mono text-xs md:text-sm tracking-wider">HACKER FONÉTICO</span>
                </div>
                {!isFinished && (
                    <span className="font-mono text-xs text-cyan-500 bg-cyan-950/50 px-2 py-1 rounded">
                        Sinal {currentStep + 1}/{data.length}
                    </span>
                )}
            </div>

            <div className="p-6 md:p-8">
                {isFinished ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                        <Unlock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                        <h4 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">Decodificação Completa</h4>
                        <p className="text-slate-400 mb-6">Taxa de sucesso: {Math.round((score / data.length) * 100)}% ({score}/{data.length})</p>
                        <button onClick={() => { setCurrentStep(0); setScore(0); setIsFinished(false); }} className="px-6 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition font-mono uppercase text-xs">Re-inicializar Scanner</button>
                    </motion.div>
                ) : (
                    <div className="max-w-xl mx-auto">
                        <p className="text-slate-400 text-sm text-center mb-2 uppercase tracking-wide font-bold">O que o nativo disse?</p>
                        <div className="bg-black/50 border border-slate-700 rounded-lg p-6 mb-8 text-center backdrop-blur shadow-inner">
                            <span className="font-mono text-2xl md:text-3xl font-bold text-cyan-300 animate-pulse">
                                &ldquo;{data[currentStep].phonetic}&rdquo;
                            </span>
                        </div>

                        <div className="grid gap-3">
                            {data[currentStep].options.map((opt, idx) => {
                                const isCorrect = idx === data[currentStep].answer;
                                const isSelected = idx === selectedOption;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(idx)}
                                        disabled={showResult}
                                        className={cn(
                                            "w-full text-left px-5 py-3 md:py-4 rounded border font-mono text-sm md:text-base transition-all flex items-center justify-between",
                                            showResult && isCorrect ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200" :
                                                showResult && isSelected && !isCorrect ? "bg-red-950/60 border-red-500/50 text-red-200" :
                                                    "bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50"
                                        )}
                                    >
                                        <span>{opt}</span>
                                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsolidationGame = ({
    data,
    onComplete,
}: {
    data: {
        title?: string;
        subtitle?: string;
        rounds: Array<{
            label: string;
            objective?: string;
            tasks?: Array<
                | { type: "select"; prompt: string; options: string[]; answer: number; feedback?: string }
                | { type: "order"; prompt: string; pieces: string[]; expected: string; feedback?: string }
            >;
            // Backward compatibility
            prompt?: string;
            options?: string[];
            answer?: number;
            feedback?: string;
        }>;
    };
    onComplete?: () => void;
}) => {
    type SelectTask = { type: "select"; prompt: string; options: string[]; answer: number; feedback?: string };
    type OrderTask = { type: "order"; prompt: string; pieces: string[]; expected: string; feedback?: string };
    type LearnTask = SelectTask | OrderTask;

    const rounds = React.useMemo(() => {
        return data.rounds.map((round) => {
            if (round.tasks?.length) return { label: round.label, objective: round.objective, tasks: round.tasks as LearnTask[] };
            const fallbackPrompt = round.prompt || "Escolha a melhor resposta.";
            const fallbackOptions = round.options || [];
            const fallbackAnswer = typeof round.answer === "number" ? round.answer : 0;
            return {
                label: round.label,
                objective: round.objective,
                tasks: [
                    {
                        type: "select",
                        prompt: fallbackPrompt,
                        options: fallbackOptions,
                        answer: fallbackAnswer,
                        feedback: round.feedback,
                    } as SelectTask,
                ] as LearnTask[],
            };
        });
    }, [data.rounds]);

    const totalTasks = React.useMemo(
        () => rounds.reduce((acc, r) => acc + r.tasks.length, 0),
        [rounds]
    );

    const [roundIndex, setRoundIndex] = useState(0);
    const [taskIndex, setTaskIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [taskValidated, setTaskValidated] = useState(false);
    const completionNotifiedRef = useRef(false);
    const getTaskByPosition = useCallback((rIdx: number, tIdx: number): LearnTask | null => {
        const round = rounds[rIdx];
        if (!round) return null;
        return round.tasks[tIdx] || null;
    }, [rounds]);

    const currentRound = rounds[Math.min(roundIndex, rounds.length - 1)];
    const currentTask = currentRound.tasks[Math.min(taskIndex, currentRound.tasks.length - 1)] as LearnTask;
    const [orderSelected, setOrderSelected] = useState<string[]>([]);
    const [orderPool, setOrderPool] = useState<string[]>(
        () => currentTask?.type === "order" ? shuffle(currentTask.pieces) : []
    );

    const currentTaskNumber = React.useMemo(() => {
        let count = 0;
        for (let r = 0; r < roundIndex; r++) count += rounds[r].tasks.length;
        return count + taskIndex + 1;
    }, [roundIndex, rounds, taskIndex]);

    const moveNext = () => {
        if (!taskValidated) return;
        setSelectedOption(null);
        setFeedback(null);
        setTaskValidated(false);

        const isLastTaskInRound = taskIndex + 1 >= currentRound.tasks.length;
        const isLastRound = roundIndex + 1 >= rounds.length;

        if (isLastTaskInRound && isLastRound) {
            setFinished(true);
            if (!completionNotifiedRef.current) {
                completionNotifiedRef.current = true;
                onComplete?.();
            }
            playUiSfx("success");
            return;
        }
        if (isLastTaskInRound) {
            const nextTask = getTaskByPosition(roundIndex + 1, 0);
            setOrderSelected([]);
            setOrderPool(nextTask?.type === "order" ? shuffle(nextTask.pieces) : []);
            setRoundIndex((v) => v + 1);
            setTaskIndex(0);
            return;
        }
        const nextTask = getTaskByPosition(roundIndex, taskIndex + 1);
        setOrderSelected([]);
        setOrderPool(nextTask?.type === "order" ? shuffle(nextTask.pieces) : []);
        setTaskIndex((v) => v + 1);
    };

    const checkSelect = (idx: number) => {
        if (taskValidated || finished || currentTask.type !== "select") return;
        setSelectedOption(idx);
        const correct = idx === currentTask.answer;
        if (correct) setScore((s) => s + 1);
        setFeedback(currentTask.feedback || (correct ? "Boa escolha. Você soou natural e gentil." : "Quase. Pense no tom + clareza + confirmação."));
        setTaskValidated(true);
        playUiSfx(correct ? "success" : "error");
    };

    const pickOrderPiece = (piece: string, idx: number) => {
        if (taskValidated || currentTask.type !== "order") return;
        setOrderSelected((prev) => [...prev, piece]);
        setOrderPool((prev) => prev.filter((_, i) => i !== idx));
        playUiSfx("click");
    };

    const removeOrderPiece = (piece: string, idx: number) => {
        if (taskValidated || currentTask.type !== "order") return;
        setOrderPool((prev) => [...prev, piece]);
        setOrderSelected((prev) => prev.filter((_, i) => i !== idx));
        playUiSfx("click");
    };

    const checkOrder = () => {
        if (taskValidated || currentTask.type !== "order") return;
        const built = orderSelected.join(" ").trim().toLowerCase();
        const expected = currentTask.expected.trim().toLowerCase();
        const correct = built === expected;
        if (correct) setScore((s) => s + 1);
        setFeedback(currentTask.feedback || (correct ? "Estrutura correta. Frase clara e educada." : "A ordem não ficou natural. Tente de novo com a estrutura mais gentil."));
        setTaskValidated(true);
        playUiSfx(correct ? "success" : "error");
    };

    const restart = () => {
        setRoundIndex(0);
        setTaskIndex(0);
        setScore(0);
        setFinished(false);
        setSelectedOption(null);
        setFeedback(null);
        setTaskValidated(false);
        completionNotifiedRef.current = false;
        const firstTask = getTaskByPosition(0, 0);
        setOrderSelected([]);
        setOrderPool(firstTask?.type === "order" ? shuffle(firstTask.pieces) : []);
        playUiSfx("click");
    };

    return (
        <div className="my-8 rounded-xl border border-emerald-500/30 overflow-hidden bg-slate-900 shadow-xl">
            <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/30 px-4 py-3 md:px-6 md:py-4 border-b border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-emerald-300 font-mono text-xs md:text-sm tracking-wider">
                        {parseTextWithTranslations(data.title || "TREINO DE CONSOLIDAÇÃO")}
                    </span>
                </div>
                <span className="font-mono text-xs text-emerald-300/90 bg-emerald-950/40 px-2 py-1 rounded">
                    Etapa {finished ? totalTasks : currentTaskNumber}/{totalTasks}
                </span>
            </div>

            <div className="p-4 md:p-6">
                {data.subtitle && (
                    <p className="text-slate-300 text-sm md:text-base mb-3">{parseTextWithTranslations(data.subtitle)}</p>
                )}
                {!finished && (
                    <>
                        <div className="mb-3 rounded-md border border-slate-700 bg-slate-950/40 p-3">
                            <p className="text-[11px] uppercase tracking-wider font-mono text-cyan-300 mb-1">{parseTextWithTranslations(currentRound.label)}</p>
                            {currentRound.objective && (
                                <p className="text-xs text-slate-400 mb-1">{parseTextWithTranslations(currentRound.objective)}</p>
                            )}
                            <p className="text-sm text-slate-100">{parseTextWithTranslations(currentTask.prompt)}</p>
                        </div>

                        {currentTask.type === "select" ? (
                            <div className="grid gap-2">
                                {currentTask.options.map((opt, idx) => {
                                    const isCorrect = idx === currentTask.answer;
                                    const isSelected = selectedOption === idx;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => checkSelect(idx)}
                                            disabled={taskValidated}
                                            className={cn(
                                                "text-left px-3 py-3 rounded border text-sm transition",
                                                taskValidated && isCorrect
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : taskValidated && isSelected && !isCorrect
                                                        ? "bg-red-900/40 border-red-500/50 text-red-100"
                                                        : "border-slate-600 bg-slate-900/60 text-slate-100 hover:border-cyan-500/50"
                                            )}
                                        >
                                            {parseTextWithTranslations(opt)}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="rounded-md border border-emerald-700/40 bg-emerald-950/20 p-2 min-h-[46px]">
                                    {orderSelected.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {orderSelected.map((piece, idx) => (
                                                <button
                                                    key={`${piece}-${idx}`}
                                                    type="button"
                                                    onClick={() => removeOrderPiece(piece, idx)}
                                                    disabled={taskValidated}
                                                    className="px-2.5 py-1.5 rounded bg-emerald-800/50 text-emerald-100 text-xs border border-emerald-500/40"
                                                >
                                                    {piece}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-emerald-200/80">Toque nas palavras para montar a frase.</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {orderPool.map((piece, idx) => (
                                        <button
                                            key={`${piece}-pool-${idx}`}
                                            type="button"
                                            onClick={() => pickOrderPiece(piece, idx)}
                                            disabled={taskValidated}
                                            className="px-2.5 py-1.5 rounded bg-slate-800 text-slate-100 text-xs border border-slate-600 hover:border-cyan-500/50"
                                        >
                                            {piece}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={checkOrder}
                                    disabled={taskValidated || orderSelected.length !== currentTask.pieces.length}
                                    className={cn(
                                        "px-3 py-2 rounded text-sm font-medium",
                                        taskValidated || orderSelected.length !== currentTask.pieces.length
                                            ? "bg-slate-700 text-slate-400"
                                            : "bg-cyan-600 text-white hover:bg-cyan-500"
                                    )}
                                >
                                    Validar frase
                                </button>
                            </div>
                        )}

                        {feedback && (
                            <div className="mt-3 rounded-md border border-cyan-500/40 bg-cyan-950/20 p-3 text-sm text-cyan-100">
                                {parseTextWithTranslations(feedback)}
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-xs font-mono text-slate-400">Pontos: {score}/{totalTasks}</div>
                            <button
                                type="button"
                                onClick={moveNext}
                                disabled={!taskValidated}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium",
                                    taskValidated ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                                )}
                            >
                                {currentTaskNumber >= totalTasks ? "Finalizar desafio" : "Próxima tarefa"}
                            </button>
                        </div>
                    </>
                )}

                {finished && (
                    <div className="mt-2 rounded border border-emerald-500/40 bg-emerald-900/20 text-emerald-200 p-4 text-sm">
                        <p className="font-semibold mb-1">Desafio concluído</p>
                        <p>Você terminou o treino com {score}/{totalTasks} acertos. Refaça para fixar ainda mais.</p>
                        <button
                            type="button"
                            onClick={restart}
                            className="mt-3 px-3 py-2 rounded border border-emerald-400/50 hover:bg-emerald-500/15"
                        >
                            Jogar novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// NEW INTERACTIVE COMPONENTS FOR PILAR 1
// ============================================================================

const BrainDiagram = ({ data }: { data: { title: string; steps: string[] } }) => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="my-8 bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-xl border border-cyan-500/20 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900/80 px-4 py-3 md:px-6 md:py-4 border-b border-cyan-500/20 flex items-center gap-3">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-cyan-400 font-mono text-sm md:text-base tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>

            {/* Diagram Area */}
            <div className="p-4 md:p-8 relative">
                {/* Animated Brain Visual - Kept Identical */}
                <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-6 md:gap-0">
                    <div className="relative">
                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-pulse">
                            <Brain className="w-12 h-12 md:w-20 md:h-20 text-cyan-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500/50 rounded-full animate-ping" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                            ⚡
                        </div>
                    </div>
                    <div className="hidden md:flex items-center mx-6">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-ping" />
                        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-500 to-emerald-500" />
                    </div>
                    <div className="relative mt-4 md:mt-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl">🔒</span>
                        </div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-slate-500 font-mono whitespace-nowrap">CÓRTEX BLOQUEADO</span>
                    </div>
                </div>

                {/* Steps Navigation */}
                <div className="space-y-3">
                    {data.steps.map((step, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            className={cn(
                                "w-full text-left p-3 md:p-4 rounded-lg border transition-all duration-300 flex gap-3 md:gap-4 items-start",
                                activeStep === idx
                                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                    : "bg-slate-900/50 border-slate-700 hover:border-slate-500"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-mono text-xs md:text-sm font-bold flex-shrink-0 mt-0.5",
                                activeStep === idx ? "bg-cyan-500 text-slate-900" : "bg-slate-700 text-slate-400"
                            )}>
                                {idx + 1}
                            </div>
                            <p className={cn(
                                "text-sm leading-relaxed",
                                activeStep === idx ? "text-slate-200" : "text-slate-500"
                            )}>
                                {parseTextWithTranslations(step)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComparisonTable = ({ data }: { data: { headers: string[]; rows: string[][] } }) => {
    return (
        <div className="my-8 rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/30 backdrop-blur">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 md:px-6 md:py-4 border-b border-slate-700/50 flex items-center gap-3">
                <TableIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-slate-200 font-mono text-xs md:text-sm tracking-wider">ANÁLISE COMPARATIVA</span>
            </div>
            <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-800/50">
                            {data.headers.map((header, i) => (
                                <th key={i} className="px-4 py-3 md:px-6 md:py-4 text-left text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                                    {parseTextWithTranslations(header)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                                {row.map((cell, j) => (
                                    <td key={j} className={cn(
                                        "px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm",
                                        j === 0 ? "font-semibold text-slate-200 whitespace-nowrap" : "text-slate-400 group-hover:text-slate-300 min-w-[150px]"
                                    )}>
                                        {parseTextWithTranslations(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ScenarioCard = ({ data }: { data: { context: string; situation: string; wrong: { action: string; result: string }; right: { action: string; result: string } } }) => {
    const [showSolution, setShowSolution] = useState(false);

    return (
        <div className="my-8 rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl">
            {/* Header */}
            <div className="rounded-t-xl bg-gradient-to-r from-amber-900/40 to-orange-900/30 px-4 py-3 md:px-6 md:py-4 border-b border-amber-500/30 flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400 font-mono text-xs md:text-sm tracking-wider">SITUAÇÃO REAL</span>
                <span className="ml-auto text-[10px] md:text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 md:px-3 md:py-1 rounded-full font-mono">RITMO ALTO</span>
            </div>

            {/* Context */}
            <div className="p-4 md:p-6 border-b border-slate-800">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📍 CONTEXTO</h4>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">{parseTextWithTranslations(data.context)}</p>
            </div>

            {/* Situation */}
            <div className="p-4 md:p-6 bg-slate-900/50 border-b border-slate-800">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🎯 SITUAÇÃO</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 font-mono text-cyan-300 text-sm md:text-base">
                    &ldquo;{parseTextWithTranslations(data.situation)}&rdquo;
                </div>
            </div>

            {/* Toggle Button */}
            <div className="p-4 md:p-6">
                <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={cn(
                        "w-full py-3 md:py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base",
                        showSolution
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                    )}
                >
                    {showSolution ? "OCULTAR ANÁLISE" : "VER ANÁLISE"}
                    <ChevronDown className={cn("w-5 h-5 transition-transform", showSolution && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {showSolution && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {/* Wrong Approach */}
                                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4 md:p-5">
                                    <h5 className="font-bold text-red-400 text-xs md:text-sm mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        ❌ RESPOSTA QUE ATRAPALHA
                                    </h5>
                                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">{parseTextWithTranslations(data.wrong.action)}</p>
                                    <div className="bg-red-900/20 p-3 rounded text-red-300 text-xs md:text-sm font-mono leading-relaxed">
                                        → {parseTextWithTranslations(data.wrong.result)}
                                    </div>
                                </div>

                                {/* Right Approach */}
                                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 md:p-5">
                                    <h5 className="font-bold text-emerald-400 text-xs md:text-sm mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        ✅ RESPOSTA QUE FUNCIONA
                                    </h5>
                                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">{parseTextWithTranslations(data.right.action)}</p>
                                    <div className="bg-emerald-900/20 p-3 rounded text-emerald-300 text-xs md:text-sm font-mono leading-relaxed">
                                        → {parseTextWithTranslations(data.right.result)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PhoneticBreakdown = ({ data }: { data: { formal: { text: string; analysis: string }; combat: { text: string; analysis: string }; explanation: string } }) => {
    return (
        <div className="my-8 rounded-xl border border-violet-500/30 overflow-hidden bg-gradient-to-br from-slate-900 to-violet-950/20">
            <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/30 px-4 py-3 md:px-6 md:py-4 border-b border-violet-500/30 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-violet-400" />
                <span className="font-bold text-violet-400 font-mono text-xs md:text-sm tracking-wider">🛠️ ENGENHARIA REVERSA</span>
            </div>

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    {/* Formal */}
                    <div className="bg-slate-800/30 rounded-lg p-4 md:p-5 border border-slate-700">
                        <h4 className="text-[10px] md:text-xs font-bold text-red-400 uppercase tracking-wider mb-3">📚 FORMA DE LIVRO</h4>
                        <div className="bg-slate-900/50 p-3 md:p-4 rounded font-mono text-xl md:text-2xl text-slate-300 text-center mb-3">
                            {parseTextWithTranslations(data.formal.text)}
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 text-center">{parseTextWithTranslations(data.formal.analysis)}</p>
                    </div>

                    {/* Combat */}
                    <div className="bg-cyan-950/20 rounded-lg p-4 md:p-5 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <h4 className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">FORMA NATURAL</h4>
                        <div className="bg-slate-900/50 p-3 md:p-4 rounded font-mono text-xl md:text-2xl text-cyan-300 text-center mb-3">
                            {parseTextWithTranslations(data.combat.text)}
                        </div>
                        <p className="text-[10px] md:text-xs text-cyan-500 text-center">{parseTextWithTranslations(data.combat.analysis)}</p>
                    </div>
                </div>

                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 leading-relaxed">{parseTextWithTranslations(data.explanation)}</p>
                </div>
            </div>
        </div>
    );
};

const EliteInsight = ({ title, content }: { title: string; content: string }) => {
    return (
        <div className="my-8 relative overflow-hidden rounded-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-cyan-600/10 animate-gradient-x" />

            <div className="relative bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 md:p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-cyan-400 font-mono text-xs md:text-sm tracking-wider mb-2">{parseTextWithTranslations(title)}</h4>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed">{parseTextWithTranslations(content)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================================================================
// PART 2 COMPONENTS
// ================================================================

// Memory Diagram - Declarative vs Procedural Memory
const MemoryDiagram = ({ data }: { data: { title: string; declarative: { title: string; description: string; icon: string }; procedural: { title: string; description: string; icon: string }; diagnosis: string } }) => {
    const [activePanel, setActivePanel] = useState<'declarative' | 'procedural' | null>(null);

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 p-4 border-b border-cyan-500/20">
                <h3 className="text-base md:text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 md:w-5 md:h-5" />
                    {parseTextWithTranslations(data.title)}
                </h3>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Declarative Memory */}
                <button
                    onClick={() => setActivePanel(activePanel === 'declarative' ? null : 'declarative')}
                    className={cn(
                        "text-left p-4 md:p-5 rounded-lg border transition-all duration-300",
                        activePanel === 'declarative'
                            ? "bg-red-500/20 border-red-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-red-500/30"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl md:text-2xl">{data.declarative.icon}</span>
                        <span className="font-bold text-red-400 text-sm md:text-base">{parseTextWithTranslations(data.declarative.title)}</span>
                        <span className="ml-auto text-[10px] md:text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">O ERRO</span>
                    </div>
                    <AnimatePresence>
                        {activePanel === 'declarative' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-slate-400 text-sm leading-relaxed"
                            >
                                {parseTextWithTranslations(data.declarative.description)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {activePanel !== 'declarative' && (
                        <p className="text-slate-500 text-[10px] md:text-xs italic mt-2">Toque para ver detalhes</p>
                    )}
                </button>

                {/* Procedural Memory */}
                <button
                    onClick={() => setActivePanel(activePanel === 'procedural' ? null : 'procedural')}
                    className={cn(
                        "text-left p-4 md:p-5 rounded-lg border transition-all duration-300",
                        activePanel === 'procedural'
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/30"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl md:text-2xl">{data.procedural.icon}</span>
                        <span className="font-bold text-emerald-400 text-sm md:text-base">{parseTextWithTranslations(data.procedural.title)}</span>
                        <span className="ml-auto text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">A SOLUÇÃO</span>
                    </div>
                    <AnimatePresence>
                        {activePanel === 'procedural' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-slate-400 text-sm leading-relaxed"
                            >
                                {parseTextWithTranslations(data.procedural.description)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {activePanel !== 'procedural' && (
                        <p className="text-slate-500 text-[10px] md:text-xs italic mt-2">Toque para ver detalhes</p>
                    )}
                </button>
            </div>

            {/* Diagnosis */}
            <div className="mx-4 md:mx-6 mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs md:text-sm font-bold mb-2">
                    <Crosshair className="w-4 h-4" />
                    DIAGNÓSTICO DE ELITE
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{parseTextWithTranslations(data.diagnosis)}</p>
            </div>
        </div>
    );
};

// Baby Learning - 4 Phase Acquisition Process
const BabyLearning = ({ data }: { data: { title: string; phases: { name: string; icon: string; description: string }[] } }) => {
    const [activePhase, setActivePhase] = useState(0);

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-violet-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 p-4 border-b border-violet-500/20">
                <h3 className="text-base md:text-lg font-bold text-violet-400 font-mono flex items-center gap-2">
                    🛠️ {parseTextWithTranslations(data.title)}
                </h3>
            </div>

            {/* Phase Navigation */}
            <div className="flex border-b border-slate-700/50 overflow-x-auto no-scrollbar">
                {data.phases.map((phase, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePhase(idx)}
                        className={cn(
                            "flex-1 min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-3 text-center text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
                            activePhase === idx
                                ? "text-violet-300 bg-violet-500/10"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                        )}
                    >
                        <span className="mr-1 md:mr-2">{phase.icon}</span>
                        <span className="hidden md:inline">{parseTextWithTranslations(phase.name)}</span>
                        <span className="md:hidden font-bold">FASE {idx + 1}</span>
                        {activePhase === idx && (
                            <motion.div
                                layoutId="activePhaseIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Active Phase Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 md:p-6"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-3xl flex-shrink-0 mb-2 md:mb-0">
                            {data.phases[activePhase].icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-violet-300 text-base md:text-lg mb-2">
                                Fase {activePhase + 1}: {parseTextWithTranslations(data.phases[activePhase].name)}
                            </h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {parseTextWithTranslations(data.phases[activePhase].description)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pb-4">
                {data.phases.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePhase(idx)}
                        className={cn(
                            "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all",
                            activePhase === idx
                                ? "bg-violet-500 scale-125 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                : "bg-slate-600 hover:bg-slate-500"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

// Phrase Analysis - Tactical breakdown of a phrase
const PhraseAnalysis = ({ data }: { data: { phrase: string; phonetic: string; grammarNote: string } }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="my-6 bg-slate-900/50 rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] md:text-xs font-bold text-cyan-400 font-mono tracking-wider">ANÁLISE DE FRASE TÁTICA</span>
                    <AudioButton text={data.phrase} size="sm" />
                </div>

                <p className="text-xl md:text-2xl font-bold text-white mb-3 font-serif">
                    &ldquo;{parseTextWithTranslations(data.phrase)}&rdquo;
                </p>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs md:text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                >
                    {showDetails ? "Esconder análise" : "Ver análise completa"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showDetails && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3 border-t border-slate-700/50 pt-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                                <span className="text-[10px] md:text-xs font-bold text-emerald-400 font-mono w-24 flex-shrink-0">FONÉTICA:</span>
                                <span className="text-slate-400 text-sm font-mono">{parseTextWithTranslations(data.phonetic)}</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                                <span className="text-[10px] md:text-xs font-bold text-amber-400 font-mono w-24 flex-shrink-0">GRAMÁTICA:</span>
                                <span className="text-slate-400 text-sm">{parseTextWithTranslations(data.grammarNote)}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ================================================================
// NEW TOWER COMPONENTS (PILAR 2)
// ================================================================

const TowerLog = ({ content }: { content: string }) => (
    <div className="my-8 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#050505] shadow-[0_0_25px_rgba(6,182,212,0.1)]">
        <div className="bg-cyan-900/20 px-4 py-2 border-b border-cyan-500/20 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">TOWER_OPERATIONAL_LOG</span>
        </div>
        <div className="p-4 md:p-6 font-mono text-sm md:text-base text-cyan-500/90 whitespace-pre-wrap leading-relaxed">
            {parseTextWithTranslations(content)}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-cyan-500 ml-1 translate-y-0.5"
            />
        </div>
    </div>
);

const SonicScan = ({ data }: { data: { title: string; instructions: string; items: string[]; output: string } }) => {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(data.items.length).fill(false));

    const toggleItem = (idx: number) => {
        const next = [...checkedItems];
        next[idx] = !next[idx];
        setCheckedItems(next);
    };

    const checkedCount = checkedItems.filter(Boolean).length;

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-blue-500/30 backdrop-blur-sm">
            <div className="bg-blue-500/10 p-4 border-b border-blue-500/20 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-blue-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-6">{data.instructions}</p>
                <div className="space-y-3">
                    {data.items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggleItem(idx)}
                            className={cn(
                                "w-full text-left p-4 rounded-lg border transition-all flex items-start gap-4",
                                checkedItems[idx]
                                    ? "bg-blue-900/30 border-blue-500/50 text-blue-100"
                                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors",
                                checkedItems[idx] ? "bg-blue-500 border-blue-500" : "border-slate-600"
                            )}>
                                {checkedItems[idx] && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                            </div>
                            <span className="text-sm md:text-base">{parseTextWithTranslations(item)}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {checkedCount >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-center font-bold text-xs md:text-sm font-mono"
                        >
                            ⚠️ {parseTextWithTranslations(data.output)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ABSnapTest = ({ data }: { data: { title: string; rule: string; items: { id: string; label: string; a: string; b: string }[]; scoring: string } }) => {
    const [answers, setAnswers] = useState<Record<string, 'a' | 'b'>>({});

    return (
        <div className="my-8 bg-slate-900/60 rounded-xl border border-purple-500/30">
            <div className="bg-purple-500/10 p-4 border-b border-purple-500/20 flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-purple-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6 text-center">
                <p className="text-slate-400 text-sm mb-8">{data.rule}</p>

                <div className="space-y-6 max-w-lg mx-auto">
                    {data.items.map((item) => (
                        <div key={item.id} className="flex flex-col items-center">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">{item.label}</span>
                            <div className="flex items-center gap-4 w-full">
                                <button
                                    onClick={() => setAnswers(prev => ({ ...prev, [item.id]: 'a' }))}
                                    className={cn(
                                        "flex-1 py-4 px-2 rounded-lg border font-mono font-bold transition-all",
                                        answers[item.id] === 'a'
                                            ? "bg-cyan-500 border-cyan-400 text-slate-900 scale-[1.02]"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                                    )}
                                >
                                    {parseTextWithTranslations(item.a)}
                                </button>
                                <span className="text-slate-600 font-mono text-xs">VS</span>
                                <button
                                    onClick={() => setAnswers(prev => ({ ...prev, [item.id]: 'b' }))}
                                    className={cn(
                                        "flex-1 py-4 px-2 rounded-lg border font-mono font-bold transition-all",
                                        answers[item.id] === 'b'
                                            ? "bg-cyan-500 border-cyan-400 text-slate-900 scale-[1.02]"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                                    )}
                                >
                                    {parseTextWithTranslations(item.b)}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-xs text-slate-500 italic uppercase font-mono">{data.scoring}</p>
                </div>
            </div>
        </div>
    );
};

const LatencyMeter = ({ data }: { data: { title: string; description: string; options: string[]; verdicts: string[] } }) => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <div className="my-8 bg-slate-900/40 rounded-xl border border-amber-500/20">
            <div className="bg-amber-500/10 p-4 border-b border-amber-500/20 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-300 text-sm md:text-base mb-6">{data.description}</p>
                <div className="grid gap-3">
                    {data.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelected(idx)}
                            className={cn(
                                "text-left p-4 rounded-lg border transition-all text-sm md:text-base",
                                selected === idx
                                    ? "bg-amber-900/30 border-amber-500/50 text-amber-200"
                                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600"
                            )}
                        >
                            {parseTextWithTranslations(opt)}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {selected !== null && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-slate-800/80 rounded-lg border-l-4 border-amber-500 text-slate-300 text-xs md:text-sm"
                        >
                            <strong>LATENCY VERDICT:</strong> {parseTextWithTranslations(data.verdicts[selected])}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CutoffDrill = ({ data }: { data: { title: string; instruction: string; items: { word: string; cutoff: string }[]; warning: string } }) => (
    <div className="my-8 bg-black/40 rounded-xl border border-red-500/20">
        <div className="bg-red-950/20 p-4 border-b border-red-500/20 flex items-center gap-3">
            <Zap className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-red-500 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
        </div>
        <div className="p-4 md:p-8 text-center">
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">{data.instruction}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg group hover:border-red-500/50 transition-all">
                        <div className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-tighter">Trava: {item.cutoff}</div>
                        <div className="text-xl md:text-2xl font-bold text-white font-mono group-hover:text-red-400 transition-colors">
                            {extractTranslatableText(item.word).split('').map((char, i, arr) => (
                                <span key={i} className={i === arr.length - 1 ? "text-red-500" : ""}>{char}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-xs text-red-400/80 font-mono italic">{parseTextWithTranslations(data.warning)}</p>
        </div>
    </div>
);

const MisfireCases = ({ data }: { data: { title: string; cases: { whatYouSay: string; whatTheyHear: string; whyItHurts: string }[]; note: string } }) => (
    <div className="my-8 rounded-xl border border-slate-700/50 bg-slate-900/30 backdrop-blur">
        <div className="bg-red-900/10 px-4 py-3 border-b border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-slate-200 font-mono text-xs md:text-sm tracking-wider uppercase">{parseTextWithTranslations(data.title)}</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
                <thead>
                    <tr className="bg-slate-800/50 text-[10px] uppercase font-mono text-slate-500 tracking-widest">
                        <th className="px-6 py-4">Sinal Emitido (Erro)</th>
                        <th className="px-6 py-4">Sinal Recebido (Nativo)</th>
                        <th className="px-6 py-4">Dano Operacional</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {data.cases.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-red-400">{parseTextWithTranslations(c.whatYouSay)}</td>
                            <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{parseTextWithTranslations(c.whatTheyHear)}</td>
                            <td className="px-6 py-4 text-xs md:text-sm text-slate-400 leading-relaxed">{parseTextWithTranslations(c.whyItHurts)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            <p className="text-[10px] md:text-xs text-slate-500 font-mono italic">⚠️ {data.note}</p>
        </div>
    </div>
);

const AnchorBuilder = ({ data }: { data: { title: string; instruction: string; example: string; fields: { id: string; label: string; placeholder: string }[] } }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    return (
        <div className="my-8 bg-gradient-to-br from-slate-900/80 to-blue-900/20 rounded-xl border border-blue-500/30 shadow-xl">
            <div className="bg-blue-900/40 p-4 border-b border-blue-500/30 flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-blue-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-300 text-sm md:text-base mb-2">{data.instruction}</p>
                <div className="bg-black/40 p-3 rounded border border-slate-800 mb-8 mt-2">
                    <p className="text-[11px] font-mono text-slate-500 uppercase mb-1">Padrão Tático de Exemplo:</p>
                    <p className="text-xs md:text-sm text-blue-300 italic">&ldquo;{parseTextWithTranslations(data.example)}&rdquo;</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">{field.label}</label>
                            <input
                                type="text"
                                placeholder={extractTranslatableText(field.placeholder)}
                                value={values[field.id] || ''}
                                onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-full bg-slate-950/80 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Checksum = ({ data }: { data: { title: string; rule: string; questions: { q: string; options: string[]; answer: number }[] } }) => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<number[]>(new Array(data.questions.length).fill(-1));
    const [finished, setFinished] = useState(false);

    const handleSelect = (idx: number) => {
        const next = [...selected];
        next[current] = idx;
        setSelected(next);

        if (current + 1 < data.questions.length) {
            setTimeout(() => setCurrent(current + 1), 600);
        } else {
            setFinished(true);
        }
    };

    return (
        <div className="my-8 bg-slate-900 rounded-xl border border-emerald-500/30 shadow-2xl">
            <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-emerald-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
                </div>
                {!finished && <span className="font-mono text-xs text-emerald-500 bg-emerald-950/50 px-2 py-1 rounded">Check {current + 1}/{data.questions.length}</span>}
            </div>
            <div className="p-6 md:p-8">
                {finished ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2">Checksum Validado</h4>
                        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Sua antena auditiva está calibrada para o sinal limpo. Prepare-se para o próximo nível.</p>
                        <button onClick={() => { setCurrent(0); setSelected(new Array(data.questions.length).fill(-1)); setFinished(false); }} className="px-6 py-2 bg-slate-800 text-slate-300 rounded text-xs font-mono uppercase tracking-widest hover:bg-slate-700 transition">Reiniciar Scan</button>
                    </motion.div>
                ) : (
                    <div>
                        <p className="text-slate-400 text-sm mb-6 italic text-center">{data.rule}</p>
                        <h4 className="text-lg md:text-xl font-bold text-slate-100 mb-8 text-center">{parseTextWithTranslations(data.questions[current].q)}</h4>
                        <div className="grid gap-3 max-w-md mx-auto">
                            {data.questions[current].options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg border font-mono text-sm transition-all",
                                        selected[current] === idx
                                            ? idx === data.questions[current].answer ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100" : "bg-red-900/40 border-red-500/50 text-red-100"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/30"
                                    )}
                                >
                                    {parseTextWithTranslations(opt)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MODULE 6 COMPONENTS: CLEARANCE
// ============================================================================

const SoftStatus = ({ content }: { content: string }) => (
    <div className="my-6 bg-emerald-950/30 border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-emerald-500/8 px-4 py-2 border-b border-emerald-500/15">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">System Status</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">● STABLE</span>
        </div>
        <pre className="text-emerald-300/70 font-mono text-xs md:text-sm p-4 md:p-6 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, i) => (
                <span key={i} className={cn("block", line.startsWith('•') ? "text-emerald-200/80 pl-2" : "")}>{parseTextWithTranslations(line)}</span>
            ))}
        </pre>
    </div>
);

const SimpleList = ({ items }: { items: string[] }) => (
    <div className="my-8 space-y-3">
        {items.map((item, idx) => (
            <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/60 hover:border-emerald-500/20 transition-colors"
            >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{parseTextWithTranslations(item)}</p>
            </motion.div>
        ))}
    </div>
);

const SoftWarning = ({ title, content }: { title: string; content: string }) => (
    <div className="my-8 bg-amber-950/20 border border-amber-500/25 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 bg-amber-500/8 px-5 py-3 border-b border-amber-500/15">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-semibold text-sm">{title}</span>
        </div>
        <div className="p-5 md:p-6">
            <pre className="text-amber-200/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {content.split('\n').map((line, i) => (
                    <span key={i} className="block">{parseTextWithTranslations(line)}</span>
                ))}
            </pre>
        </div>
    </div>
);

const FinalNote = ({ content }: { content: string }) => (
    <div className="my-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl" />
        <div className="relative px-8 md:px-16 py-10 md:py-14 text-center">
            <div className="absolute left-4 top-4 text-slate-600 text-6xl font-serif leading-none select-none">&ldquo;</div>
            <div className="absolute right-4 bottom-4 text-slate-600 text-6xl font-serif leading-none select-none rotate-180">&rdquo;</div>
            {content.split('\n\n').map((para, idx) => (
                <p key={idx} className={cn(
                    "font-light leading-loose",
                    idx === 0 ? "text-xl md:text-2xl text-slate-200 mb-5" :
                        idx === 1 ? "text-lg md:text-xl text-slate-300 mb-4" :
                            "text-base md:text-lg text-emerald-300 font-semibold"
                )}>
                    {parseTextWithTranslations(para)}
                </p>
            ))}
        </div>
    </div>
);

const PillarEnd = ({ title, content }: { title: string; content: string }) => (
    <div className="my-12 relative overflow-hidden rounded-2xl">
        {/* Background glow layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 text-center">
            {/* Icon */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-24 h-24 mx-auto mb-8 relative"
            >
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-12 h-12 text-slate-900" />
                </div>
            </motion.div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold font-mono text-emerald-300 tracking-widest uppercase mb-8"
            >
                {parseTextWithTranslations(title)}
            </motion.h2>

            {/* Content */}
            <pre className="text-slate-300 font-light text-base md:text-lg whitespace-pre-wrap leading-loose max-w-md mx-auto">
                {content.split('\n').map((line, i) => (
                    <span key={i} className={cn(
                        "block",
                        line.includes("humano") ? "text-white font-medium" : "",
                        line.includes("aguarda") ? "text-emerald-400 font-mono text-sm mt-4 uppercase tracking-widest" : ""
                    )}>{parseTextWithTranslations(line)}</span>
                ))}
            </pre>
        </div>
    </div>
);

// ============================================================================
// MODULE 5 COMPONENTS: FULL SPECTRUM OPERATIONS
// ============================================================================

const SpectrumInit = ({ content }: { content: string }) => (
    <div className="my-6 bg-slate-950 border border-orange-500/40 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-orange-500/10 px-4 py-2 border-b border-orange-500/20">
            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-orange-400 font-mono text-xs uppercase tracking-widest">Full Spectrum Mode</span>
            </div>
            <span className="text-[10px] font-mono text-orange-500/60 uppercase tracking-widest">SIGNAL: UNSTABLE</span>
        </div>
        <pre className="text-orange-300/80 font-mono text-xs md:text-sm p-4 md:p-6 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, i) => (
                <span key={i} className={cn("block", line.startsWith('•') ? "text-orange-200 pl-2" : "")}>{parseTextWithTranslations(line)}</span>
            ))}
        </pre>
    </div>
);

const AccentDriftMap = ({ data }: { data: { title: string; instruction: string; accents: { profile: string; characteristics: string[]; risk: string }[]; rule: string } }) => (
    <div className="my-8 bg-slate-900/50 rounded-xl border border-orange-500/30">
        <div className="bg-orange-500/10 p-4 border-b border-orange-500/20 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-orange-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
        </div>
        <div className="p-4 md:p-6">
            <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.accents.map((accent, idx) => (
                    <div key={idx} className="bg-slate-800/60 rounded-lg border border-slate-700 hover:border-orange-500/30 transition-colors overflow-hidden">
                        <div className="bg-orange-500/10 px-4 py-2 border-b border-orange-500/10">
                            <span className="text-xs font-mono font-bold text-orange-300 uppercase tracking-wider">{parseTextWithTranslations(accent.profile)}</span>
                        </div>
                        <div className="p-4">
                            <ul className="space-y-1 mb-3">
                                {accent.characteristics.map((c, cIdx) => (
                                    <li key={cIdx} className="text-xs text-slate-400 flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">→</span>
                                        <span>{parseTextWithTranslations(c)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-slate-700 pt-3">
                                <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest block mb-1">⚠ Risk</span>
                                <p className="text-xs text-slate-400 italic">{parseTextWithTranslations(accent.risk)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-5 text-xs text-orange-400/80 font-mono italic text-center border-t border-orange-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
        </div>
    </div>
);

const ImperfectInput = ({ data }: { data: { title: string; instruction: string; samples: { input: string; question: string; options: string[]; answer: number; insight: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-yellow-500/30">
            <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 flex items-center gap-3">
                <Brain className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-yellow-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <AudioButton text={sample.input} size="sm" />
                                <span className="text-sm md:text-base font-mono text-yellow-200 font-bold italic">&ldquo;{sample.input}&rdquo;</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 font-mono">{parseTextWithTranslations(sample.question)}</p>
                            <div className="grid grid-cols-1 gap-2">
                                {sample.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[sIdx] === oIdx
                                                ? oIdx === sample.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-yellow-500/30"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {answers[sIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-yellow-300/80 italic font-mono">
                                    💡 {parseTextWithTranslations(sample.insight)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-yellow-400/80 font-mono italic text-center border-t border-yellow-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const EmotionalOverlay = ({ data }: { data: { title: string; instruction: string; scenarios: { audio: string; emotion: string; missionOptions: string[]; answer: number; note: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-pink-500/30">
            <div className="bg-pink-500/10 p-4 border-b border-pink-500/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-pink-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.scenarios.map((sc, sIdx) => (
                        <div key={sIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <AudioButton text={sc.audio} size="sm" />
                                <span className="text-sm md:text-base font-mono text-white font-bold">&ldquo;{sc.audio}&rdquo;</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Emoção detectada:</span>
                                <span className="text-xs font-mono text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">{parseTextWithTranslations(sc.emotion)}</span>
                            </div>
                            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2">Qual é a missão?</p>
                            <div className="grid grid-cols-1 gap-2">
                                {sc.missionOptions.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[sIdx] === oIdx
                                                ? oIdx === sc.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-pink-500/30"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {answers[sIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-pink-300/80 italic">
                                    ✓ {parseTextWithTranslations(sc.note)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-pink-400/80 font-mono italic text-center border-t border-pink-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const PartialLossDrill = ({ data }: { data: { title: string; instruction: string; cases: { heard: string; options: string[]; answer: number; insight: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-slate-500/40">
            <div className="bg-slate-700/30 p-4 border-b border-slate-600/30 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-300 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.cases.map((c, cIdx) => (
                        <div key={cIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="text-base md:text-lg font-mono font-bold text-white mb-1">
                                {c.heard.split('…').map((part, i) => (
                                    <span key={i}>
                                        {i > 0 && <span className="text-slate-600 mx-1">…</span>}
                                        {parseTextWithTranslations(part)}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-3">Fragmento recebido — decida ação</p>
                            <div className="grid grid-cols-1 gap-2">
                                {c.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [cIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[cIdx] === oIdx
                                                ? oIdx === c.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500"
                                        )}
                                    >
                                        {parseTextWithTranslations(opt)}
                                    </button>
                                ))}
                            </div>
                            {answers[cIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-slate-400 italic">
                                    💡 {parseTextWithTranslations(c.insight)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-slate-400/80 font-mono italic text-center border-t border-slate-700 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const SelfRegulationProtocol = ({ data }: { data: { title: string; steps: { number: number; action: string; why: string }[]; warning: string } }) => {
    const [activeStep, setActiveStep] = useState<number | null>(null);
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-cyan-500/30">
            <div className="bg-cyan-500/10 p-4 border-b border-cyan-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-cyan-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute left-5 top-5 bottom-5 w-px bg-cyan-500/20 hidden md:block" />
                    <div className="space-y-4">
                        {data.steps.map((step, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                                className={cn(
                                    "relative flex gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                                    activeStep === idx ? "bg-cyan-500/15 border-cyan-500/40" : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/30"
                                )}
                            >
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-colors z-10",
                                    activeStep === idx ? "bg-cyan-500 border-cyan-400 text-slate-900" : "bg-slate-800 border-slate-600 text-cyan-400"
                                )}>
                                    {step.number}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white font-medium leading-snug">{parseTextWithTranslations(step.action)}</p>
                                    <AnimatePresence>
                                        {activeStep === idx && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-xs text-cyan-300/80 italic mt-2"
                                            >
                                                {parseTextWithTranslations(step.why)}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <pre className="text-xs text-red-300/80 font-mono whitespace-pre-wrap leading-relaxed">
                        {data.warning.split('\n').map((line, i) => (
                            <span key={i} className="block">{parseTextWithTranslations(line)}</span>
                        ))}
                    </pre>
                </div>
            </div>
        </div>
    );
};

const ReadinessCheck = ({ data }: { data: { title: string; description: string; questions: { text: string; signal: string }[]; interpretation: string } }) => {
    const [checked, setChecked] = useState<boolean[]>(new Array(data.questions.length).fill(false));
    const toggle = (idx: number) => setChecked(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });
    const score = checked.filter(Boolean).length;

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-emerald-500/30">
            <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-emerald-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "text-2xl font-bold font-mono transition-colors",
                        score === data.questions.length ? "text-emerald-400" : score >= 3 ? "text-yellow-400" : "text-slate-500"
                    )}>
                        {score}/{data.questions.length}
                    </div>
                </div>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.description)}</p>
                <div className="space-y-3">
                    {data.questions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggle(idx)}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                                checked[idx]
                                    ? "bg-emerald-900/30 border-emerald-500/40"
                                    : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/20"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                checked[idx] ? "bg-emerald-500 border-emerald-400" : "border-slate-600"
                            )}>
                                {checked[idx] && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm transition-colors", checked[idx] ? "text-emerald-200" : "text-slate-400")}>{parseTextWithTranslations(q.text)}</p>
                                {checked[idx] && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mt-1">
                                        ✓ {parseTextWithTranslations(q.signal)}
                                    </motion.p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
                <AnimatePresence>
                    {score > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                        >
                            <pre className="text-xs md:text-sm text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
                                {data.interpretation.split('\n').map((line, i) => (
                                    <span key={i} className="block">{parseTextWithTranslations(line)}</span>
                                ))}
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TransitionBrief = ({ content }: { content: string }) => (
    <div className="my-8 bg-slate-950 border border-cyan-500/20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-cyan-500/10 px-4 py-2 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Transition Brief</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">PRÓXIMO: CHECK-RIDE</span>
        </div>
        <pre className="text-cyan-300/80 font-mono text-xs md:text-sm p-4 md:p-6 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, i) => (
                <span key={i} className={cn("block", line.startsWith('•') ? "text-cyan-200 pl-2" : "")}>{parseTextWithTranslations(line)}</span>
            ))}
        </pre>
    </div>
);

// ============================================================================
// MODULE 4 COMPONENTS: RADAR LOCK
// ============================================================================

const RadarConsole = ({ content }: { content: string }) => (
    <div className="my-6 bg-slate-950 border border-red-500/30 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 border-b border-red-500/20">
            <Crosshair className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-red-400 font-mono text-xs uppercase tracking-widest">Painel de foco</span>
        </div>
        <pre className="text-red-300/80 font-mono text-xs md:text-sm p-4 md:p-6 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, i) => (
                <span key={i} className="block">{parseTextWithTranslations(line)}</span>
            ))}
        </pre>
    </div>
);

const StressHeatmap = ({ data }: { data: { title: string; instruction: string; lines: { text: string; peaks: string[]; why: string }[]; rule: string } }) => {
    const [revealed, setRevealed] = useState<boolean[]>(new Array(data.lines.length).fill(false));
    const toggle = (idx: number) => setRevealed(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });

    const renderWithPeaks = (text: string, peaks: string[]) => {
        const parts = text.split(' ');
        return (
            <span className="text-lg md:text-xl font-mono font-bold tracking-wide">
                {parts.map((word, i) => {
                    const clean = word.replace(/[.,!?]/g, '');
                    const isPeak = peaks.includes(clean);
                    return (
                        <span key={i} className={cn("mr-2", isPeak ? "text-red-300 bg-red-500/20 px-1 rounded" : "text-slate-400")}>
                            {word}
                        </span>
                    );
                })}
            </span>
        );
    };

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-red-500/30">
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-red-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-6">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-4">
                    {data.lines.map((line, idx) => (
                        <div key={idx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="mb-3">{renderWithPeaks(line.text, line.peaks)}</div>
                            <button
                                onClick={() => toggle(idx)}
                                className="text-xs text-red-400/70 hover:text-red-300 font-mono transition-colors"
                            >
                                {revealed[idx] ? "▲ ocultar análise" : "▼ ver análise"}
                            </button>
                            <AnimatePresence>
                                {revealed[idx] && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 text-xs text-red-300/80 italic"
                                    >
                                        {parseTextWithTranslations(line.why)}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-red-400/80 font-mono italic text-center border-t border-red-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const IntonationTrace = ({ data }: { data: { title: string; instruction: string; items: { line: string; contour: string; intent: string; danger: string }[]; rule: string } }) => {
    const [expanded, setExpanded] = useState<number | null>(null);
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-violet-500/30">
            <div className="bg-violet-500/10 p-4 border-b border-violet-500/20 flex items-center gap-3">
                <Zap className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-violet-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-3">
                    {data.items.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "rounded-lg border cursor-pointer transition-all",
                                expanded === idx ? "bg-violet-500/15 border-violet-500/40" : "bg-slate-800/50 border-slate-700 hover:border-violet-500/30"
                            )}
                            onClick={() => setExpanded(expanded === idx ? null : idx)}
                        >
                            <div className="flex items-center gap-4 p-4">
                                <span className="text-2xl font-bold text-violet-300 w-12 text-center flex-shrink-0">{item.contour}</span>
                                <div className="flex-1">
                                    <div className="font-mono text-base md:text-lg text-white font-bold">{item.line}</div>
                                </div>
                                <ChevronDown className={cn("w-4 h-4 text-violet-400 transition-transform", expanded === idx ? "rotate-180" : "")} />
                            </div>
                            <AnimatePresence>
                                {expanded === idx && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 space-y-2 border-t border-violet-500/20 pt-3">
                                            <p className="text-sm text-violet-200">{parseTextWithTranslations(item.intent)}</p>
                                            <p className="text-xs text-red-400/80 italic">⚠️ {parseTextWithTranslations(item.danger)}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-violet-400/80 font-mono italic text-center">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const EmphasisShift = ({ data }: { data: { title: string; instruction: string; base: string; variants: { stressed: string; options: string[]; answer: number; note: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-amber-500/30">
            <div className="bg-amber-500/10 p-4 border-b border-amber-500/20 flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <div className="bg-slate-800/80 rounded-lg p-3 border border-amber-500/20 mb-5 text-center">
                    <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Base phrase</span>
                    <p className="text-base font-mono text-slate-300 italic mt-1">&ldquo;{data.base}&rdquo;</p>
                </div>
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.variants.map((v, vIdx) => (
                        <div key={vIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <AudioButton text={v.stressed} size="sm" />
                                <span className="text-sm md:text-base font-mono text-amber-200 font-bold italic">&ldquo;{v.stressed}&rdquo;</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {v.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [vIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[vIdx] === oIdx
                                                ? oIdx === v.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-amber-500/30"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {answers[vIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-amber-300/80 italic">
                                    {parseTextWithTranslations(v.note)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-amber-400/80 font-mono italic text-center border-t border-amber-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const TriageDrill = ({ data }: { data: { title: string; instruction: string; entries: { input: string; expectedTags: string[]; note: string }[]; rule: string } }) => {
    const [revealed, setRevealed] = useState<boolean[]>(new Array(data.entries.length).fill(false));
    const toggle = (idx: number) => setRevealed(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-cyan-500/30">
            <div className="bg-cyan-500/10 p-4 border-b border-cyan-500/20 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-cyan-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-4">
                    {data.entries.map((entry, idx) => (
                        <div key={idx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <AudioButton text={entry.input} size="sm" />
                                <span className="text-sm font-mono text-white italic">&ldquo;{entry.input}&rdquo;</span>
                            </div>
                            <button
                                onClick={() => toggle(idx)}
                                className="w-full py-2 rounded bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 font-mono text-xs hover:bg-cyan-500/25 transition-colors"
                            >
                                {revealed[idx] ? "▲ ocultar tags" : "▼ revelar tags esperadas"}
                            </button>
                            <AnimatePresence>
                                {revealed[idx] && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {entry.expectedTags.map((tag, tIdx) => (
                                                <span key={tIdx} className={cn(
                                                    "text-xs font-mono px-3 py-1 rounded-full border",
                                                    tIdx === 0 ? "bg-red-500/15 border-red-500/30 text-red-300" :
                                                        tIdx === 1 ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300" :
                                                            "bg-violet-500/15 border-violet-500/30 text-violet-300"
                                                )}>
                                                    {tIdx === 0 ? "AÇÃO: " : tIdx === 1 ? "TEMPO: " : "TOM: "}{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400 italic">{parseTextWithTranslations(entry.note)}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-cyan-400/80 font-mono italic text-center">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const SelectiveJamming = ({ data }: { data: { title: string; instruction: string; samples: { masked: string; question: string; options: string[]; answer: number; hint: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-slate-500/40">
            <div className="bg-slate-700/30 p-4 border-b border-slate-600/30 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-300 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="font-mono text-lg md:text-xl text-white font-bold mb-1 tracking-wide">
                                {sample.masked.split('___').map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="text-slate-600 bg-slate-700 px-2 rounded mx-1">▓▓▓</span>}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mb-3 font-mono">{parseTextWithTranslations(sample.question)}</p>
                            <div className="grid grid-cols-1 gap-2">
                                {sample.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[sIdx] === oIdx
                                                ? oIdx === sample.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {answers[sIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-slate-400 italic">
                                    💡 {parseTextWithTranslations(sample.hint)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-slate-400/80 font-mono italic text-center border-t border-slate-700 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const ControlResponses = ({ data }: { data: { title: string; instruction: string; situations: { heard: string; youKnow: string; options: string[]; answer: number; note: string }[]; rule: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-emerald-500/30">
            <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-emerald-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-5">{parseTextWithTranslations(data.instruction)}</p>
                <div className="space-y-6">
                    {data.situations.map((sit, sIdx) => (
                        <div key={sIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="flex-none">
                                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Você ouviu</div>
                                    <div className="text-base font-mono text-white font-bold italic">&ldquo;{sit.heard}&rdquo;</div>
                                </div>
                                <div className="flex-none ml-4">
                                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Você sabe</div>
                                    <span className="text-xs bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 px-2 py-1 rounded font-mono">{sit.youKnow}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {sit.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all font-mono",
                                            answers[sIdx] === oIdx
                                                ? oIdx === sit.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-emerald-500/30"
                                        )}
                                    >
                                        &ldquo;{opt}&rdquo;
                                    </button>
                                ))}
                            </div>
                            {answers[sIdx] !== undefined && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-emerald-300/80 italic">
                                    ✓ {parseTextWithTranslations(sit.note)}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-emerald-400/80 font-mono italic text-center border-t border-emerald-500/10 pt-4">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    );
};

const OperatorNotes = ({ content }: { content: string }) => (
    <div className="my-6 bg-slate-950 border border-slate-600/30 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 border-b border-slate-700/50">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Operator Notes</span>
        </div>
        <pre className="text-slate-400/80 font-mono text-xs md:text-sm p-4 md:p-6 whitespace-pre-wrap leading-relaxed">
            {content.split('\n').map((line, i) => (
                <span key={i} className={cn("block", line.startsWith('•') ? "text-slate-300 pl-2" : "")}>{parseTextWithTranslations(line)}</span>
            ))}
        </pre>
    </div>
);

const CompletionSeal = ({ content }: { content: string }) => (
    <div className="my-12 relative">
        <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
        <div className="relative bg-red-950/20 border border-red-500/40 p-8 md:p-12 rounded-xl text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crosshair className="w-32 h-32 text-red-500" />
            </div>
            <div className="relative z-10">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                    <Crosshair className="w-10 h-10 text-slate-900" />
                </div>
                <pre className="text-red-200 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed max-w-lg mx-auto">
                    {content.split('\n').map((line, i) => (
                        <span key={i} className="block">{parseTextWithTranslations(line)}</span>
                    ))}
                </pre>
            </div>
        </div>
    </div>
);

// ============================================================================
// MODULE 3 COMPONENTS: FREQUENCY SYNC
// ============================================================================

const BoundaryIllusion = ({ data }: { data: { title: string; instruction: string; example: string; insight: string } }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-indigo-500/30">
            <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20 flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-indigo-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-6">{parseTextWithTranslations(data.instruction)}</p>

                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 mb-6">
                    <div className="text-center">
                        <div className="text-lg md:text-xl font-mono text-white font-bold mb-4 tracking-wide">
                            {parseTextWithTranslations(data.example.split('\n')[0])}
                        </div>

                        <AnimatePresence>
                            {revealed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4"
                                >
                                    <div className="text-sm text-indigo-300/80 whitespace-pre-line leading-relaxed">
                                        {data.example.split('\n').slice(1).map((line, i) => (
                                            <p key={i} className="mb-1">{parseTextWithTranslations(line)}</p>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    onClick={() => setRevealed(!revealed)}
                    className="w-full py-3 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-sm hover:bg-indigo-500/30 transition-colors"
                >
                    {revealed ? "OCULTAR SEGMENTAÇÃO" : "REVELAR SEGMENTAÇÃO REAL"}
                </button>

                {revealed && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-xs text-indigo-400/80 italic text-center font-mono"
                    >
                        💡 {parseTextWithTranslations(data.insight)}
                    </motion.p>
                )}
            </div>
        </div>
    );
};

const LinkingMap = ({ data }: { data: { title: string; patterns: { pattern: string; example: string; note: string }[]; rule: string } }) => (
    <div className="my-8 bg-slate-900/50 rounded-xl border border-teal-500/30">
        <div className="bg-teal-500/10 p-4 border-b border-teal-500/20 flex items-center gap-3">
            <Zap className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-teal-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
        </div>
        <div className="p-4 md:p-6 space-y-4">
            {data.patterns.map((p, idx) => (
                <div key={idx} className="bg-slate-800/60 rounded-lg p-4 border border-teal-500/10 hover:border-teal-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-teal-500 bg-teal-500/10 px-2 py-1 rounded">
                            {parseTextWithTranslations(p.pattern)}
                        </span>
                    </div>
                    <div className="text-base md:text-lg font-mono font-bold text-white mb-2">
                        {parseTextWithTranslations(p.example)}
                    </div>
                    <p className="text-xs text-slate-400 italic">{parseTextWithTranslations(p.note)}</p>
                </div>
            ))}
            <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-center">
                <p className="text-xs md:text-sm text-teal-300 font-mono">{parseTextWithTranslations(data.rule)}</p>
            </div>
        </div>
    </div>
);

const CompressionDeck = ({ data }: { data: { title: string; items: { written: string; compressed: string; why: string }[]; warning: string } }) => {
    const [flipped, setFlipped] = useState<boolean[]>(new Array(data.items.length).fill(false));
    const toggle = (idx: number) => setFlipped(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-orange-500/30">
            <div className="bg-orange-500/10 p-4 border-b border-orange-500/20 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-orange-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => toggle(idx)}
                        className={cn(
                            "p-4 rounded-lg border text-center transition-all duration-300 cursor-pointer group",
                            flipped[idx]
                                ? "bg-orange-500/20 border-orange-500/40"
                                : "bg-slate-800/80 border-slate-700 hover:border-orange-500/30"
                        )}
                    >
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                            {flipped[idx] ? "Compressed" : "Written"}
                        </div>
                        <div className="text-lg md:text-xl font-bold font-mono text-white mb-2">
                            {flipped[idx] ? item.compressed : parseTextWithTranslations(item.written)}
                        </div>
                        {flipped[idx] && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] text-orange-300/80 italic"
                            >
                                {parseTextWithTranslations(item.why)}
                            </motion.p>
                        )}
                        <div className="text-[10px] text-slate-500 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            {flipped[idx] ? "↩ escrito" : "→ comprimido"}
                        </div>
                    </button>
                ))}
            </div>
            <p className="px-6 pb-4 text-xs text-orange-400/80 font-mono italic">{parseTextWithTranslations(data.warning)}</p>
        </div>
    );
};

const BlockDecode = ({ data }: { data: { title: string; instruction: string; samples: { audio: string; options: string[]; answer: number }[]; goal: string } }) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-cyan-500/30">
            <div className="bg-cyan-500/10 p-4 border-b border-cyan-500/20 flex items-center gap-3">
                <Play className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-cyan-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-6">{parseTextWithTranslations(data.instruction)}</p>

                <div className="space-y-6">
                    {data.samples.map((sample, sIdx) => (
                        <div key={sIdx} className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <AudioButton text={sample.audio} size="sm" />
                                <span className="text-sm md:text-base font-mono text-white font-bold italic">&ldquo;{sample.audio}&rdquo;</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {sample.options.map((opt, oIdx) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => setAnswers(prev => ({ ...prev, [sIdx]: oIdx }))}
                                        className={cn(
                                            "w-full text-left p-3 rounded border text-sm transition-all",
                                            answers[sIdx] === oIdx
                                                ? oIdx === sample.answer
                                                    ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                                    : "bg-red-900/40 border-red-500/50 text-red-100"
                                                : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/30"
                                        )}
                                    >
                                        {parseTextWithTranslations(opt)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {Object.keys(answers).length === data.samples.length && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center"
                        >
                            <p className="text-sm text-cyan-300 font-mono font-bold">{parseTextWithTranslations(data.goal)}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const LatencyCheck = ({ data }: { data: { title: string; description: string; items: string[]; interpretation: string } }) => {
    const [checked, setChecked] = useState<boolean[]>(new Array(data.items.length).fill(false));
    const toggle = (idx: number) => setChecked(prev => { const next = [...prev]; next[idx] = !next[idx]; return next; });

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-yellow-500/30">
            <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 flex items-center gap-3">
                <Cpu className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-yellow-400 font-mono text-xs md:text-sm uppercase tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>
            <div className="p-4 md:p-6">
                <p className="text-slate-400 text-sm mb-4">{parseTextWithTranslations(data.description)}</p>
                <div className="space-y-3">
                    {data.items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggle(idx)}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-lg border text-left text-sm transition-all",
                                checked[idx]
                                    ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-200"
                                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-yellow-500/20"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                checked[idx] ? "bg-yellow-500 border-yellow-400" : "border-slate-600"
                            )}>
                                {checked[idx] && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                            </div>
                            <span>{parseTextWithTranslations(item)}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {checked.some(Boolean) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center"
                        >
                            <p className="text-xs md:text-sm text-yellow-300 font-mono italic">{parseTextWithTranslations(data.interpretation)}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TowerStamp = ({ content }: { content: string }) => (
    <div className="my-12 relative">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="relative bg-emerald-950/20 border border-emerald-500/40 p-8 md:p-12 rounded-xl text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-slate-900" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-400 font-mono tracking-tighter mb-4 uppercase">SINAL VALIDADO</h3>
                <div className="text-slate-300 text-base md:text-lg max-w-lg mx-auto whitespace-pre-wrap leading-relaxed">
                    {parseTextWithTranslations(content)}
                </div>
            </div>
        </div>
    </div>
);

const RenderBlock = ({
    block,
    moduleId,
    onGameComplete,
}: {
    block: ContentBlock;
    moduleId?: string;
    onGameComplete?: (moduleId: string) => void;
}) => {
    if (block.type.startsWith("box-") || block.type === "pillar-end" || block.type === "micro-win") {
        const boxClass = BoxStyles[block.type as keyof typeof BoxStyles] || "";
        return (
            <div className={cn("rounded border-l-2 p-6 my-6 relative overflow-hidden backdrop-blur-sm", boxClass)}>
                <div className="flex items-start gap-4 relative z-10">
                    {block.type !== "pillar-end" && <div className="mt-1 flex-shrink-0"><BoxIcon type={block.type} /></div>}

                    <div className={cn("flex-1", block.type === "pillar-end" && "flex flex-col items-center")}>
                        {block.type === "pillar-end" && <div className="mb-4"><BoxIcon type={block.type} /></div>}
                        {block.title && (
                            <h4 className={cn("font-bold text-sm font-mono tracking-wider mb-2 opacity-90", block.type === "pillar-end" && "text-xl")}>
                                {block.title.toUpperCase()}
                            </h4>
                        )}
                        <div className="text-base leading-relaxed opacity-90">
                            {Array.isArray(block.content) ? (
                                block.content.map((line, i) => <p key={i} className="mb-2 last:mb-0">{parseTextWithTranslations(line)}</p>)
                            ) : (
                                <p>{parseTextWithTranslations(block.content as string)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    switch (block.type) {
        case "h2":
            return (
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                    {parseTranslatable(block.content as string)}
                </h2>
            );
        case "h3":
            return <h3 className="text-xl font-bold text-slate-200 mt-8 mb-4">{parseTextWithTranslations(block.content as string)}</h3>;
        case "paragraph":
            return (
                <p className="text-lg text-slate-400 leading-relaxed mb-6 font-sans">
                    {parseTextWithTranslations(block.content as string)}
                </p>
            );
        case "list":
            return (
                <ul className="space-y-3 my-6 pl-2">
                    {(block.content as string[]).map((item, i) => {
                        const parts = item.split(':');
                        const title = parts.length > 1 ? parts[0] : null;
                        const desc = parts.length > 1 ? parts.slice(1).join(':') : item;
                        return (
                            <li key={i} className="flex items-start gap-3 text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2.5 flex-shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                <span className="text-lg">
                                    {title ? <><strong className="text-slate-200">{parseTextWithTranslations(title)}:</strong>{parseTextWithTranslations(desc)}</> : <>{parseTextWithTranslations(desc)}</>}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            );
        case "system-status":
            return (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 bg-[#111313] text-emerald-200 p-4 rounded-xl border border-emerald-700/35 my-6 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.65)]" />
                        <span className="uppercase tracking-wider font-semibold text-emerald-100/90">Status da aula</span>
                    </div>
                    <span className="text-emerald-50/85">{parseTextWithTranslations(block.content as string)}</span>
                </div>
            );
        case "terminal-view":
            return (
                <div className="my-8 rounded overflow-hidden bg-[#050505] border border-white/10 shadow-2xl font-mono text-sm group hover:border-cyan-500/30 transition-colors">
                    <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="text-white/20 text-xs ml-2">painel-aula</span>
                    </div>
                    <div className="p-4 text-emerald-400/90 leading-relaxed font-mono overflow-x-auto">
                        <div className="min-w-[300px]">
                            {Array.isArray(block.content) ? block.content.map((line, i) => (
                                <div key={i} className="mb-1"><span className="text-white/30 mr-2">$</span>{line}</div>
                            )) : <div>{block.content}</div>}
                            <div className="animate-pulse text-cyan-500 mt-2">_</div>
                        </div>
                    </div>
                </div>
            );
        case "interactive-quiz":
            const quiz = parseQuizContent(block.content as string);
            return <InteractiveQuiz question={quiz.question} options={quiz.options} answer={quiz.answer || 0} />;
        case "scramble-exercise":
            if (typeof block.content === "string") {
                const raw = (block.content as string).trim();
                if (raw.startsWith("{")) {
                    try {
                        const parsed = JSON.parse(raw) as { sentence?: string; translation?: string };
                        if (parsed?.sentence) {
                            return <ScrambleExercise targetSentence={parsed.sentence} translation={parsed.translation} />;
                        }
                    } catch {
                        // Keep backward compatibility with plain-string content.
                    }
                }
            }
            return <ScrambleExercise targetSentence={block.content as string} />;
        case "combat-sort-game":
            return <CombatSortGame data={JSON.parse(block.content as string)} />;
        case "audio-decode-game":
            return <AudioDecodeGame data={JSON.parse(block.content as string)} />;
        case "consolidation-game":
            return <ConsolidationGame data={JSON.parse(block.content as string)} onComplete={moduleId ? () => onGameComplete?.(moduleId) : undefined} />;
        case "maze-game":
            if (typeof block.content === "string") {
                const raw = (block.content as string).trim();
                if (raw.startsWith("{")) {
                    try {
                        return <MazeGame data={JSON.parse(raw)} onComplete={moduleId ? () => onGameComplete?.(moduleId) : undefined} />;
                    } catch {
                        return <MazeGame data={{}} onComplete={moduleId ? () => onGameComplete?.(moduleId) : undefined} />;
                    }
                }
            }
            return <MazeGame data={{}} onComplete={moduleId ? () => onGameComplete?.(moduleId) : undefined} />;
        case "reveal-box":
            return <RevealBox title={parseTextWithTranslations(block.title || "Detalhes") as string}>{parseTextWithTranslations(block.content as string)}</RevealBox>;
        case "audio-player":
            return (
                <div className="my-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center gap-4 hover:border-cyan-500/50 transition-colors group">
                    <AudioButton text={block.content as string} size="lg" />
                    <div className="flex-1">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Áudio de apoio</div>
                        <div className="text-slate-300 font-medium text-sm md:text-base">{block.content}</div>
                    </div>
                </div>
            );
        case "cards-grid":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                    {(block.content as string[]).map((card, i) => {
                        const [title, ...descParts] = splitOutsideTranslatable(card, '|');
                        const desc = descParts.join('|');
                        return (
                            <div key={i} className="bg-slate-900/40 p-4 md:p-6 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all group backdrop-blur-sm">
                                <h4 className="font-bold text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors flex items-center gap-2 font-mono text-sm md:text-base">
                                    <Cpu className="w-4 h-4 text-slate-500" />
                                    {parseTextWithTranslations(title)}
                                </h4>
                                <p className="text-xs md:text-sm text-slate-400">{parseTextWithTranslations(desc)}</p>
                            </div>
                        )
                    })}
                </div>
            );
        case "video":
            return (
                <div className="my-8 md:my-10 rounded overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 bg-black">
                    <div className="bg-slate-900/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Vídeo de apoio</span>
                        </div>
                        <span className="text-white/40 text-[10px] md:text-xs font-mono">{block.title}</span>
                    </div>
                    <div className="aspect-video w-full bg-black relative">
                        <iframe width="100%" height="100%" src={block.content as string} title={block.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0" />
                    </div>
                </div>
            );
        case "table":
            return (
                <div className="my-8 md:my-10 rounded border border-slate-700/50 overflow-hidden bg-slate-900/20 backdrop-blur">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{block.title || "Tabela de apoio"}</span>
                    </div>
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-sm text-left min-w-[500px]">
                            <tbody className="divide-y divide-slate-800">
                                {(block.content as string[]).map((row, i) => {
                                    const cols = splitOutsideTranslatable(row, '|');
                                    return (
                                        <tr key={i} className={i === 0 ? "bg-slate-900/80 font-bold text-cyan-400 font-mono text-xs uppercase" : "hover:bg-white/5 transition-colors"}>
                                            {cols.map((col, j) => (
                                                <td key={j} className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-slate-400 first:text-slate-200 text-xs md:text-sm">
                                                    {parseTextWithTranslations(col)}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case "dialogue":
            return (
                <div className="my-10 bg-slate-900/30 rounded border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diálogo guiado: {parseTextWithTranslations(block.title || "")}</span>
                    </div>
                    <div className="p-6 space-y-4">
                        {(block.content as string[]).map((line, i) => {
                            const [speaker, text] = line.split(':');
                            const isMe = ["You", "Você", "Eu", "Me"].includes(speaker.trim());
                            return (
                                <div key={i} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1 font-mono">{parseTextWithTranslations(speaker)}</span>
                                    <div className={cn(
                                        "px-4 py-3 rounded text-sm leading-relaxed shadow-lg border relative",
                                        isMe ? "bg-cyan-900/20 border-cyan-500/30 text-cyan-100" : "bg-slate-800/40 border-slate-700 text-slate-300"
                                    )}>
                                        {parseTextWithTranslations(text)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        // ================================================================
        // NEW INTERACTIVE BLOCK TYPES FOR PILAR 1
        // ================================================================
        case "brain-diagram": {
            const brainData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <BrainDiagram data={brainData} />;
        }
        case "comparison-table": {
            const tableData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <ComparisonTable data={tableData} />;
        }
        case "scenario-card": {
            const scenarioData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <ScenarioCard data={scenarioData} />;
        }
        case "phonetic-breakdown": {
            const phoneticData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <PhoneticBreakdown data={phoneticData} />;
        }
        case "elite-insight":
            return <EliteInsight title={block.title || "INSIGHT DE ELITE"} content={block.content as string} />;
        // ================================================================
        // PART 2 COMPONENT RENDERS
        // ================================================================
        case "memory-diagram": {
            const memoryData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <MemoryDiagram data={memoryData} />;
        }
        case "baby-learning": {
            const learningData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <BabyLearning data={learningData} />;
        }
        case "phrase-analysis": {
            const phraseData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <PhraseAnalysis data={phraseData} />;
        }
        // ================================================================
        // TOWER RENDERS (PILAR 2)
        // ================================================================
        case "tower-log":
            return <TowerLog content={block.content as string} />;
        case "sonic-scan":
            return <SonicScan data={JSON.parse(block.content as string)} />;
        case "a-b-snaptest":
            return <ABSnapTest data={JSON.parse(block.content as string)} />;
        case "latency-meter":
            return <LatencyMeter data={JSON.parse(block.content as string)} />;
        case "cutoff-drill":
            return <CutoffDrill data={JSON.parse(block.content as string)} />;
        case "misfire-cases":
            return <MisfireCases data={JSON.parse(block.content as string)} />;
        case "anchor-builder":
            return <AnchorBuilder data={JSON.parse(block.content as string)} />;
        case "checksum":
            return <Checksum data={JSON.parse(block.content as string)} />;
        case "tower-stamp":
            return <TowerStamp content={block.content as string} />;
        // ================================================================
        // MODULE 3 COMPONENT RENDERS (FREQUENCY SYNC)
        // ================================================================
        case "boundary-illusion":
            return <BoundaryIllusion data={JSON.parse(block.content as string)} />;
        case "linking-map":
            return <LinkingMap data={JSON.parse(block.content as string)} />;
        case "compression-deck":
            return <CompressionDeck data={JSON.parse(block.content as string)} />;
        case "block-decode":
            return <BlockDecode data={JSON.parse(block.content as string)} />;
        case "latency-check":
            return <LatencyCheck data={JSON.parse(block.content as string)} />;
        // ================================================================
        // MODULE 4 COMPONENT RENDERS (RADAR LOCK)
        // ================================================================
        case "radar-console":
            return <RadarConsole content={block.content as string} />;
        case "stress-heatmap":
            return <StressHeatmap data={JSON.parse(block.content as string)} />;
        case "intonation-trace":
            return <IntonationTrace data={JSON.parse(block.content as string)} />;
        case "emphasis-shift":
            return <EmphasisShift data={JSON.parse(block.content as string)} />;
        case "triage-drill":
            return <TriageDrill data={JSON.parse(block.content as string)} />;
        case "selective-jamming":
            return <SelectiveJamming data={JSON.parse(block.content as string)} />;
        case "control-responses":
            return <ControlResponses data={JSON.parse(block.content as string)} />;
        case "operator-notes":
            return <OperatorNotes content={block.content as string} />;
        case "completion-seal":
            return <CompletionSeal content={block.content as string} />;
        // ================================================================
        // MODULE 5 COMPONENT RENDERS (FULL SPECTRUM)
        // ================================================================
        case "spectrum-init":
            return <SpectrumInit content={block.content as string} />;
        case "accent-drift-map":
            return <AccentDriftMap data={JSON.parse(block.content as string)} />;
        case "imperfect-input":
            return <ImperfectInput data={JSON.parse(block.content as string)} />;
        case "emotional-overlay":
            return <EmotionalOverlay data={JSON.parse(block.content as string)} />;
        case "partial-loss-drill":
            return <PartialLossDrill data={JSON.parse(block.content as string)} />;
        case "self-regulation-protocol":
            return <SelfRegulationProtocol data={JSON.parse(block.content as string)} />;
        case "readiness-check":
            return <ReadinessCheck data={JSON.parse(block.content as string)} />;
        case "transition-brief":
            return <TransitionBrief content={block.content as string} />;
        // ================================================================
        // MODULE 6 COMPONENT RENDERS (CLEARANCE)
        // ================================================================
        case "soft-status":
            return <SoftStatus content={block.content as string} />;
        case "simple-list":
            return <SimpleList items={block.content as string[]} />;
        case "soft-warning":
            return <SoftWarning title={block.title || ""} content={block.content as string} />;
        case "final-note":
            return <FinalNote content={block.content as string} />;
        case "pilar2-end":
            return <PillarEnd title={block.title || ""} content={block.content as string} />;
        default:
            return null;
    }
};

// ============================================================================
// MAIN COMPONENT: CASCADING DRAWER (ACCORDION)
// ============================================================================

export const PillarOperationalView = ({ data }: PillarOperationalViewProps) => {
    const [activeModuleId, setActiveModuleId] = useState<string | null>(
        data.modules?.[0]?.id || null
    );
    const [highlightedModuleId, setHighlightedModuleId] = useState<string | null>(null);
    const [challengeTarget, setChallengeTarget] = useState<{ moduleId: string; index: number } | null>(null);
    const [challengeAnswers, setChallengeAnswers] = useState<Record<string, Array<boolean | null>>>({});
    const [challengePassed, setChallengePassed] = useState<Record<string, boolean>>({});
    const [challengeLockUntil, setChallengeLockUntil] = useState<Record<string, number>>({});
    const [challengeFeedback, setChallengeFeedback] = useState<Record<string, "ok" | "error" | null>>({});
    const [challengeQuestions, setChallengeQuestions] = useState<Record<string, ModuleChallengeQuestion[]>>({});
    const challengeUsedQuestionIdsRef = useRef<Record<string, Set<number>>>({});
    const challengeCursorRef = useRef<Record<string, number>>({});
    const [mazePassedByModule, setMazePassedByModule] = useState<Record<string, boolean>>({});
    const [mazeHintByModule, setMazeHintByModule] = useState<Record<string, string | null>>({});
    const [clockNow, setClockNow] = useState(() => Date.now());
    const accordionTimerRef = useRef<number | null>(null);
    const viewRootRef = useRef<HTMLDivElement | null>(null);

    const { markPillarModuleAsCompleted, isPillarModuleCompleted } = useProgress();

    useEffect(() => {
        const timer = window.setInterval(() => {
            setClockNow(Date.now());
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const root = viewRootRef.current;
        if (!root) return;

        let lastPlayed = 0;
        const onClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const clickable = target.closest('button, [role="button"]');
            if (!clickable) return;

            const now = Date.now();
            if (now - lastPlayed < 40) return;
            lastPlayed = now;
            playUiSfx("click");
        };

        root.addEventListener("click", onClick, { capture: true });
        return () => root.removeEventListener("click", onClick, { capture: true });
    }, []);

    useEffect(() => {
        return () => {
            if (accordionTimerRef.current) {
                window.clearTimeout(accordionTimerRef.current);
                accordionTimerRef.current = null;
            }
        };
    }, []);

    const scrollToModuleAnchor = (
        moduleId: string,
        options?: { delay?: number; behavior?: ScrollBehavior }
    ) => {
        const { delay = 80, behavior = "auto" } = options || {};

        window.setTimeout(() => {
            requestAnimationFrame(() => {
                const anchor = document.getElementById(`module-anchor-${moduleId}`);
                if (!anchor) return;
                const targetY = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - 86);
                window.scrollTo({ top: targetY, behavior });
            });
        }, delay);
    };

    // If no modules, fallback (or handle legacy blocks) - ideally we migrate all
    if (!data.modules) {
        return (
            <div className="text-center p-10 text-white">
                <h2 className="text-xl text-red-400">Conteúdo antigo detectado</h2>
                <p className="text-white/60">Migre este pilar para o novo formato de módulos.</p>
            </div>
        );
    }

    const openModuleFromTop = (
        moduleId: string,
        options?: { behavior?: ScrollBehavior; closeCurrentFirst?: boolean }
    ) => {
        const { behavior = "smooth", closeCurrentFirst = true } = options || {};

        if (accordionTimerRef.current) {
            window.clearTimeout(accordionTimerRef.current);
            accordionTimerRef.current = null;
        }

        const openNow = () => {
            setActiveModuleId(moduleId);
            scrollToModuleAnchor(moduleId, { delay: 120, behavior });
        };

        if (closeCurrentFirst && activeModuleId && activeModuleId !== moduleId) {
            setActiveModuleId(null);
            accordionTimerRef.current = window.setTimeout(() => {
                openNow();
                accordionTimerRef.current = null;
            }, 260);
            return;
        }

        openNow();
    };

    const handleModuleClick = (moduleId: string, status: string | undefined, index: number) => {
        // Allow clicking on completed or active modules
        const isCompleted = isPillarModuleCompleted(moduleId);
        const isUnlocked = index === 0 || isPillarModuleCompleted(data.modules![index - 1]?.id);

        if (status === 'locked' && !isCompleted && !isUnlocked) return;

        // Fecha painel de desafio quando muda de modulo.
        if (challengeTarget?.moduleId && challengeTarget.moduleId !== moduleId) {
            setChallengeTarget(null);
        }

        const newActiveId = activeModuleId === moduleId ? null : moduleId;
        if (!newActiveId) {
            if (accordionTimerRef.current) {
                window.clearTimeout(accordionTimerRef.current);
                accordionTimerRef.current = null;
            }
            setActiveModuleId(null);
            return;
        }

        openModuleFromTop(moduleId, { behavior: "smooth", closeCurrentFirst: true });
    };

    const handleCompleteModule = (currentModuleId: string, currentIndex: number) => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        // Mark as completed
        markPillarModuleAsCompleted(currentModuleId);

        const nextModule = data.modules![currentIndex + 1];

        if (nextModule) {
            setHighlightedModuleId(nextModule.id);
            openModuleFromTop(nextModule.id, { behavior: "smooth", closeCurrentFirst: true });

            // Stop blinking after 3 seconds
            setTimeout(() => {
                setHighlightedModuleId(null);
            }, 3000);
        } else {
            setActiveModuleId(null);
            scrollToModuleAnchor(currentModuleId, { delay: 120, behavior: "smooth" });
        }
    };

    const getChallengePool = (moduleId: string, moduleTitle: string): ModuleChallengeQuestion[] => {
        const title = moduleTitle.toLowerCase();

        if (moduleId.startsWith("p3-")) {
            if (title.includes("base social")) {
                return [
                    { question: "Falar com gentileza melhora a resposta do outro lado?", answer: true },
                    { question: "Ser extremamente direto sempre soa natural em inglês?", answer: false },
                    { question: "Pedir repetição com educação ajuda a manter a conversa?", answer: true },
                    { question: "Fingir que entendeu evita problema no longo prazo?", answer: false },
                    { question: "Frases curtas e claras podem ser mais eficazes que frases longas?", answer: true },
                    { question: "Usar 'please' e 'thank you' é opcional em todo contexto formal?", answer: false },
                ];
            }
            if (title.includes("restaurante") || title.includes("café")) {
                return [
                    { question: "No restaurante, 'I'd like...' costuma soar mais natural que 'I want...'? ", answer: true },
                    { question: "Se o pedido vier errado, a melhor abordagem é atacar o atendente?", answer: false },
                    { question: "Confirmar conta e itens antes de pagar evita confusão?", answer: true },
                    { question: "Em pedidos com alergia, ser vago é suficiente?", answer: false },
                    { question: "Pedir para dividir a conta é uma situação comum e válida?", answer: true },
                    { question: "Evitar qualquer pergunta sobre o menu ajuda na clareza?", answer: false },
                ];
            }
            if (title.includes("hotel")) {
                return [
                    { question: "No hotel, explicar problema + pedido de solução é uma boa estrutura?", answer: true },
                    { question: "Reclamar sem contexto costuma resolver mais rápido?", answer: false },
                    { question: "Pedir troca de quarto com educação aumenta chance de ajuda?", answer: true },
                    { question: "Para check-in/check-out, não precisa confirmar horário?", answer: false },
                    { question: "Pedir ajuda para bagagem/itens perdidos é apropriado?", answer: true },
                    { question: "Silêncio total quando há problema no quarto é a melhor estratégia?", answer: false },
                ];
            }
            if (title.includes("transporte") || title.includes("aeroporto")) {
                return [
                    { question: "Confirmar destino no app antes de sair reduz erro de rota?", answer: true },
                    { question: "Em caso de voo atrasado, ficar sem perguntar opções ajuda?", answer: false },
                    { question: "Perguntar portão e horário de embarque é essencial?", answer: true },
                    { question: "Se perdeu conexão, é melhor não avisar ninguém?", answer: false },
                    { question: "Em transporte, pedido claro e curto facilita entendimento?", answer: true },
                    { question: "No aeroporto, adivinhar informações é melhor que confirmar?", answer: false },
                ];
            }
            if (title.includes("saúde") || title.includes("farmácia")) {
                return [
                    { question: "Em saúde, descrever sintoma e intensidade ajuda atendimento?", answer: true },
                    { question: "Falar de alergia não é importante em consulta?", answer: false },
                    { question: "Em emergência, frases curtas e diretas são recomendadas?", answer: true },
                    { question: "Evitar pedir esclarecimento sobre dose de remédio é seguro?", answer: false },
                    { question: "Pedir recibo/relatório pode ser necessário para seguro?", answer: true },
                    { question: "Esperar piorar sem comunicar sintomas graves é boa prática?", answer: false },
                ];
            }
        }

        if (moduleId === "p1-m1") {
            return [
                { question: "Quando der branco, pedir desculpa pelo inglês é a melhor saída?", answer: false },
                { question: "Usar frases curtas (como pedir repetição) ajuda a manter controle da conversa?", answer: true },
                { question: "Respirar e ganhar 1 segundo pode evitar o travamento?", answer: true },
                { question: "Fingir entendimento total sempre te protege da confusão?", answer: false },
            ];
        }

        if (title.includes("pareto")) {
            return [
                { question: "Você precisa saber todas as palavras para se comunicar bem?", answer: false },
                { question: "Focar no vocabulário de maior uso acelera o resultado?", answer: true },
                { question: "Praticar os blocos mais frequentes costuma trazer retorno rápido?", answer: true },
                { question: "Distribuir esforço igual em tudo é sempre o mais eficiente?", answer: false },
            ];
        }

        if (title.includes("som")) {
            return [
                { question: "Fala conectada pode parecer mais rápida, mas é sobre ligação de sons?", answer: true },
                { question: "Adicionar vogal no fim de toda palavra em inglês melhora sua clareza?", answer: false },
                { question: "Perceber cortes e conexões de som ajuda no listening?", answer: true },
                { question: "Ignorar ritmo e entonação não impacta compreensão?", answer: false },
            ];
        }

        return [
            { question: "Neste módulo, a prática real vale mais do que perfeição travada?", answer: true },
            { question: "Fingir entendimento quando você não entendeu é uma boa estratégia?", answer: false },
            { question: "Pedir confirmação pode evitar erros em cadeia?", answer: true },
            { question: "Evitar tentar por medo de errar é o melhor caminho?", answer: false },
        ];
    };

    const pickModuleChallenge = (moduleId: string, moduleTitle: string): ModuleChallengeQuestion[] => {
        const pool = getChallengePool(moduleId, moduleTitle);
        const used = challengeUsedQuestionIdsRef.current[moduleId] ?? new Set<number>();
        const available = pool.map((_, idx) => idx).filter((idx) => !used.has(idx));

        let source = available.length >= 2
            ? available
            : pool.map((_, idx) => idx);

        if (available.length < 2) {
            challengeUsedQuestionIdsRef.current[moduleId] = new Set<number>();
            source = pool.map((_, idx) => idx);
        }
        const cursor = challengeCursorRef.current[moduleId] ?? 0;
        const pickedIdx = [
            source[cursor % source.length],
            source[(cursor + 1) % source.length],
        ];
        challengeCursorRef.current[moduleId] = (cursor + 2) % Math.max(source.length, 1);
        const newUsed = challengeUsedQuestionIdsRef.current[moduleId] ?? new Set<number>();
        pickedIdx.forEach((idx) => newUsed.add(idx));
        challengeUsedQuestionIdsRef.current[moduleId] = newUsed;

        return pickedIdx.map((idx) => pool[idx]);
    };

    const handleStartCompletionFlow = (moduleId: string, moduleTitle: string, index: number) => {
        const moduleRef = data.modules?.find((m) => m.id === moduleId);
        const hasInlineGameGate = !!moduleRef?.blocks?.some((b) => b.type === "maze-game" || b.type === "consolidation-game");

        if (hasInlineGameGate) {
            if (!mazePassedByModule[moduleId]) {
                setMazeHintByModule((prev) => ({
                    ...prev,
                    [moduleId]: "Conclua o desafio deste módulo para liberar o avanço.",
                }));
                return;
            }
            handleCompleteModule(moduleId, index);
            return;
        }

        if (challengePassed[moduleId]) {
            handleCompleteModule(moduleId, index);
            return;
        }

        setMazeHintByModule((prev) => ({ ...prev, [moduleId]: null }));
        const moduleQuestions = pickModuleChallenge(moduleId, moduleTitle);
        setChallengeQuestions((prev) => ({ ...prev, [moduleId]: moduleQuestions }));
        setChallengeFeedback((prev) => ({ ...prev, [moduleId]: null }));
        setChallengeTarget({ moduleId, index });
        setChallengeAnswers((prev) => ({
            ...prev,
            [moduleId]: [null, null],
        }));
    };

    const handleChallengeAnswer = (moduleId: string, questionIndex: number, answer: boolean) => {
        setChallengeAnswers((prev) => {
            const current = [...(prev[moduleId] ?? [null, null])];
            current[questionIndex] = answer;
            return {
                ...prev,
                [moduleId]: current,
            };
        });
    };

    const handleChallengeSubmit = (moduleId: string, moduleTitle: string, index: number) => {
        const lockUntil = challengeLockUntil[moduleId] ?? 0;
        if (lockUntil > clockNow) return;

        const questions = challengeQuestions[moduleId] ?? pickModuleChallenge(moduleId, moduleTitle);
        if (!challengeQuestions[moduleId]) {
            setChallengeQuestions((prev) => ({ ...prev, [moduleId]: questions }));
        }
        const answers = challengeAnswers[moduleId] ?? [null, null];
        const allAnswered = answers.every((value) => value !== null);
        if (!allAnswered) return;

        const isCorrect = questions.every((q, qIndex) => answers[qIndex] === q.answer);

        if (!isCorrect) {
            setChallengeFeedback((prev) => ({ ...prev, [moduleId]: "error" }));
            setChallengeLockUntil((prev) => ({ ...prev, [moduleId]: Date.now() + 30_000 }));
            playUiSfx("error");
            return;
        }

        setChallengeFeedback((prev) => ({ ...prev, [moduleId]: "ok" }));
        setChallengePassed((prev) => ({ ...prev, [moduleId]: true }));
        setChallengeTarget(null);
        playUiSfx("success");
        handleCompleteModule(moduleId, index);
    };

    const handleGameComplete = (moduleId: string) => {
        setMazePassedByModule((prev) => ({ ...prev, [moduleId]: true }));
        setMazeHintByModule((prev) => ({ ...prev, [moduleId]: "Desafio concluído. Você já pode avançar para o próximo módulo." }));
    };

    return (
        <div ref={viewRootRef} className="w-full max-w-5xl mx-auto pb-32">
            {/* HEADER */}
            <div className="mb-12 relative">
                <div className="absolute top-0 left-0 w-20 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter pt-8">
                    {parseTextWithTranslations(data.title)}
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
                    {parseTextWithTranslations(data.subtitle)}
                </p>
            </div>

            {/* CASCADING MODULES */}
            <div className="space-y-4" style={{ overflowAnchor: "none" }}>
                {data.modules.map((module, index) => {
                    const isActive = activeModuleId === module.id;
                    const isCompleted = isPillarModuleCompleted(module.id);
                    const isFirstUnlockedIncomplete = index === 0 || isPillarModuleCompleted(data.modules![index - 1]?.id);
                    const isLocked = module.status === 'locked' && !isCompleted && !isFirstUnlockedIncomplete;
                    const isHighlighted = highlightedModuleId === module.id;
                    const hasInlineGameGate = module.blocks.some((b) => b.type === "maze-game" || b.type === "consolidation-game");
                    const blockedByMaze = hasInlineGameGate && !mazePassedByModule[module.id];

                    return (
                        <div key={module.id} className="relative">
                            {/* Scroll Anchor - positioned above module */}
                            <div
                                id={`module-anchor-${module.id}`}
                                className="absolute -top-24"
                                aria-hidden="true"
                            />
                            <motion.div
                                id={`module-${module.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative rounded-lg border transition-all duration-300",
                                    isActive
                                        ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_30px_rgba(8,145,178,0.1)]"
                                        : isHighlighted
                                            ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-pulse"
                                            : isCompleted
                                                ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                                                : isLocked
                                                    ? "bg-slate-950/30 border-slate-800 opacity-60"
                                                    : "bg-slate-900/40 border-slate-700 hover:border-slate-500"
                                )}
                            >
                                {/* Module Header / Trigger */}
                                <button
                                    type="button"
                                    onClick={() => handleModuleClick(module.id, module.status, index)}
                                    className="w-full flex items-center justify-between p-6 text-left relative z-10"
                                    disabled={isLocked}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded flex items-center justify-center border font-mono text-lg font-bold transition-colors",
                                            isCompleted
                                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                                                : isActive
                                                    ? "bg-cyan-950 text-cyan-400 border-cyan-500/50"
                                                    : isLocked
                                                        ? "bg-slate-900 text-slate-600 border-slate-800"
                                                        : "bg-slate-800 text-slate-300 border-slate-600 group-hover:bg-slate-700"
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-base md:text-lg transition-colors flex items-center gap-2",
                                                isCompleted ? "text-emerald-300" : isActive ? "text-white" : isLocked ? "text-slate-600" : "text-slate-300"
                                            )}>
                                                {parseTextWithTranslations(module.title)}
                                                {isCompleted && (
                                                    <span className="text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded font-mono">COMPLETO</span>
                                                )}
                                            </h3>
                                            {module.subtitle && (
                                                <p className="text-sm text-slate-500 hidden md:block">
                                                    {parseTextWithTranslations(module.subtitle)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-slate-600" />
                                        ) : isCompleted && !isActive ? (
                                            <span className="text-xs text-emerald-400/60 font-mono hidden md:block">Clique para rever</span>
                                        ) : (
                                            <div className={cn(
                                                "flex items-center gap-2 text-xs md:text-sm font-mono tracking-widest transition-opacity",
                                                isActive ? "opacity-100 text-cyan-400" : "opacity-0"
                                            )}>
                                                <span className="hidden md:inline">ABRINDO</span>
                                                <span className="md:hidden">ABRIR</span>
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                        <ChevronDown className={cn(
                                            "w-5 h-5 transition-transform duration-300",
                                            isActive ? "rotate-180 text-cyan-500" : isCompleted ? "text-emerald-500" : "text-slate-500"
                                        )} />
                                    </div>
                                </button>

                                {/* Module Content (Drawer) */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-4 pb-8 md:px-20 md:pb-12 border-t border-white/5 relative">
                                                {/* Decorative Sidebar Line */}
                                                <div className={cn(
                                                    "absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b hidden md:block",
                                                    isCompleted ? "from-emerald-500/20 to-transparent" : "from-cyan-500/20 to-transparent"
                                                )} />

                                                <div className="pt-8 space-y-2">
                                                    {module.blocks.map((block, idx) => (
                                                        <RenderBlock key={idx} block={block} moduleId={module.id} onGameComplete={handleGameComplete} />
                                                    ))}
                                                </div>

                                                {/* Module Completion Action */}
                                                <div className="mt-12 flex justify-between items-center">
                                                    {isCompleted ? (
                                                        <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            Módulo concluído
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    )}

                                                    {!isCompleted ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.blur();
                                                                handleStartCompletionFlow(module.id, module.title, index);
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-2 px-6 py-3 rounded font-bold transition-all group",
                                                                blockedByMaze
                                                                    ? "bg-amber-700/80 hover:bg-amber-600 text-white"
                                                                    : "bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]"
                                                            )}
                                                        >
                                                            <span>{blockedByMaze ? "Concluir (faça o desafio)" : "Concluir e avançar"}</span>
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    ) : index < data.modules!.length - 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.blur();
                                                                handleModuleClick(
                                                                    data.modules![index + 1].id,
                                                                    data.modules![index + 1].status,
                                                                    index + 1
                                                                );
                                                            }}
                                                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded font-bold transition-all"
                                                        >
                                                            <span>Ir para próxima parte</span>
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    ) : null}
                                                </div>

                                                {mazeHintByModule[module.id] && !isCompleted && (
                                                    <p className="mt-4 text-cyan-300 text-sm">
                                                        {mazeHintByModule[module.id]}
                                                    </p>
                                                )}

                                                {challengeTarget?.moduleId === module.id && !isCompleted && (
                                                    <div className="mt-6 rounded-xl border border-cyan-500/30 bg-slate-900/60 p-4 md:p-6">
                                                        <div className="flex items-center justify-between gap-4 mb-4">
                                                            <h4 className="text-cyan-300 font-semibold text-sm md:text-base">
                                                                Desafio rápido (2 perguntas Sim/Não)
                                                            </h4>
                                                            {(() => {
                                                                const leftMs = (challengeLockUntil[module.id] ?? 0) - clockNow;
                                                                if (leftMs <= 0) return null;
                                                                return (
                                                                    <span className="text-amber-300 text-xs md:text-sm">
                                                                        Nova tentativa em {Math.ceil(leftMs / 1000)}s
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>

                                                        <div className="space-y-4">
                                                            {(challengeQuestions[module.id] ?? []).map((q, qIndex) => {
                                                                const answerValue = challengeAnswers[module.id]?.[qIndex] ?? null;
                                                                return (
                                                                    <div key={`${module.id}-q-${qIndex}`} className="rounded-lg border border-slate-700/70 bg-slate-950/50 p-3">
                                                                        <p className="text-slate-200 text-sm mb-3">{q.question}</p>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleChallengeAnswer(module.id, qIndex, true)}
                                                                                className={cn(
                                                                                    "px-4 py-2 rounded text-sm border transition",
                                                                                    answerValue === true
                                                                                        ? "bg-emerald-600/30 border-emerald-400/50 text-emerald-200"
                                                                                        : "bg-slate-800 border-slate-600 text-slate-300 hover:border-emerald-400/40"
                                                                                )}
                                                                            >
                                                                                Sim
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleChallengeAnswer(module.id, qIndex, false)}
                                                                                className={cn(
                                                                                    "px-4 py-2 rounded text-sm border transition",
                                                                                    answerValue === false
                                                                                        ? "bg-red-600/25 border-red-400/50 text-red-200"
                                                                                        : "bg-slate-800 border-slate-600 text-slate-300 hover:border-red-400/40"
                                                                                )}
                                                                            >
                                                                                Não
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {challengeFeedback[module.id] === "error" && (
                                                            <p className="mt-4 text-red-300 text-sm">
                                                                Respostas incorretas. Revise o módulo e tente novamente após 30 segundos.
                                                            </p>
                                                        )}

                                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleChallengeSubmit(module.id, module.title, index)}
                                                                disabled={
                                                                    (challengeLockUntil[module.id] ?? 0) > clockNow ||
                                                                    (challengeAnswers[module.id] ?? [null, null]).some((v) => v === null)
                                                                }
                                                                className="px-4 py-2 rounded bg-cyan-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500 transition"
                                                            >
                                                                Enviar respostas
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setChallengeTarget(null)}
                                                                className="px-4 py-2 rounded border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition"
                                                            >
                                                                Fechar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
