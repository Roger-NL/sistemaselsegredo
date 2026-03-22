"use client";

import { TubesBackground } from "@/components/ui/neon-flow";
import { HeroSection } from "./HeroSection";
import { DifferentiatorsSection } from "./DifferentiatorsSection";
import { MethodSection } from "./MethodSection";
import { SpecialtiesSection } from "./SpecialtiesSection";
import { ResultsSection } from "./ResultsSection";
import { CtaSection } from "./CtaSection";
import { RanksSection } from "./RanksSection";
import { useRouter } from "next/navigation";
import { LandingThemeProvider } from "@/context/LandingThemeContext";
import { useEffect, useState } from "react";
import { FaqSection } from "./FaqSection";
import { ROUTES } from "@/lib/routes";

function hasSessionCookie() {
    if (typeof document === "undefined") return false;
    return document.cookie.split("; ").some((cookie) => cookie.startsWith("es_session_token="));
}

function useLandingSessionState() {
    const [state, setState] = useState({
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setState({
                isAuthenticated: hasSessionCookie(),
                isLoading: false,
            });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    return state;
}

// Inner Content with Theme Access - NOW ENFORCED DARK
function LandingContent() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useLandingSessionState();

    // Auto-redirect to dashboard if logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push(ROUTES.app.dashboard);
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="overflow-x-hidden bg-[#050505] text-white min-h-screen">
            <TubesBackground className="overflow-x-hidden">
                <LandingInner
                    isDark={true}
                    isAuthenticated={isAuthenticated}
                    isLoading={isLoading}
                />
            </TubesBackground>
        </div>
    );
}

// Inline CTA — uses the exact same button style as Hero
function InlineCta({ text, isDark, isAuthenticated }: {
    text: string;
    isDark: boolean;
    isAuthenticated: boolean;
}) {
    return (
        <div className={`py-8 md:py-10 flex flex-col items-center gap-4 px-4 transition-colors duration-500
            ${isDark ? "bg-black" : "bg-white"}
        `}>
            <p className={`font-mono text-xs md:text-sm text-center max-w-md
                ${isDark ? "text-white/40" : "text-gray-500"}
            `}>
                {text}
            </p>
            <a
                href={isAuthenticated ? ROUTES.app.dashboard : ROUTES.auth.signup}
                className="group relative px-8 py-3 bg-[#050505] text-white font-medium tracking-widest uppercase hover:bg-violet-950/10 transition-all transform active:scale-95 rounded-full overflow-hidden text-center shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] border border-violet-500/60 hover:border-violet-400 text-xs md:text-sm inline-block no-underline cursor-pointer"
            >
                {isAuthenticated ? "ACESSAR COCKPIT →" : "COMEÇAR AGORA →"}
            </a>
            <div className={`flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest
                ${isDark ? "text-white/20" : "text-gray-400"}
            `}>
                <span>✓ Pagamento Único</span>
                <span>✓ 7 dias de garantia</span>
            </div>
        </div>
    );
}

// Landing Inner Component
function LandingInner({ isDark, isAuthenticated, isLoading }: {
    isDark: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
}) {
    return (
        <>
            {/* Nav transparente */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:justify-end px-4 py-4 md:px-12 md:py-6 pointer-events-none">
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`[font-family:var(--font-inter)] text-sm md:text-[1.45rem] md:absolute md:left-1/2 md:-translate-x-1/2 tracking-[0.28em] font-semibold uppercase pointer-events-auto cursor-pointer transition-colors
                        ${isDark ? "text-white hover:text-[#EEF4D4]" : "text-gray-900 hover:text-violet-600"}
                    `}
                >
                    BASEDSPEAK
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">

                    <button
                        onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })}
                        className={`hidden md:block px-4 py-2 [font-family:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] transition-colors
                            ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}
                        `}
                    >
                        Método
                    </button>
                    <div className="rotatingGradient rounded-full p-[1px] shadow-[0_0_10px_rgba(139,92,246,0.2)] inline-block" style={{ '--r': '0deg' } as React.CSSProperties}>
                        <a
                            href={isAuthenticated ? ROUTES.app.dashboard : ROUTES.auth.login}
                            className={`px-5 py-2 sm:px-6 sm:py-2 rounded-full font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-all inline-block no-underline text-center cursor-pointer pointer-events-auto
                                ${isDark
                                    ? "text-white bg-[#050505] hover:bg-white/10"
                                    : "text-gray-900 bg-white hover:bg-gray-100"
                                }
                            `}
                        >
                            {isLoading ? "..." : (isAuthenticated ? "ENTRAR" : "LOGIN")}
                        </a>
                    </div>
                </div>
            </nav>

            {/* Seções com CTAs intercalados */}
            <HeroSection isAuthenticated={isAuthenticated} />
            <DifferentiatorsSection />

            <InlineCta
                text="Pilar 1 liberado gratuitamente. Prove que o método funciona antes de investir."
                isDark={isDark}
                isAuthenticated={isAuthenticated}
            />

            <MethodSection />
            <SpecialtiesSection />

            <InlineCta
                text="Sem videoaula. Você escreve, é corrigido, e só avança com aprovação humana."
                isDark={isDark}
                isAuthenticated={isAuthenticated}
            />

            <ResultsSection />
            <RanksSection />

            <InlineCta
                text="Mais de 1.800 brasileiros já destravaram o inglês com este sistema."
                isDark={isDark}
                isAuthenticated={isAuthenticated}
            />

            <FaqSection />
            <CtaSection isAuthenticated={isAuthenticated} />

            {/* Footer */}
            <footer className={`py-16 border-t relative z-10 transition-colors duration-500
                ${isDark ? "border-white/5 bg-black" : "border-gray-200 bg-gray-50"}
            `}>
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className={`font-serif text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                BasedSpeak
                            </div>
                            <p className={`font-mono text-xs ${isDark ? "text-white/30" : "text-gray-500"}`}>
                                Metodologia de alta performance para adultos desde 2023
                            </p>
                        </div>

                        <div className={`flex items-center gap-8 text-xs font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>
                            <a href="#" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}>Termos</a>
                            <a href="#" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}>Privacidade</a>
                            <a href="#" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}>Suporte</a>
                        </div>
                    </div>

                    <div className={`mt-12 pt-8 border-t text-center ${isDark ? "border-white/5" : "border-gray-200"}`}>
                        <p className={`font-mono text-xs ${isDark ? "text-white/20" : "text-gray-400"}`}>
                            © 2026 BASEDSPEAK. TODOS OS DIREITOS RESERVADOS.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default function LandingPage() {
    return (
        <LandingThemeProvider>
            <LandingContent />
        </LandingThemeProvider>
    );
}
