"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/core/DashboardNav";

export default function ConfiguracoesPage() {
    const router = useRouter();

    // Mock settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyReport: true,
        soundEffects: true,
        autoplay: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Toggle component
    const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${enabled ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] pointer-events-auto">
            {/* Navigation */}
            <DashboardNav studentName="Rogério Augusto" />

            {/* Main Content */}
            <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-gray-500 mt-1">Personalize sua experiência de aprendizado</p>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Notificações</h3>
                    <p className="text-sm text-gray-500 mb-6">Gerencie como você recebe atualizações</p>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Notificações por E-mail</p>
                                <p className="text-sm text-gray-500">Receba atualizações e lembretes por e-mail</p>
                            </div>
                            <Toggle enabled={settings.emailNotifications} onToggle={() => toggleSetting('emailNotifications')} />
                        </div>

                        <div className="border-t border-gray-100" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Notificações Push</p>
                                <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                            </div>
                            <Toggle enabled={settings.pushNotifications} onToggle={() => toggleSetting('pushNotifications')} />
                        </div>

                        <div className="border-t border-gray-100" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Relatório Semanal</p>
                                <p className="text-sm text-gray-500">Receba um resumo do seu progresso toda semana</p>
                            </div>
                            <Toggle enabled={settings.weeklyReport} onToggle={() => toggleSetting('weeklyReport')} />
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Preferências</h3>
                    <p className="text-sm text-gray-500 mb-6">Ajuste a experiência da plataforma</p>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Efeitos Sonoros</p>
                                <p className="text-sm text-gray-500">Sons ao completar ações</p>
                            </div>
                            <Toggle enabled={settings.soundEffects} onToggle={() => toggleSetting('soundEffects')} />
                        </div>

                        <div className="border-t border-gray-100" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Autoplay de Vídeos</p>
                                <p className="text-sm text-gray-500">Iniciar vídeos automaticamente</p>
                            </div>
                            <Toggle enabled={settings.autoplay} onToggle={() => toggleSetting('autoplay')} />
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Conta</h3>
                    <p className="text-sm text-gray-500 mb-6">Gerencie informações da sua conta</p>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Alterar E-mail</p>
                                    <p className="text-sm text-gray-500">rogerio@email.com</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Alterar Senha</p>
                                    <p className="text-sm text-gray-500">Última alteração há 3 meses</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-1">Zona de Perigo</h3>
                    <p className="text-sm text-gray-500 mb-6">Ações irreversíveis - tenha cuidado</p>

                    <button className="px-5 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                        Excluir Minha Conta
                    </button>
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
