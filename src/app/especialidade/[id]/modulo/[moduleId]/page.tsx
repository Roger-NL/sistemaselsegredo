"use client";

import { useRouter, useParams } from "next/navigation";
import { TubesBackground } from "@/components/ui/neon-flow";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard";
import { ArrowLeft, CheckCircle, PlayCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function ModulePage() {
    const router = useRouter();
    const params = useParams();
    const specId = params.id as string;
    const moduleId = params.moduleId as string;

    // Mock content based on ID - In real app, fetch from ID
    const moduleTitle = `Módulo ${moduleId}`; // Placeholder
    const isCompleted = false; // Placeholder state

    const handleComplete = () => {
        // Here we would save progress
        // For MVP, just go back
        router.push(`/especialidade/${specId}`);
    };

    return (
        <TubesBackground className="min-h-screen">
            <main className="min-h-screen w-full p-6 md:p-12 pointer-events-auto flex flex-col items-center">

                {/* Header Navigation */}
                <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push(`/especialidade/${specId}`)}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-sm">Voltar para Especialidade</span>
                    </button>
                    <span className="font-mono text-xs text-[#EEF4D4]/40 uppercase tracking-widest">
                        ES Academy / Mod {moduleId}
                    </span>
                </div>

                {/* Main Content Card */}
                <TacticalCard
                    systemId={`MOD-${moduleId.padStart(2, "0")}`}
                    status="LIVE"
                    variant="neon"
                    className="w-full max-w-4xl flex-1 flex flex-col"
                >
                    <div className="p-8 md:p-12 flex-1 flex flex-col">

                        {/* Title Section */}
                        <div className="mb-8 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded text-[10px] text-violet-400 font-mono uppercase tracking-wider">
                                    Módulo de Treinamento
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif text-[#EEF4D4] mb-4">
                                {moduleTitle}
                            </h1>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Este módulo foca no desenvolvimento de competências específicas para sua especialização.
                                Assista ao conteúdo e complete os exercícios.
                            </p>
                        </div>

                        {/* Content Placeholder */}
                        <div className="flex-1 space-y-6">
                            {/* Video Placeholder */}
                            <div className="aspect-video w-full bg-black/40 border border-white/10 rounded-lg flex items-center justify-center group cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center gap-4 relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-all">
                                        <PlayCircle className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Iniciar Aula</span>
                                </div>
                            </div>

                            {/* Resources List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/5 rounded flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                                    <FileText className="w-5 h-5 text-violet-400" />
                                    <div>
                                        <h3 className="text-[#EEF4D4] text-sm font-medium">Material de Apoio.pdf</h3>
                                        <p className="text-[10px] text-white/40 font-mono">2.4 MB • LEITURA OBRIGATÓRIA</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5 rounded flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                                    <FileText className="w-5 h-5 text-violet-400" />
                                    <div>
                                        <h3 className="text-[#EEF4D4] text-sm font-medium">Exercícios Práticos.pdf</h3>
                                        <p className="text-[10px] text-white/40 font-mono">1.1 MB • TAREFA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-end gap-4">
                            <TacticalButton
                                onClick={() => router.back()}
                                className="w-auto"
                            >
                                Voltar
                            </TacticalButton>
                            <TacticalButton
                                variant="success"
                                onClick={handleComplete}
                                className="w-auto"
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Concluir Módulo
                                </span>
                            </TacticalButton>
                        </div>

                    </div>
                </TacticalCard>
            </main>
        </TubesBackground>
    );
}
