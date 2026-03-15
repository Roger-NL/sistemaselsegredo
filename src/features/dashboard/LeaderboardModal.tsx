"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, Zap } from "lucide-react";
import { getLeaderboard, LeaderboardUser } from "@/lib/leaderboard/service";
import { useAuth } from "@/context/AuthContext";
import { ModalShell } from "@/components/ui/modal-shell";

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        if (isOpen) {
            getLeaderboard(20).then((data) => {
                setUsers(data);
            });
        }
    }, [isOpen]);

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            panelClassName="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col z-[10000] pointer-events-auto"
            backdropClassName="cursor-pointer"
            zIndexClassName="z-[9999]"
        >
                        {/* ABSOLUTE CLOSE BUTTON (To guarantee clickability) */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClose();
                            }}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all cursor-pointer z-50 pointer-events-auto"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] pr-12"> {/* pr-12 to avoid text under button */}
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-orange-400" />
                                <div>
                                    Ranking Global
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-normal mt-0.5">
                                        Top Sequências de Estudo
                                    </p>
                                </div>
                            </h2>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-2 custom-scrollbar">
                            {users.length === 0 ? (
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
        </ModalShell>
    );
}
