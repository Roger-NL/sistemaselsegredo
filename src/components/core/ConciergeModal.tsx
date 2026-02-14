"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, BellRing, Zap, X } from "lucide-react";

// ============================================================================
// CONCIERGE MODAL — WhatsApp Capture
// Trigger 1: Após Login (5% OFF)
// Trigger 2: Após completar Pilar 1 (6% OFF - Última chamada)
// ============================================================================

const STORAGE_KEY_CONCIERGE = "es-concierge-v1";
const STORAGE_KEY_DISMISSED_LOGIN = "es-concierge-dismissed-login";
const STORAGE_KEY_DISMISSED_PILAR = "es-concierge-dismissed-pilar";

export type CommsModalTrigger = "login" | "pilar1";

interface ConciergeModalProps {
    trigger: CommsModalTrigger;
    isOpen: boolean;
    onClose: () => void;
    onConnect?: (phone: string) => void;
}

export function useConciergeModal(trigger: CommsModalTrigger) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Se já conectou WhatsApp, nunca mais mostra
        const alreadyConnected = localStorage.getItem(STORAGE_KEY_CONCIERGE);
        if (alreadyConnected) return;

        // Verifica se já dispensou para este trigger
        if (trigger === "login") {
            const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED_LOGIN);
            if (dismissed) return;
            // Mostra com um pequeno delay após login
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }

        if (trigger === "pilar1") {
            const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED_PILAR);
            if (dismissed) return;
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    const close = () => {
        setIsOpen(false);
        if (trigger === "login") {
            localStorage.setItem(STORAGE_KEY_DISMISSED_LOGIN, "true");
        } else if (trigger === "pilar1") {
            localStorage.setItem(STORAGE_KEY_DISMISSED_PILAR, "true");
        }
    };

    const connect = (phone: string) => {
        localStorage.setItem(STORAGE_KEY_CONCIERGE, phone);
        setIsOpen(false);
    };

    return { isOpen, close, connect };
}

// Função auxiliar para detecção de bandeira baseada no DDI
function getFlagEmoji(phone: string): string {
    const clean = phone.replace(/\s/g, '');
    if (clean.startsWith('+55')) return '🇧🇷';
    if (clean.startsWith('+1')) return '🇺🇸';
    if (clean.startsWith('+351')) return '🇵🇹';
    if (clean.startsWith('+44')) return '🇬🇧';
    if (clean.startsWith('+34')) return '🇪🇸';
    if (clean.startsWith('+33')) return '🇫🇷';
    if (clean.startsWith('+49')) return '🇩🇪';
    if (clean.startsWith('+39')) return '🇮🇹';
    if (clean.startsWith('+')) return '🌐';
    return '🏳️';
}

export default function ConciergeModal({
    trigger,
    isOpen,
    onClose,
    onConnect,
}: ConciergeModalProps) {
    // Formatter utility (Re duplicated for simplicity in component isolation)
    const formatPhoneNumber = (value: string) => {
        if (!value) return "";
        let raw = value.replace(/[^\d+]/g, '');
        if (raw.startsWith('55') && !raw.startsWith('+')) raw = '+' + raw;

        if (raw.startsWith('+55')) {
            const ddd = raw.slice(3, 5);
            const part1 = raw.slice(5, 10);
            const part2 = raw.slice(10, 14);

            let formatted = '+55';
            if (ddd) formatted += ` (${ddd}`;
            if (ddd.length === 2) formatted += `) `;
            if (part1) formatted += `${part1}`;
            if (part1.length === 5) formatted += `-`;
            if (part2) formatted += `${part2}`;
            return formatted;
        }
        return raw;
    };

    // Default start with +55 for Brazil preference
    const [phone, setPhone] = useState("+55 ");
    const [flag, setFlag] = useState("🇧🇷");
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState("");

    const isLoginTrigger = trigger === "login";
    const discountPercent = isLoginTrigger ? 5 : 6;

    const handleConnect = () => {
        // Validação mínima para internacional: pelo menos + e alguns dígitos
        if (phone.length < 8 || !phone.includes('+')) {
            setError("Número inválido. Inclua o código do país (ex: +55)");
            return;
        }

        const digits = phone.replace(/[^\d+]/g, ""); // Mantém apenas números e +

        setError("");
        setIsConnecting(true);

        // Simula conexão
        setTimeout(() => {
            setIsConnecting(false);
            onConnect?.(digits);
        }, 1500);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Allow deletion
        if (val.length < phone.length) {
            setPhone(val);
            setFlag(getFlagEmoji(val));
            return;
        }

        const formatted = formatPhoneNumber(val);
        setPhone(formatted);
        setFlag(getFlagEmoji(formatted));
        if (error) setError("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} // smooth easeOutQuint
                        className="relative w-full max-w-[420px] bg-[#09090b] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Status Bar Top */}
                        <div className={`h-1 w-full ${isLoginTrigger ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                        {/* Close button - Minimal (Hidden on Login Trigger per requirements) */}
                        {!isLoginTrigger && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-20 p-2"
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        )}

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex flex-col items-start space-y-4 mb-8">
                                <span className={`text-[10px] font-mono font-medium tracking-widest uppercase ${isLoginTrigger ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {isLoginTrigger ? "● Sincronização Pendente" : "● Última Chamada"}
                                </span>

                                <div>
                                    <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                                        {isLoginTrigger
                                            ? "Conexão Necessária"
                                            : "Atualize seus Dados"
                                        }
                                    </h2>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        {isLoginTrigger
                                            ? "Para garantir sua segurança e acesso ao suporte, vincule seu WhatsApp oficial."
                                            : "Detectamos progresso em sua conta. Conecte-se para desbloquear benefícios."
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Benefits - Clean List */}
                            <div className="space-y-5 mb-8">
                                <div className="flex items-start gap-4 group">
                                    <BellRing size={18} className="text-neutral-500 group-hover:text-white transition-colors mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Notificações em Tempo Real</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Receba validações de missões instantaneamente.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <ShieldCheck size={18} className="text-neutral-500 group-hover:text-white transition-colors mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Segurança da Conta</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Recuperação de acesso simplificada.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <Zap size={18} className="text-neutral-500 group-hover:text-white transition-colors mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Suporte Prioritário</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">Canal direto para resolver bloqueios.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px w-full bg-white/5 mb-6" />

                            {/* Bonus Text - Minimal */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isLoginTrigger ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    <span className="text-xs font-bold">%</span>
                                </div>
                                <p className="text-sm text-neutral-300">
                                    Conecte agora e ganhe <span className={`font-semibold ${isLoginTrigger ? 'text-emerald-400' : 'text-amber-400'}`}>{discountPercent}% de desconto</span> na certificação.
                                </p>
                            </div>

                            {/* Input Field - Clean */}
                            <div className="space-y-3 mb-6">
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="+55 (00) 00000-0000"
                                        className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 focus:bg-black transition-all font-mono"
                                    />
                                    {/* Flag indicator - Dynamic */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xl select-none">
                                        {flag}
                                    </div>
                                    {/* Icon indicator */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-emerald-500 font-mono tracking-wider">PRIORITY</span>
                                    </div>
                                </div>
                                {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="w-full bg-white text-black h-11 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isConnecting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            CONECTANDO...
                                        </span>
                                    ) : (
                                        "CONECTAR WHATSAPP"
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full text-xs text-neutral-500 hover:text-neutral-400 transition-colors py-2 uppercase tracking-wider"
                                >
                                    Adicionar depois e perder benefícios
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
