"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Key, Copy, Check, Plus, RefreshCw } from "lucide-react";

export default function AdminCodesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [codes, setCodes] = useState<any[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Carregar códigos em tempo real
    useEffect(() => {
        const q = query(
            collection(db, "invite_codes"), 
            orderBy("createdAt", "desc"), 
            limit(50)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCodes(data);
        });

        return () => unsubscribe();
    }, []);

    const generateRandomString = () => {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    const handleGenerateCodes = async (amount: number) => {
        setLoading(true);
        try {
            const batchPromises = [];
            for (let i = 0; i < amount; i++) {
                const code = `ES-${generateRandomString()}-${generateRandomString()}`;
                batchPromises.push(
                    addDoc(collection(db, "invite_codes"), {
                        code: code,
                        status: "unused",
                        createdAt: serverTimestamp(),
                        createdBy: user?.email || "admin",
                        type: "premium_access"
                    })
                );
            }
            await Promise.all(batchPromises);
        } catch (error) {
            console.error("Erro ao gerar:", error);
            alert("Erro ao gerar códigos");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Códigos de Acesso</h1>
                    <p className="text-slate-500 text-sm">Gerencie chaves para desbloqueio do plano Premium.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleGenerateCodes(1)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Gerar 1
                    </button>
                    <button
                        onClick={() => handleGenerateCodes(5)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Gerar Lote (5)
                    </button>
                </div>
            </div>

            {/* Tabela de Códigos */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Código</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Criado em</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {codes.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                                        {item.code}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${item.status === 'unused' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'}
                                        `}>
                                            {item.status === 'unused' ? 'Disponível' : 'Utilizado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.createdAt?.seconds 
                                            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR') 
                                            : 'Agora'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => copyToClipboard(item.code, item.id)}
                                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                                            title="Copiar Código"
                                        >
                                            {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {codes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
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
