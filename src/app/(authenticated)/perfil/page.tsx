"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";
import { getRank } from "@/utils/ranks";
import { DashboardNav } from "@/components/core/DashboardNav";

export default function PerfilPage() {
    const router = useRouter();
    const { getCompletedCount, getGlobalProgress } = useProgress();
    const [newPassword, setNewPassword] = useState("");
    const { user, updateProfile, changePassword, isLoading: authLoading } = useAuth();

    // Função auxiliar para detecção de bandeira
    const getFlagEmoji = (phone: string): string => {
        if (!phone) return '🏳️';
        const clean = phone.replace(/[^\d+]/g, '');
        if (clean.startsWith('+55')) return '🇧🇷';
        if (clean.startsWith('+1')) return '🇺🇸';
        if (clean.startsWith('+351')) return '🇵🇹';
        if (clean.startsWith('+44')) return '🇬🇧';
        if (clean.startsWith('+34')) return '🇪🇸';
        if (clean.startsWith('+33')) return '🇫🇷';
        if (clean.startsWith('+49')) return '🇩🇪';
        if (clean.startsWith('+39')) return '🇮🇹';
        if (clean.startsWith('+')) return '🌐';
        // Se parece BR sem DDI
        if (clean.length >= 10 && clean.length <= 11) return '🇧🇷';
        return '🏳️';
    };

    // Formatter utility
    const formatPhoneNumber = (value: string) => {
        if (!value) return "";
        let raw = value.replace(/[^\d+]/g, '');

        // Auto-fix BR without DDI
        if (!raw.startsWith('+')) {
            if (raw.length >= 10 && raw.length <= 11) {
                raw = '+55' + raw;
            } else if (raw.startsWith('55') && raw.length > 2) {
                raw = '+' + raw;
            }
        }

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

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [localPhone, setLocalPhone] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Initialize edit fields when user data is loaded
    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('es-secure-comms-v2') || "" : "";
        setLocalPhone(saved);

        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
            setEditPhone(user.phone || saved || "");
        }
    }, [user]);

    // Handle profile update
    const handleUpdateProfile = async () => {
        setError("");
        setSuccessMsg("");

        if (!editName.trim() || !editEmail.trim()) {
            setError("Nome e email são obrigatórios");
            return;
        }

        setIsSaving(true);

        const promises: Promise<any>[] = [];
        promises.push(updateProfile(editName, editEmail, editPhone));

        if (newPassword) {
            if (newPassword.length < 6) {
                setError("A senha deve ter pelo menos 6 caracteres.");
                setIsSaving(false);
                return;
            }
            promises.push(changePassword(newPassword));
        }

        const results = await Promise.all(promises);
        setIsSaving(false);

        const profileResult = results[0];
        const passwordResult = newPassword ? results[1] : { success: true };

        if (profileResult.success && passwordResult.success) {
            setLocalPhone(editPhone);
            setSuccessMsg(newPassword ? "Perfil e senha atualizados com sucesso!" : "Perfil atualizado com sucesso!");
            setIsEditing(false);
            setNewPassword(""); // Reset password field

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            const errorMsg = profileResult.error || passwordResult.error || "Erro ao atualizar dados";
            setError(errorMsg);
        }
    };

    const completedCount = getCompletedCount();
    const currentRank = getRank(completedCount);
    const globalProgress = getGlobalProgress();

    // Default or loading state
    if (authLoading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Carregando...</div>;

    const baseUser = user || { name: "Usuário", email: "...", createdAt: new Date().toISOString(), currentStreak: 0, phone: "" };
    const displayUser = { ...baseUser, phone: baseUser.phone || localPhone || "" };

    // Format date properly
    const memberSince = new Date(displayUser.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedMemberSince = memberSince.charAt(0).toUpperCase() + memberSince.slice(1);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pointer-events-auto">
            {/* Navigation */}
            <DashboardNav studentName={displayUser.name} studentStreak={displayUser.currentStreak || 0} />

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                    <p className="text-gray-500 mt-1">Gerencie suas informações pessoais</p>
                </div>

                {/* Success/Error Messages */}
                {successMsg && (
                    <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EEF4D4] to-emerald-200 flex items-center justify-center text-3xl font-bold text-gray-800 shadow-lg capitalize">
                                {displayUser.name.substring(0, 2)}
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Info / Edit Form */}
                        <div className="flex-1 text-center md:text-left w-full">
                            {isEditing ? (
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none">
                                                {getFlagEmoji(editPhone)}
                                            </div>
                                            <input
                                                type="tel"
                                                value={editPhone}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow deletion
                                                    if (val.length < editPhone.length) {
                                                        setEditPhone(val);
                                                        return;
                                                    }
                                                    setEditPhone(formatPhoneNumber(val));
                                                }}
                                                placeholder="+55 (00) 00000-0000"
                                                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Deixe em branco para remover.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha (Opcional)</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full px-3 py-2 border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-blue-50/50 placeholder:text-gray-400"
                                            autoComplete="new-password"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a atual.</p>
                                    </div>
                                    <div className="flex gap-3 pt-2 justify-center md:justify-start">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditName(displayUser.name);
                                                setEditEmail(displayUser.email);
                                                setEditPhone(displayUser.phone || "");
                                            }}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{displayUser.name}</h2>
                                    <p className="text-gray-500">{displayUser.email}</p>
                                    {displayUser.phone && (
                                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                            <span className="text-emerald-600">📱</span>
                                            <span className="text-lg">{getFlagEmoji(displayUser.phone)}</span>
                                            {formatPhoneNumber(displayUser.phone)}
                                        </p>
                                    )}

                                    {/* Rank Badge */}
                                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-[#EEF4D4]/30 to-emerald-100/50 rounded-full">
                                        <span className="text-xs text-gray-600 uppercase tracking-wider">Patente</span>
                                        <span className="font-bold text-gray-900">{currentRank}</span>
                                    </div>

                                    <p className="text-sm text-gray-400 mt-3">Membro desde {formattedMemberSince}</p>
                                </>
                            )}
                        </div>

                        {/* Edit Button (Only show if not editing) */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                Editar Perfil
                            </button>
                        )}
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
                        <div className="text-3xl font-bold text-gray-900">12h 30min</div>
                        <div className="text-sm text-gray-500 mt-1">Tempo de Estudo</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                        <div className="text-3xl font-bold text-orange-500">{displayUser.currentStreak || 0}</div>
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
