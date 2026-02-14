"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { Users, Ticket, TrendingUp, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeCodes: 0,
        usedCodes: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Users Count
                const usersColl = collection(db, "users");
                const usersSnapshot = await getCountFromServer(usersColl);
                
                // Codes Count (Active)
                const codesColl = collection(db, "invite_codes");
                const activeQuery = query(codesColl, where("status", "==", "unused"));
                const activeSnapshot = await getCountFromServer(activeQuery);

                // Codes Count (Used)
                const usedQuery = query(codesColl, where("status", "==", "used"));
                const usedSnapshot = await getCountFromServer(usedQuery);

                const usedCount = usedSnapshot.data().count;

                setStats({
                    totalUsers: usersSnapshot.data().count,
                    activeCodes: activeSnapshot.data().count,
                    usedCodes: usedCount,
                    revenue: usedCount * 297
                });
            } catch (error) {
                console.error("Erro ao carregar stats:", error);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: "Total de Alunos", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Receita Estimada", value: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Códigos Disponíveis", value: stats.activeCodes, icon: Ticket, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Códigos Resgatados", value: stats.usedCodes, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
                <p className="text-slate-500 text-sm">Monitoramento em tempo real da operação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{card.title}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder para gráfico futuro */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-24">
                <p className="text-slate-400 text-sm">Gráfico de Retenção (Em desenvolvimento)</p>
            </div>
        </div>
    );
}
