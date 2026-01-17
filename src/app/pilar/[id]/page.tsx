import Link from "next/link";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { PILLARS } from "@/data/curriculum";
import { notFound } from "next/navigation";

// ============================================================================
// PILAR PAGE (SALA DE AULA)
// Onde o conteúdo acontece: player de áudio + área de leitura
// ============================================================================

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PilarPage({ params }: PageProps) {
    const { id } = await params;
    const pillarIndex = parseInt(id) - 1;
    const pillar = PILLARS[pillarIndex];

    if (!pillar) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            {/* Header fixo */}
            <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 backdrop-blur-sm bg-black/50 border-b border-zinc-800">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold">{pillar.title}</h1>
                        <p className="text-xs text-zinc-500">{pillar.description}</p>
                    </div>
                </div>
            </header>

            {/* Conteúdo */}
            <div className="pt-24 pb-32 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Player de Áudio Placeholder */}
                    <section className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex items-center gap-4">
                            <button className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-colors">
                                <Play className="w-6 h-6 text-black ml-1" />
                            </button>
                            <div className="flex-1">
                                <h3 className="font-medium text-white mb-1">Áudio da Aula</h3>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-amber-500 rounded-full" />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">0:00 / --:--</p>
                            </div>
                        </div>
                    </section>

                    {/* Área de Leitura Placeholder */}
                    <section className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-6 text-zinc-400">
                            <BookOpen className="w-5 h-5" />
                            <span className="text-sm font-medium">Material de Leitura</span>
                        </div>

                        <article className="prose prose-invert prose-zinc max-w-none">
                            <h2>{pillar.title}</h2>
                            <p className="text-zinc-400">
                                O conteúdo deste pilar será carregado aqui. Este é um placeholder para
                                demonstrar a estrutura da página de sala de aula.
                            </p>
                            <p className="text-zinc-500">
                                Aqui você encontrará textos, explicações e exemplos práticos para
                                dominar este módulo do curso.
                            </p>
                        </article>
                    </section>
                </div>
            </div>

            {/* Footer fixo com botão de ação */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-black/80 border-t border-zinc-800">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href={`/quiz/${id}`}
                        className="block w-full text-center py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Ir para o Desafio →
                    </Link>
                </div>
            </footer>
        </main>
    );
}
