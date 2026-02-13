"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuthBackground from "@/components/auth/AuthConcept";

export default function CadastroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Preencha todos os campos");
            return;
        }

        setIsSubmitting(true);

        const result = await register(name, email, password, confirmPassword);

        if (result.success) {
            setTimeout(() => {
                router.push("/perfil");
            }, 500);
        } else {
            setError(result.error || "Erro ao criar conta");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] p-4">

            {/* Ambient Background */}
            <AuthBackground />

            {/* Back to landing */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-30 text-xs tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-mono uppercase"
            >
                ← Voltar
            </Link>

            {/* Glassmorphism Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                        Iniciar Identidade
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Crie uma credencial segura para a rede acadêmica.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-xs font-mono">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Nome do Agente
                            </label>
                            <div className="relative group">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="NOME COMPLETO"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Email de Contato
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="nome@exemplo.com"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Definir Senha
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Confirmar Senha
                            </label>
                            <div className="relative group">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-lg bg-white text-black px-4 py-3 text-sm font-bold hover:bg-slate-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    CRIANDO PERFIL...
                                </span>
                            ) : (
                                "ESTABELECER IDENTIDADE"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-6">
                        JÁ POSSUI ACESSO?{" "}
                        <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                            ACESSO AO COMANDO
                        </Link>
                    </div>
                </form>
            </motion.div>


            {/* Transição de Saída (Fade to Black) */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white font-mono text-xl tracking-widest"
                        >
                            INITIALIZING AGENT PROFILE...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
