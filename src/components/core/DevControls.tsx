"use client";

import { useProgress } from "@/context/ProgressContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Settings, ShieldAlert, CheckCheck, Eraser, FileX2, CreditCard, QrCode, ExternalLink } from "lucide-react";
import { PILLARS_CONTENT } from "@/data/pillars-content";

interface DevControlsProps {
    isAdmin: boolean;
}

export function DevControls({ isAdmin }: DevControlsProps) {
    const { user } = useAuth();
    const {
        setPillarLevel,
        resetProgress,
        completePillar,
        completeAllPillarModules,
        completedPillarModules,
        setPillarModuleCompletion,
        completePillarModulesForPillar,
        clearPillarModulesForPillar,
        clearAllPillarModules,
        clearCurrentUserExams,
    } = useProgress();
    const [isOpen, setIsOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [selectedPillar, setSelectedPillar] = useState(1);
    const [testCpf, setTestCpf] = useState("12345678909");
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

    if (!isAdmin) return null;

    const handleCompleteAll = () => {
        // Completa todos os 9 pilares
        for (let i = 1; i <= 9; i++) {
            completePillar(i);
        }
    };

    const runAction = async (action: () => Promise<void> | void) => {
        if (isBusy) return;
        setIsBusy(true);
        setPaymentMessage(null);
        try {
            await action();
        } finally {
            setIsBusy(false);
        }
    };

    const launchSpecialtyPaymentTest = async (paymentMethod: "PIX" | "CREDIT_CARD") => {
        if (!user) {
            setPaymentMessage("Usuario nao autenticado para teste.");
            return;
        }

        const cleanCpf = testCpf.replace(/\D/g, "");
        if (cleanCpf.length < 11) {
            setPaymentMessage("Informe um CPF de teste valido.");
            return;
        }

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                localCustomerId: user.id,
                name: user.name || "Admin Teste",
                email: user.email,
                cpfCnpj: cleanCpf,
                paymentMethod,
                creditCardMode: paymentMethod === "CREDIT_CARD" ? "INVOICE_URL" : undefined,
                plan: "specialty",
                value: 50,
                description: "Teste DevTools - Compra de Especialidade"
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Falha ao criar pagamento de teste.");
        }

        if (data.invoiceUrl) {
            window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
        }

        setPaymentMessage(
            paymentMethod === "PIX"
                ? "Teste Pix criado. A fatura da Asaas foi aberta em nova aba."
                : "Teste Cartao criado. A invoiceUrl da Asaas foi aberta em nova aba."
        );
    };

    const selectedModules = PILLARS_CONTENT[selectedPillar]?.modules ?? [];

    return (
        <div className="fixed bottom-20 right-4 md:bottom-4 md:right-52 z-[99999] pointer-events-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/80 text-white p-2 rounded-full border border-white/20 hover:bg-white/20 transition-all hover:rotate-90"
            >
                <Settings size={20} />
            </button>

            {isOpen && (
                <div className="absolute bottom-12 left-0 bg-black/90 border border-white/20 p-4 rounded-lg w-56 space-y-3 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Dev Tools</h3>
                        <span className="text-[10px] text-emerald-500 font-mono">v4.0</span>
                    </div>

                    <div>
                        <span className="text-[10px] text-white/30 uppercase block mb-1">Set Level (Unlock)</span>
                        <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => {
                                        setSelectedPillar(lvl);
                                        runAction(() => setPillarLevel(lvl));
                                    }}
                                    disabled={isBusy}
                                    className="bg-white/5 text-white/70 text-[10px] py-1 hover:bg-[#EEF4D4] hover:text-black transition-colors rounded border border-white/5 disabled:opacity-50"
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[10px] text-white/35">
                            `1` volta para o começo da trilha e limpa a abertura automática do Pilar 2.
                        </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/30 uppercase block">Modules · Pilar {selectedPillar}</span>
                            <span className="text-[10px] text-cyan-400">
                                {selectedModules.filter((module) => completedPillarModules.includes(module.id)).length}/{selectedModules.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                            {selectedModules.map((module, index) => {
                                const isCompleted = completedPillarModules.includes(module.id);
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => runAction(() => setPillarModuleCompletion(module.id, !isCompleted))}
                                        disabled={isBusy}
                                        className={`rounded border px-2 py-1.5 text-left text-[10px] transition-colors disabled:opacity-50 ${
                                            isCompleted
                                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                                : "border-white/10 bg-white/5 text-white/65 hover:border-cyan-500/40 hover:text-cyan-200"
                                        }`}
                                        title={module.title}
                                    >
                                        <div className="font-semibold">M{index + 1}</div>
                                        <div className="truncate opacity-80">{module.title.replace(/^MÓDULO\s+\d+:\s*/i, "")}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => runAction(() => completePillarModulesForPillar(selectedPillar))}
                                disabled={isBusy}
                                className="w-full flex items-center justify-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] py-2 rounded hover:bg-cyan-500 hover:text-white transition-colors uppercase font-bold tracking-wider disabled:opacity-50"
                            >
                                <CheckCheck size={11} />
                                This Pilar
                            </button>
                            <button
                                onClick={() => runAction(() => clearPillarModulesForPillar(selectedPillar))}
                                disabled={isBusy}
                                className="w-full flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] py-2 rounded hover:bg-amber-500 hover:text-white transition-colors uppercase font-bold tracking-wider disabled:opacity-50"
                            >
                                <Eraser size={11} />
                                Clear Pilar
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider text-emerald-300">Payment Test</span>
                                <span className="text-[10px] text-emerald-500 font-mono">R$ 50</span>
                            </div>

                            <input
                                type="text"
                                value={testCpf}
                                onChange={(e) => setTestCpf(e.target.value)}
                                placeholder="CPF teste"
                                className="w-full rounded border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] text-white outline-none focus:border-emerald-400"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => runAction(() => launchSpecialtyPaymentTest("PIX"))}
                                    disabled={isBusy}
                                    className="flex items-center justify-center gap-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-500 hover:text-white disabled:opacity-50"
                                >
                                    <QrCode size={11} />
                                    Test Pix
                                </button>
                                <button
                                    onClick={() => runAction(() => launchSpecialtyPaymentTest("CREDIT_CARD"))}
                                    disabled={isBusy}
                                    className="flex items-center justify-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                                >
                                    <CreditCard size={11} />
                                    Test Card
                                </button>
                            </div>

                            <button
                                onClick={() => window.location.assign("/dev/payments")}
                                disabled={isBusy}
                                className="flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/5 py-2 text-[10px] font-bold uppercase tracking-wider text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
                            >
                                <ExternalLink size={11} />
                                Abrir carrinho teste
                            </button>

                            <p className="text-[10px] leading-relaxed text-white/45">
                                Gera uma compra de especialidade de R$ 50 sem liberar premium vitalicio.
                            </p>

                            {paymentMessage && (
                                <p className="text-[10px] leading-relaxed text-emerald-200">
                                    {paymentMessage}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCompleteAll}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 rounded hover:bg-emerald-500 hover:text-white transition-colors uppercase font-bold tracking-wider"
                        >
                            <ShieldAlert size={12} />
                            Complete All
                        </button>

                        <button
                            onClick={() => runAction(() => completeAllPillarModules())}
                            disabled={isBusy}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs py-2 rounded hover:bg-cyan-500 hover:text-white transition-colors uppercase font-bold tracking-wider disabled:opacity-50"
                        >
                            <CheckCheck size={12} />
                            Complete Modules
                        </button>

                        <button
                            onClick={() => runAction(() => clearAllPillarModules())}
                            disabled={isBusy}
                            className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs py-2 rounded hover:bg-amber-500 hover:text-white transition-colors uppercase font-bold tracking-wider disabled:opacity-50"
                        >
                            <Eraser size={12} />
                            Clear Modules
                        </button>

                        <button
                            onClick={() => runAction(() => clearCurrentUserExams())}
                            disabled={isBusy}
                            className="w-full flex items-center justify-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 text-xs py-2 rounded hover:bg-fuchsia-500 hover:text-white transition-colors uppercase font-bold tracking-wider disabled:opacity-50"
                        >
                            <FileX2 size={12} />
                            Clear Exams
                        </button>

                        <button
                            onClick={() => runAction(resetProgress)}
                            disabled={isBusy}
                            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-1 rounded hover:bg-red-500 hover:text-white transition-colors uppercase disabled:opacity-50"
                        >
                            {isBusy ? "Working..." : "Reset Progress"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
