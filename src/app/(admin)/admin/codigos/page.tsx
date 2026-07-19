"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, Check, Plus } from "lucide-react";

interface InviteCodeRecord {
    id: string;
    displayCode: string;
    code: string | null;
    copyable: boolean;
    status: "unused" | "used" | "expired" | string;
    createdAt: string | null;
    expiresAt: string | null;
}

export default function AdminCodesPage() {
    const [loading, setLoading] = useState(false);
    const [codes, setCodes] = useState<InviteCodeRecord[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [batchAmount, setBatchAmount] = useState("10");
    const [lastGeneratedCodes, setLastGeneratedCodes] = useState<InviteCodeRecord[]>([]);
    const [batchCopied, setBatchCopied] = useState(false);

    const parsedBatchAmount = Number(batchAmount);
    const isBatchAmountValid = Number.isInteger(parsedBatchAmount) && parsedBatchAmount >= 1 && parsedBatchAmount <= 500;

    useEffect(() => {
        let cancelled = false;
        fetch("/api/admin/invite-codes", { credentials: "include", cache: "no-store" })
            .then(async (response) => {
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Falha ao carregar codigos.");
                if (!cancelled) setCodes(Array.isArray(payload.codes) ? payload.codes : []);
            })
            .catch((error) => {
                console.error("Erro ao carregar codigos:", error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleGenerateCodes = async () => {
        if (!isBatchAmountValid) return;
        setLoading(true);
        try {
            const response = await fetch("/api/admin/invite-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ amount: parsedBatchAmount }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error || "Falha ao gerar codigos.");
            const generated = Array.isArray(payload.codes) ? payload.codes as InviteCodeRecord[] : [];
            const generatedIds = new Set(generated.map((item) => item.id));
            setLastGeneratedCodes(generated);
            setBatchCopied(false);
            setCodes((current) => [...generated, ...current.filter((item) => !generatedIds.has(item.id))]);
        } catch (error) {
            console.error("Erro ao gerar:", error);
            alert(error instanceof Error ? error.message : "Erro ao gerar códigos");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const copyLastBatch = () => {
        const plainCodes = lastGeneratedCodes
            .map((item) => item.code)
            .filter((code): code is string => Boolean(code));
        if (plainCodes.length === 0) return;
        navigator.clipboard.writeText(plainCodes.join("\n"));
        setBatchCopied(true);
        setTimeout(() => setBatchCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Códigos de Acesso</h1>
                    <p className="text-slate-500 text-sm">Gere quantos convites forem necessários para o beta gratuito.</p>
                    <p className="mt-1 text-xs text-amber-700">Por segurança, copie códigos novos antes de sair desta página; depois será exibido apenas o final.</p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                        Quantidade
                        <input
                            type="number"
                            min={1}
                            max={500}
                            step={1}
                            value={batchAmount}
                            onChange={(event) => setBatchAmount(event.target.value)}
                            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            aria-describedby="invite-batch-limit"
                        />
                    </label>
                    <button
                        onClick={handleGenerateCodes}
                        disabled={loading || !isBatchAmountValid}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Gerar convites
                    </button>
                    {lastGeneratedCodes.length > 0 && (
                        <button
                            onClick={copyLastBatch}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                            {batchCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {batchCopied ? "Lote copiado" : `Copiar último lote (${lastGeneratedCodes.length})`}
                        </button>
                    )}
                </div>
            </div>

            <p id="invite-batch-limit" className="-mt-5 mb-6 text-xs text-slate-500">
                Até 500 por operação, sem limite total de participantes. Gere novos lotes sempre que precisar.
            </p>

            {/* Tabela de Códigos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Código</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Criado em</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Expira em</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {codes.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                                        {item.displayCode}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${item.status === 'unused' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'}
                                        `}>
                                            {item.status === 'unused' ? 'Disponível' : item.status === 'expired' ? 'Expirado' : 'Utilizado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : 'Agora'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => item.code && copyToClipboard(item.code, item.id)}
                                            disabled={!item.copyable || !item.code}
                                            className="text-slate-400 hover:text-emerald-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                                            title={item.copyable ? "Copiar código" : "O código completo só é mostrado na geração"}
                                        >
                                            {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {codes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum código gerado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
