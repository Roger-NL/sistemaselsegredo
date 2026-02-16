"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { getLeaderboard, LeaderboardUser } from "@/lib/leaderboard";
import { useAuth } from "@/context/AuthContext";

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getLeaderboard(20).then((data) => {
                setUsers(data);
                setLoading(false);
            });
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-orange-400" />
                                    Ranking Global
                                </h2>
                                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
                                Top Sequências de Estudo (Streak)
                            </p>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="p-8 text-center text-white/40 animate-pulse text-sm font-mono">
                                    Sincronizando dados...
                                </div>
                            ) : users.length === 0 ? (
                                <div className="p-8 text-center text-white/40 text-sm">
                                    Nenhum registro encontrado.
                                </div>
                            ) : (
                                users.map((u, index) => {
                                    const isMe = user?.id === u.id;
                                    const rank = index + 1;
                                    let rankColor = "text-white/40 bg-white/5 border-white/5";
                                    let icon = <span className="text-[10px] opacity-50">#{rank}</span>;

                                    if (rank === 1) {
                                        rankColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                                        icon = <span className="text-sm">🥇</span>;
                                    } else if (rank === 2) {
                                        rankColor = "text-slate-300 bg-slate-300/10 border-slate-300/20";
                                        icon = <span className="text-sm">🥈</span>;
                                    } else if (rank === 3) {
                                        rankColor = "text-orange-300 bg-orange-300/10 border-orange-300/20";
                                        icon = <span className="text-sm">🥉</span>;
                                    }

                                    return (
                                        <div
                                            key={u.id}
                                            className={`
                                                flex items-center gap-4 p-3 rounded-xl border transition-colors
                                                ${isMe
                                                    ? 'bg-orange-500/10 border-orange-500/30'
                                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {/* Rank Badge */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold ${rankColor}`}>
                                                {icon}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium truncate ${isMe ? 'text-orange-400' : 'text-white/90'}`}>
                                                        {isMe ? "Você" : u.name}
                                                    </span>
                                                    {isMe && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20 font-bold uppercase tracking-wide">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Streak Count */}
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-lg font-bold font-mono ${isMe ? 'text-orange-400' : 'text-white'}`}>
                                                        {u.streak}
                                                    </span>
                                                    <Zap className={`w-3 h-3 ${isMe ? 'text-orange-400' : 'text-white/40'}`} fill="currentColor" />
                                                </div>
                                                <span className="text-[9px] text-white/30 uppercase tracking-wider">Dias</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer - My Position if not in top 20? */}
                        {/* user && !users.find(u => u.id === user.id) && ... handle later if needed */}

                        <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center">
                            <p className="text-[10px] text-white/30 leading-relaxed max-w-xs mx-auto">
                                O ranking é atualizado em tempo real com base na constância (streak) dos agentes em campo.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
