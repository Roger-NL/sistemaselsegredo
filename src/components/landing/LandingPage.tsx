"use client";

import { TubesBackground } from "@/components/ui/neon-flow";
import { HeroSection } from "./HeroSection";
import { MethodSection } from "./MethodSection";
import { SpecialtiesSection } from "./SpecialtiesSection";
import { ResultsSection } from "./ResultsSection";
import { CtaSection } from "./CtaSection";
import { RanksSection } from "./RanksSection";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const handleLogin = () => {
        router.push(isAuthenticated ? "/dashboard" : "/login");
    };

    return (
        <TubesBackground className="overflow-x-hidden">
            {/* Nav transparente */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 pointer-events-none">
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="font-serif text-xl tracking-widest font-bold pointer-events-auto cursor-pointer text-white hover:text-[#EEF4D4] transition-colors"
                >
                    O SEGREDO
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <button
                        onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })}
                        className="hidden md:block px-4 py-2 text-white/60 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Método
                    </button>
                    <button
                        onClick={handleLogin}
                        className="px-6 py-2 border border-white/20 rounded-full font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all bg-black/30 backdrop-blur-md"
                    >
                        {isLoading ? "..." : (isAuthenticated ? "Dashboard" : "Login")}
                    </button>
                </div>
            </nav>

            {/* Seções */}
            <HeroSection />
            <MethodSection />
            <SpecialtiesSection />
            <ResultsSection />
            <RanksSection />
            <CtaSection />

            {/* Footer */}
            <footer className="py-16 border-t border-white/5 bg-black relative z-10">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="font-serif text-2xl text-white mb-2">O SEGREDO</div>
                            <p className="text-white/30 font-mono text-xs">
                                Transformando passageiros em viajantes de elite desde 2023
                            </p>
                        </div>

                        <div className="flex items-center gap-8 text-white/40 text-xs font-mono">
                            <a href="#" className="hover:text-white transition-colors">Termos</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">Suporte</a>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/20 font-mono text-xs">
                            © 2026 SISTEMA O SEGREDO. TODOS OS DIREITOS RESERVADOS.
                        </p>
                    </div>
                </div>
            </footer>
        </TubesBackground>
    );
}