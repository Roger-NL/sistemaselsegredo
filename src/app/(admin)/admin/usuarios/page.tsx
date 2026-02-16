"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { Loader2, Search, User } from "lucide-react";
import { StudentDetailModal } from "@/components/features/admin/StudentDetailModal";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, active, pending
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                let q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));

                if (filter !== "all") {
                    q = query(collection(db, "users"), where("subscriptionStatus", "==", filter), limit(50));
                }

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(data);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [filter]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Alunos</h1>
                    <p className="text-slate-500 text-sm">Gerenciamento da base de estudantes.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter("active")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "active" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        Premium
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === "pending" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        Free
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Aluno</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Plano</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Data Cadastro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 group-hover:text-violet-700 transition-colors">{user.name || "Sem Nome"}</p>
                                                <p className="text-xs text-slate-400 group-hover:text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${user.subscriptionStatus === 'active' || user.subscriptionStatus === 'premium'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'}
                                        `}>
                                            {user.subscriptionStatus === 'active' || user.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`font-semibold text-xs ${user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'active' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                {user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                                            </span>
                                            {user.inviteCodeUsed && (
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    Cupom: {user.inviteCodeUsed}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Detail Modal */}
            <StudentDetailModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    );
}
