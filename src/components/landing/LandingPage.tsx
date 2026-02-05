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
import { LandingThemeProvider, useLandingTheme } from "@/context/LandingThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

// Theme Toggle Button
function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useLandingTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
                w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-all
                ${isDark
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border-black/20 text-black hover:bg-black/20"
                }
            `}
            title={isDark ? "Modo Claro" : "Modo Escuro"}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
    );
}

// Inner Content with Theme Access
function LandingContent() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { isDark, isLight } = useLandingTheme();

    const handleLogin = () => {
        router.push(isAuthenticated ? "/dashboard" : "/login");
    };

    return (
        <div className={`overflow-x-hidden transition-colors duration-500 ${isLight ? "bg-white" : ""}`}>
            {/* Wrapper condicional - só usa TubesBackground no dark mode */}
            {isDark ? (
                <TubesBackground className="overflow-x-hidden">
                    <LandingInner isDark={isDark} isLight={isLight} handleLogin={handleLogin} isAuthenticated={isAuthenticated} isLoading={isLoading} />
                </TubesBackground>
            ) : (
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                    <LandingInner isDark={isDark} isLight={isLight} handleLogin={handleLogin} isAuthenticated={isAuthenticated} isLoading={isLoading} />
                </div>
            )}
        </div>
    );
}

// Landing Inner Component
function LandingInner({ isDark, isLight, handleLogin, isAuthenticated, isLoading }: {
    isDark: boolean;
    isLight: boolean;
    handleLogin: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}) {
    return (
        <>
            {/* Nav transparente */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 pointer-events-none">
                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`font-serif text-xl tracking-widest font-bold pointer-events-auto cursor-pointer transition-colors
                        ${isDark ? "text-white hover:text-[#EEF4D4]" : "text-gray-900 hover:text-violet-600"}
                    `}
                >
                    ES ENGLISH ACADEMY
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    <button
                        onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })}
                        className={`hidden md:block px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors
                            ${isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900"}
                        `}
                    >
                        Método
                    </button>
                    <button
                        onClick={handleLogin}
                        className={`px-6 py-2 border rounded-full font-mono text-xs uppercase tracking-widest transition-all backdrop-blur-md
                            ${isDark
                                ? "border-white/20 text-white bg-black/30 hover:bg-white hover:text-black"
                                : "border-gray-300 text-gray-900 bg-white/80 hover:bg-gray-900 hover:text-white"
                            }
                        `}
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
            <footer className={`py-16 border-t relative z-10 transition-colors duration-500
                ${isDark ? "border-white/5 bg-black" : "border-gray-200 bg-gray-50"}
            `}>
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className={`font-serif text-2xl mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                ES ENGLISH ACADEMY
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
                            © 2026 ES ENGLISH ACADEMY. TODOS OS DIREITOS RESERVADOS.
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