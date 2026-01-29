"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        
        // Simula login
        await login(email);
        
        // Transição "Matrix" - Fade to Black
        // O redirecionamento acontece dentro do componente de transição ou após o delay
        setTimeout(() => {
            router.push("/dashboard");
        }, 500);
    };

    return (
        <div className="flex min-h-screen">
            {/* Lado Esquerdo - Arte/Conceito */}
            <div className="hidden lg:flex w-1/2 bg-slate-50 border-r border-slate-200 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-grid-lg text-slate-900" />
                <div className="z-10 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-6">
                        ES English Academy
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Abandon the traditional classroom. Enter the operational command center designed for rapid fluency acquisition.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active Methodology
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Real-world Scenarios
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Global Certification
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Elite Community
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Access Command
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                                    placeholder="agent@esacademy.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-slate-900 hover:text-slate-700">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </div>
                        
                        <div className="text-center text-xs text-slate-500 mt-4">
                             (Mock Mode: Use any email/password)
                        </div>
                    </form>
                </div>
            </div>

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
                            ESTABLISHING SECURE CONNECTION...
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
