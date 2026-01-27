"use client";

import { useParams, useRouter } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { PLANETS } from "@/data/curriculum";
import { TubesBackground } from "@/components/ui/neon-flow";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle, Target, Activity, Map, Cpu, Briefcase, Plane } from "lucide-react";

// Conteúdo mockado por especialidade (depois será substituído por dados reais)
const SPECIALIZATION_CONTENT: Record<string, {
    modules: { title: string; description: string; completed: boolean }[];
    description: string;
}> = {
    "spec-tech": {
        description: "Domine o inglês técnico para desenvolvimento de software, documentação e comunicação em equipes internacionais.",
        modules: [
            { title: "Technical Vocabulary", description: "Terminologia essencial de programação e desenvolvimento", completed: false },
            { title: "Code Reviews", description: "Como comunicar feedback técnico de forma clara", completed: false },
            { title: "Documentation", description: "Escrita de documentação técnica em inglês", completed: false },
            { title: "Meetings & Standups", description: "Participação efetiva em reuniões ágeis", completed: false },
            { title: "Interview Prep", description: "Preparação para entrevistas técnicas em inglês", completed: false },
        ]
    },
    "spec-academic": {
        description: "Prepare-se para mestrados internacionais com foco em escrita acadêmica e apresentações.",
        modules: [
            { title: "Academic Writing", description: "Estrutura de artigos e papers científicos", completed: false },
            { title: "Research Methods", description: "Vocabulário de metodologia de pesquisa", completed: false },
            { title: "Presentations", description: "Apresentar pesquisas em conferências", completed: false },
            { title: "Thesis Defense", description: "Preparação para defesa de dissertação", completed: false },
            { title: "Peer Review", description: "Participar de revisão por pares", completed: false },
        ]
    },
    "spec-finance": {
        description: "Inglês especializado para mercado financeiro, investimentos e economia global.",
        modules: [
            { title: "Financial Terms", description: "Vocabulário de finanças e investimentos", completed: false },
            { title: "Market Analysis", description: "Análise de mercado e relatórios", completed: false },
            { title: "Client Relations", description: "Comunicação com clientes internacionais", completed: false },
            { title: "Negotiations", description: "Negociações financeiras em inglês", completed: false },
            { title: "Reports & Presentations", description: "Relatórios e apresentações executivas", completed: false },
        ]
    },
    "spec-interview": {
        description: "Prepare-se para entrevistas de emprego internacionais com confiança.",
        modules: [
            { title: "Self Introduction", description: "Como se apresentar profissionalmente", completed: false },
            { title: "Behavioral Questions", description: "Responder perguntas comportamentais", completed: false },
            { title: "Salary Negotiation", description: "Negociar salário e benefícios", completed: false },
            { title: "Follow-up", description: "Emails de acompanhamento pós-entrevista", completed: false },
            { title: "Mock Interviews", description: "Prática com simulações reais", completed: false },
        ]
    },
    "spec-travel": {
        description: "Inglês prático para viagens internacionais e situações do dia a dia.",
        modules: [
            { title: "Airport & Immigration", description: "Navegando aeroportos e imigração", completed: false },
            { title: "Hotels & Accommodation", description: "Reservas e check-in/check-out", completed: false },
            { title: "Restaurants & Food", description: "Pedir comida e lidar com restaurantes", completed: false },
            { title: "Transportation", description: "Táxis, uber, metrô e ônibus", completed: false },
            { title: "Emergencies", description: "Lidar com emergências e imprevistos", completed: false },
        ]
    },
    "spec-business": {
        description: "Inglês corporativo para negócios, reuniões e comunicação empresarial.",
        modules: [
            { title: "Email Communication", description: "Escrita profissional de emails", completed: false },
            { title: "Meetings", description: "Conduzir e participar de reuniões", completed: false },
            { title: "Presentations", description: "Apresentações corporativas impactantes", completed: false },
            { title: "Negotiations", description: "Técnicas de negociação em inglês", completed: false },
            { title: "Networking", description: "Construir relacionamentos profissionais", completed: false },
        ]
    }
};

const SPEC_ICONS: Record<string, React.ReactNode> = {
    "spec-tech": <Cpu className="w-8 h-8" />,
    "spec-academic": <BookOpen className="w-8 h-8" />,
    "spec-finance": <Target className="w-8 h-8" />,
    "spec-interview": <Briefcase className="w-8 h-8" />,
    "spec-travel": <Plane className="w-8 h-8" />,
    "spec-business": <Activity className="w-8 h-8" />,
};

export default function EspecialidadePage() {
    const params = useParams();
    const router = useRouter();
    const { chosenSpecialization, getCurrentSpecialization } = useProgress();

    const specId = params.id as string;
    const spec = PLANETS.find(p => p.id === specId);
    const content = SPECIALIZATION_CONTENT[specId];

    // Calcula progresso (mockado por enquanto)
    const completedModules = content?.modules.filter(m => m.completed).length || 0;
    const totalModules = content?.modules.length || 1;
    const progressPercent = Math.round((completedModules / totalModules) * 100);

    if (!spec || !content) {
        return (
            <TubesBackground className="h-screen">
                <div className="h-screen flex items-center justify-center">
                    <p className="text-white/50">Especialidade não encontrada</p>
                </div>
            </TubesBackground>
        );
    }

    return (
        <TubesBackground className="min-h-screen">
            <main className="min-h-screen w-full p-6 md:p-12 pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12 relative z-50 pointer-events-auto">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-[#EEF4D4]/60 hover:text-[#EEF4D4] transition-colors font-mono text-sm px-4 py-2 border border-[#EEF4D4]/20 rounded hover:border-[#EEF4D4]/40 hover:bg-[#EEF4D4]/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Dashboard</span>
                    </button>

                    <div className="text-right">
                        <span className="text-[10px] text-violet-400 font-mono uppercase tracking-widest">Especialização Ativa</span>
                    </div>
                </div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <TacticalCard systemId={`SPEC-${specId.toUpperCase()}`} status="LIVE" variant="default">
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                                    {SPEC_ICONS[specId] || <Target className="w-8 h-8" />}
                                </div>

                                <div className="flex-1">
                                    <h1 className="text-3xl font-serif text-[#EEF4D4] mb-2">{spec.title}</h1>
                                    <p className="text-gray-400 font-mono text-sm mb-6">{content.description}</p>

                                    {/* Barra de Progresso */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-[#EEF4D4]/60">Progresso</span>
                                            <span className="text-violet-400">{progressPercent}%</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                            />
                                        </div>
                                        <p className="text-[12px] text-violet-400 font-mono mt-1">
                                            {completedModules}/{totalModules} concluídos ({progressPercent}%)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TacticalCard>
                </motion.div>

                {/* Módulos */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-[#EEF4D4] font-mono text-xs tracking-[0.3em] uppercase mb-6">
                        Módulos de Treinamento
                    </h2>

                    <div className="space-y-4">
                        {content.modules.map((module, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <TacticalCard
                                    systemId={`MOD-${String(index + 1).padStart(2, '0')}`}
                                    status={module.completed ? "SECURE" : "PROCESSING"}
                                    variant="default"
                                    hoverable
                                    className={`cursor-pointer transition-all duration-300 ${!module.completed ? "hover:shadow-[0_0_15px_rgba(238,244,212,0.1)] hover:border-[#EEF4D4]/30" : ""}`}
                                    onClick={() => router.push(`/especialidade/${specId}/modulo/${index + 1}`)}
                                >
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded flex items-center justify-center ${module.completed
                                                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                                                : "bg-white/5 border border-white/10 text-[#EEF4D4]/50"
                                                }`}>
                                                {module.completed ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <span className={`font-mono text-sm ${!module.completed ? "text-[#EEF4D4] drop-shadow-[0_0_5px_rgba(238,244,212,0.5)]" : ""}`}>{String(index + 1).padStart(2, '0')}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium ${module.completed ? "text-emerald-400" : "text-[#EEF4D4]"}`}>
                                                    {module.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-mono">{module.description}</p>
                                            </div>
                                        </div>

                                        <TacticalButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/especialidade/${specId}/modulo/${index + 1}`);
                                            }}
                                            variant={module.completed ? "default" : "neon"}
                                            className="text-xs"
                                        >
                                            {module.completed ? "Missão Cumprida" : "Iniciar Missão"}
                                        </TacticalButton>
                                    </div>
                                </TacticalCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="max-w-4xl mx-auto mt-12 flex justify-center gap-4 relative z-50 pointer-events-auto pb-12">
                    <button
                        onClick={() => router.push("/")}
                        className="px-8 py-3 font-mono text-sm text-[#EEF4D4] border border-[#EEF4D4]/30 rounded hover:bg-[#EEF4D4]/10 hover:border-[#EEF4D4]/50 transition-all"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </main>
        </TubesBackground>
    );
}
