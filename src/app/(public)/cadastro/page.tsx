"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuthBackground from "@/components/auth/AuthBackground";

export default function CadastroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
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
                        Criar Conta
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Preencha seus dados para começar.
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
                                Nome Completo
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
                                    placeholder="Seu nome completo"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                E-mail
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
                                    placeholder="seu@email.com"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Senha
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

                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                setIsSubmitting(true);
                                const result = await loginWithGoogle();
                                if (result.success) {
                                    // Redirect appropriately
                                    const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];
                                    const target = result.user && ADMIN_EMAILS.includes(result.user.email)
                                        ? "/admin/dashboard"
                                        : "/perfil"; // Different redirect for registration? Or dashboard? Let's use /perfil like the form submit does.
                                    router.push(target);
                                } else {
                                    setError(result.error || "Erro ao cadastrar com Google");
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-all duration-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            CADASTRAR COM GOOGLE
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase tracking-widest">Ou email</span>
                            <div className="flex-grow border-t border-white/10"></div>
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
                                    CRIANDO CONTA...
                                </span>
                            ) : (
                                "CRIAR CONTA"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-6">
                        JÁ TEM UMA CONTA?{" "}
                        <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                            FAZER LOGIN
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
                            CRIANDO CONTA...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
