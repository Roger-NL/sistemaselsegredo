"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { getRank } from "@/utils/ranks";
import { DashboardNav } from "@/components/core/DashboardNav";

export default function PerfilPage() {
    const router = useRouter();
    const { getCompletedCount, getGlobalProgress } = useProgress();

    const completedCount = getCompletedCount();
    const currentRank = getRank(completedCount);
    const globalProgress = getGlobalProgress();

    // Mock data - será substituído por dados reais
    const studentData = {
        name: "Rogério Augusto",
        email: "rogerio@email.com",
        memberSince: "Janeiro 2025",
        totalStudyTime: "42h 30min",
        currentStreak: 7,
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pointer-events-auto">
            {/* Navigation */}
            <DashboardNav studentName={studentData.name} />

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas informações pessoais</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EEF4D4] to-emerald-200 flex items-center justify-center text-3xl font-bold text-gray-800 shadow-lg">
                                {studentData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                            <p className="text-gray-500">{studentData.email}</p>

                            {/* Rank Badge */}
                            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-[#EEF4D4]/30 to-emerald-100/50 rounded-full">
                                <span className="text-xs text-gray-600 uppercase tracking-wider">Patente</span>
                                <span className="font-bold text-gray-900">{currentRank}</span>
                            </div>

                            <p className="text-sm text-gray-400 mt-3">Membro desde {studentData.memberSince}</p>
                        </div>

                        {/* Edit Button */}
                        <button className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                            Editar Perfil
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
                        <div className="text-sm text-gray-500 mt-1">Pilares Concluídos</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-[#10b981]">{globalProgress}%</div>
                        <div className="text-sm text-gray-500 mt-1">Progresso Total</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-gray-900">{studentData.totalStudyTime}</div>
                        <div className="text-sm text-gray-500 mt-1">Tempo de Estudo</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-orange-500">{studentData.currentStreak}</div>
                        <div className="text-sm text-gray-500 mt-1">Dias Seguidos</div>
                    </div>
                </div>



                {/* Back Button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar ao Dashboard
                </button>

            </main>
        </div>
    );
}
