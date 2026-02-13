"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { getRank } from "@/utils/ranks";

import { useAuth } from "@/context/AuthContext";

interface DashboardNavProps {
    studentName?: string;
    studentStreak?: number;
}

export function DashboardNav({ studentName = "Aluno", studentStreak = 0 }: DashboardNavProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const { getCompletedCount, getGlobalProgress } = useProgress();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const completedCount = getCompletedCount();
    const currentRank = getRank(completedCount);
    const globalProgress = getGlobalProgress();

    // Mock streak data
    // const currentStreak = 7;
    const currentStreak = studentStreak;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
            {/* Glass Background Bar */}
            <div className="w-full backdrop-blur-xl bg-black/60 border-b border-white/10">

                {/* Mobile Layout (< md) */}
                <div className="md:hidden px-3 py-2">
                    {/* Row 1: Logo + Name + Streak */}
                    <div className="flex items-center justify-between gap-2">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-baseline gap-1 hover:opacity-80 transition-opacity"
                        >
                            <span className="text-sm font-bold text-[#EEF4D4]">ES</span>
                            <span className="text-xs text-white/60">Academy</span>
                        </button>

                        {/* Student Name */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/10"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-white/80 max-w-[80px] truncate">{studentName.split(' ')[0]}</span>
                            <svg className={`w-3 h-3 text-white/60 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Streak Badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                            <span className="text-orange-400 text-xs font-bold">{currentStreak}</span>
                            <span className="text-[10px]">🔥</span>
                        </div>

                        {/* Rank Badge */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#EEF4D4]/10 border border-[#EEF4D4]/20">
                            <span className="text-[#EEF4D4] text-[10px] font-bold truncate max-w-[50px]">{currentRank}</span>
                        </div>
                    </div>

                    {/* Row 2: Progress + Actions */}
                    <div className="flex items-center gap-2 mt-2">
                        {/* Progress Bar */}
                        <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-[#EEF4D4] rounded-full"
                                    style={{ width: `${globalProgress}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-[#EEF4D4] font-mono">{globalProgress}%</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <button
                                onClick={() => console.log("Ranking")}
                                className="p-2 rounded-full bg-white/10 text-violet-400 hover:bg-white/20"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-3 right-3 mt-1 py-2 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
                            <button
                                onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }}
                                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                            >
                                👤 Meu Perfil
                            </button>
                            <button
                                onClick={() => { setIsMenuOpen(false); router.push('/configuracoes'); }}
                                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                            >
                                ⚙️ Configurações
                            </button>
                            <div className="my-2 border-t border-white/10" />
                            {/* Mini Leaderboard in Dropdown */}
                            <div className="px-4 py-2">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">🏆 Top Streaks</span>
                                <div className="mt-2 space-y-1">
                                    {[
                                        { name: "Maria", streak: 45 },
                                        { name: "João", streak: 32 },
                                        { name: "Você", streak: currentStreak, isYou: true },
                                    ].map((u, i) => (
                                        <div key={i} className={`flex items-center justify-between text-xs ${u.isYou ? 'text-orange-400' : 'text-white/50'}`}>
                                            <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🔥'} {u.name}</span>
                                            <span>{u.streak}d</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="my-2 border-t border-white/10" />
                            <button
                                onClick={() => { setIsMenuOpen(false); logout(); }}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                            >
                                🚪 Sair
                            </button>
                        </div>
                    )}
                </div>

                {/* Desktop Layout (>= md) */}
                <div className="hidden md:flex max-w-7xl mx-auto px-4 py-3 items-center justify-between gap-4">

                    {/* Left Section - Logo + Student Name */}
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex flex-col hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <h1 className="text-lg font-bold tracking-tight text-white">
                                <span className="text-[#EEF4D4]">ES</span> Academy
                            </h1>
                            <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">System V4.0</span>
                        </button>

                        <div className="w-px h-8 bg-white/10" />

                        {/* Student Name */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bean-button bean-button-primary group"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-medium text-sm">{studentName}</span>
                                <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
                                    <button onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }} className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10">👤 Meu Perfil</button>
                                    <button onClick={() => { setIsMenuOpen(false); router.push('/configuracoes'); }} className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10">⚙️ Configurações</button>
                                    <div className="my-2 border-t border-white/10" />
                                    <button onClick={() => { setIsMenuOpen(false); logout(); }} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">🚪 Sair</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Section - Progress */}
                    <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-md">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Progresso</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 via-[#EEF4D4] to-emerald-400 rounded-full transition-all"
                                style={{ width: `${globalProgress}%` }}
                            />
                        </div>
                        <span className="text-xs text-[#EEF4D4] font-mono font-bold">{globalProgress}%</span>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="bean-button bean-button-secondary">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Voltar</span>
                        </button>

                        <button onClick={() => console.log("Ranking")} className="bean-button bean-button-accent">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="hidden sm:inline">Ranking</span>
                        </button>

                        <div className="bean-button bean-button-rank">
                            <span className="text-[9px] uppercase tracking-wider text-[#EEF4D4]/60">Patente</span>
                            <span className="font-bold text-xs text-[#EEF4D4]">{currentRank}</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
