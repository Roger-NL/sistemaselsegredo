"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Crown, Sparkles, ArrowRight, CalendarClock } from "lucide-react";
import type { LiveSessionStatusPayload } from "@/lib/scheduling/types";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { DevControls } from "@/components/core/DevControls";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { PILAR_1_DATA } from "@/data/pillars/pilar-1";
import { TheHUD } from "@/components/core/TheHUD";
import { GlobalStatusPanel } from "@/features/dashboard/GlobalStatusPanel";
import { Typewriter } from "@/components/ui/typewriter";
import { DashboardNav } from "@/components/core/DashboardNav";
import ConciergeModal from "@/components/core/ConciergeModal";
import { ExamFeedbackPopup } from "@/features/dashboard/ExamFeedbackPopup";

import { useAuth } from "@/context/AuthContext";
import { getLeaderboard, LeaderboardUser } from "@/lib/leaderboard/service";
import { ROUTES } from "@/lib/routes";

export default function Page() {
  const router = useRouter();
  const { user, updateProfile, subscriptionStatus } = useAuth();
  const {
    getCompletedCount,
    getCurrentPillarNumber,
    specializationStatus,
    getCurrentSpecialization,
    getGlobalProgress,
    completedPillarModules
  } = useProgress();

  const completedCount = getCompletedCount();
  const currentPillarNumber = getCurrentPillarNumber();
  const currentPillar = PILLARS[currentPillarNumber - 1];
  const currentSpec = getCurrentSpecialization();
  const globalProgress = getGlobalProgress();
  const pillarOneModuleIds = PILAR_1_DATA.modules?.map((module) => module.id) ?? [];
  const isPremiumUser = subscriptionStatus === "premium";
  const hasFinishedPillarOne =
    (user?.approvedPillar || 1) >= 2 ||
    (pillarOneModuleIds.length > 0 && pillarOneModuleIds.every((moduleId) => completedPillarModules.includes(moduleId)));
  const shouldShowPremiumCTA = !isPremiumUser && hasFinishedPillarOne;

  // NÃO mostrar DecisionMatrix automaticamente
  // O usuário acessa via HUD clicando no Pilar 10 (Especialidades)
  // Isso resolve o problema do botão "Voltar" não funcionar

  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [showCommsModal, setShowCommsModal] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [schedulingStatus, setSchedulingStatus] = useState<LiveSessionStatusPayload | null>(null);
  const shouldShowSchedulingCard = isPremiumUser && Boolean(schedulingStatus?.session);

  // Carregar Leaderboard
  useEffect(() => {
    async function loadData() {
      const data = await getLeaderboard(5);
      setLeaderboard(data);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadSchedulingStatus() {
      if (!user?.id || subscriptionStatus !== "premium") {
        setSchedulingStatus(null);
        return;
      }

      try {
        const response = await fetch(`/api/scheduling/status?userId=${user.id}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) return;
        setSchedulingStatus(payload);
      } catch (error) {
        console.error("Erro ao carregar status de agendamento:", error);
      }
    }

    loadSchedulingStatus();
  }, [subscriptionStatus, user?.id]);

  // Trigger: Verifica conexão WhatsApp ao entrar (delay 3s)
  useEffect(() => {
    if (!user) return;

    // Se já tem telefone válido no sistema, não mostra o modal
    if (user.phone && user.phone.length > 8) return;

    // Verifica se já conectou (fallback local)
    const alreadyConnected = localStorage.getItem('es-secure-comms-v2');

    if (!alreadyConnected) {
      // Se NÃO conectou, espera 3 segundos e bloqueia a tela com o modal
      const timer = setTimeout(() => {
        setShowCommsModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleGlobeClick = () => {
    console.log("Opening HUD");
    setIsHUDOpen(true);
  };
  // Controle manual removido - valores fixados em 36px/20px no desktop


  // Pegar pilares com status para o HUD
  const pillarsWithStatus = useProgress().getPillarsWithStatus();

  // Admin Check
  const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <main className="relative min-h-screen min-h-[100dvh] w-full overflow-hidden text-white selection:bg-[#EEF4D4] selection:text-black flex items-center justify-center pointer-events-none">

      {/* Admin Portal Button - Fixed Bottom Right */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
          <button
            onClick={() => router.push(ROUTES.admin.dashboard)}
            className="bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            PAINEL ADMIN
          </button>
        </div>
      )}

      {/* Dashboard Navigation - Apple Bean Style */}
      <DashboardNav
        studentName={user?.name || "Rogério Augusto"}
        studentStreak={user?.currentStreak || 0}
      />

      {shouldShowPremiumCTA && (
        <div className="absolute top-24 left-1/2 z-40 w-[min(92vw,640px)] -translate-x-1/2 pointer-events-auto px-4">
          <button
            type="button"
            onClick={() => router.push(ROUTES.public.payment)}
            className="group w-full rounded-3xl border border-emerald-400/30 bg-[linear-gradient(135deg,rgba(5,12,10,0.95),rgba(8,30,24,0.92),rgba(9,50,42,0.88))] px-5 py-4 text-left shadow-[0_0_40px_rgba(16,185,129,0.18)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-emerald-300/60 hover:shadow-[0_0_65px_rgba(16,185,129,0.28)] md:px-6 md:py-5"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.22)]">
                <Crown className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium liberado
                </div>

                <h2 className="text-base font-black uppercase tracking-[0.12em] text-white md:text-lg">
                  Desbloqueie o acesso premium agora
                </h2>
                <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-emerald-50/78 md:text-[15px]">
                  Você concluiu o Pilar 1. Seu acesso ao upgrade vitalício já está disponível aqui no dashboard.
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-2 self-center rounded-full border border-emerald-300/30 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200 md:flex">
                Desbloquear
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] uppercase tracking-[0.22em] text-emerald-100/70">
              <span>Acesso vitalício</span>
              <span>Pagamento único</span>
              <span className="md:hidden inline-flex items-center gap-1 font-bold text-emerald-200">
                Ir agora
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        </div>
      )}

      {shouldShowSchedulingCard && (
        <div className="absolute top-[8.3rem] left-1/2 z-30 w-[min(92vw,720px)] -translate-x-1/2 pointer-events-auto px-4 md:top-32">
          <button
            type="button"
            onClick={() => router.push(ROUTES.app.scheduling)}
            className="group w-full rounded-3xl border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(6,12,17,0.92),rgba(8,24,33,0.92),rgba(8,33,31,0.92))] px-5 py-4 text-left shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-cyan-300/50 hover:shadow-[0_0_65px_rgba(34,211,238,0.16)] md:px-6 md:py-5"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
                <CalendarClock className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                  Sessão Ao Vivo
                </div>

                <h2 className="text-base font-black uppercase tracking-[0.12em] text-white md:text-lg">
                  Sua área de agendamentos já está pronta
                </h2>
                <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-cyan-50/78 md:text-[15px]">
                  {schedulingStatus?.waitingReason ||
                    "Seu espaço de agendamento já faz parte da conta premium. Quando a etapa certa for aprovada, ele vira sua área prática de marcação."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-cyan-100/65">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Sessão ao vivo</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Acompanhamento humano</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">Fluxo premium</span>
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-2 self-center rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 md:flex">
                Abrir
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Global Status Panel (Lateral) - Absolute para não afetar centralização */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="pointer-events-auto">
          <GlobalStatusPanel />
        </div>
      </div>

      {/* HUD - Menu de Pilares */}
      <TheHUD
        isOpen={isHUDOpen}
        onClose={() => setIsHUDOpen(false)}
        pillars={pillarsWithStatus}
        completedCount={completedCount}
      />

      {/* Streak & Leaderboard - Right Side (Desktop) - Minimal Wireframe Style */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-4 z-20 pointer-events-auto">

        {/* Streak Counter - Minimal */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Sequência</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-orange-400" style={{ textShadow: '0 0 20px rgba(251, 146, 60, 0.4)' }}>
                {user?.currentStreak || 0}
              </span>
              <span className="text-xs text-white/40">dias</span>
            </div>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-orange-500/50 to-transparent" />
          <div className="flex flex-col gap-0.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i < (user?.currentStreak || 0) ? 'bg-orange-400' : 'bg-white/20'}`}
                style={i < (user?.currentStreak || 0) ? { boxShadow: '0 0 6px rgba(251, 146, 60, 0.6)' } : {}}
              />
            ))}
          </div>
        </div>

        {/* Thin separator line */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />



        {/* Leaderboard - Real Data */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Top Streaks</span>

          {leaderboard.length === 0 ? (
            <div className="text-[10px] text-white/20 animate-pulse">Carregando...</div>
          ) : (
            leaderboard.map((u, i) => {
              const isMe = user?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-2 text-right"
                >
                  <span className={`text-xs ${isMe ? 'text-orange-400 font-bold' : 'text-white/50'}`}>
                    {isMe ? "Você" : u.name}
                  </span>
                  <span className={`text-[10px] font-mono ${isMe ? 'text-orange-300' : 'text-white/30'}`}>
                    {u.streak}
                  </span>
                  <span className="text-[10px]">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : isMe ? '🔥' : '·'}
                  </span>
                </div>
              );
            })
          )}

          {/* Always show current user if not in top 5? Optional, but nice. */}
          {user && leaderboard.length > 0 && !leaderboard.find(u => u.id === user.id) && (
            <>
              <div className="h-px w-8 bg-white/10 my-0.5" />
              <div className="flex items-center gap-2 text-right opacity-80">
                <span className="text-xs text-orange-400 font-bold">Você</span>
                <span className="text-[10px] font-mono text-orange-300">{user.currentStreak || 0}</span>
                <span className="text-[10px]">🔥</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Stage (The Globe) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {/* Nova versão estonteante - Hero Left (Desktop) */}
        <div className="absolute left-8 top-1/2 hidden max-w-[600px] -translate-y-1/2 select-none pointer-events-none lg:flex xl:left-12 flex-col items-start z-0">
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="text-cyan-400 font-mono text-[10px] tracking-[0.3em] uppercase font-bold">
              Mission Directive
            </span>
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>

          <h2 className="text-3xl xl:text-4xl font-light text-white/50 tracking-widest font-mono mb-2 uppercase">
            Your Mission Is To
          </h2>

          <div className="min-h-[160px] relative w-full pt-2 perspective-[1000px]">
            {/* Ambient Background Glow purely for the text */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3/4 h-24 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent blur-[40px] -z-10 rounded-full mix-blend-screen" />

            <Typewriter
              text={[
                "UNLOCK\nFLUENCY",
                "MASTER\nTHE CODE",
                "BREAK\nBARRIERS",
                "ACCESS\nTHE WORLD",
                "THINK\nIN ENGLISH",
                "LIVE\nTHE DREAM",
                "EARN\nMORE",
                "TRAVEL\nFREELY",
                "BE\nUNSTOPPABLE",
                "CREATE\nYOUR FUTURE",
                "SPEAK\nBOLDLY",
                "LEAD\nWITH POWER",
                "CHANGE\nYOUR LIFE",
                "NO MORE\nFEAR",
                "TOTAL\nCONTROL",
                "HACK\nTHE SYSTEM",
                "GLOBAL\nMINDSET",
                "PURE\nCONFIDENCE",
                "ZERO\nHESITATION",
                "BECOME\nA LEGEND",
                "THE TIME\nIS NOW",
                "EVOLVE\nFASTER",
                "DECODE\nREALITY",
                "CONNECT\nPEOPLE",
                "INSPIRE\nOTHERS",
                "BUILD\nLEGACY",
                "MASTER\nYOURSELF",
                "EXPAND\nVISION",
                "REWRITE\nSTORY",
                "ACHIEVE\nGLORY",
                "UNLEASH\nPOWER",
                "DOMINATE\nTHE GAME"
              ]}
              speed={75}
              className="text-5xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#EEF4D4] via-emerald-300 to-cyan-500 tracking-tighter leading-[0.85] uppercase whitespace-pre-line drop-shadow-sm"
              waitTime={4500}
              deleteSpeed={35}
              cursorChar={"_"}
              cursorClassName="text-cyan-400 animate-pulse text-5xl xl:text-7xl font-black drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] inline-block -translate-y-[0.1em] -ml-2"
            />
          </div>
        </div>

        {/* Nova versão estonteante - Mobile */}
        <div className="absolute top-[11%] left-0 right-0 flex lg:hidden flex-col items-center z-30 pointer-events-none select-none px-4 text-center">
          <div className="flex items-center gap-2 mb-0 opacity-80 z-40">
            <span className="text-cyan-400 font-mono text-[9px] tracking-[0.4em] uppercase font-bold">
              Mission Directive
            </span>
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>

          <div className="min-h-[40px] flex items-center justify-center relative w-full z-40">
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full h-16 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 blur-[20px] -z-10 rounded-full mix-blend-screen" />

            <Typewriter
              text={[
                "UNLOCK FLUENCY",
                "MASTER ENGLISH",
                "NO BARRIERS",
                "ACCESS WORLD",
                "BECOME A LEGEND",
                "CHANGE YOUR LIFE"
              ]}
              speed={60}
              className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#EEF4D4] via-emerald-300 to-cyan-400 tracking-tighter leading-none uppercase drop-shadow-sm"
              waitTime={2500}
              deleteSpeed={30}
              cursorChar={"_"}
              cursorClassName="text-cyan-400 animate-pulse text-2xl sm:text-3xl font-black drop-shadow-[0_0_10px_rgba(34,211,238,0.6)] inline-block -translate-y-[0.1em] -ml-1"
            />
          </div>
        </div>



        <div
          className="absolute left-1/2 top-1/2 z-10 pointer-events-none"
          style={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="relative lg:translate-x-[36px] lg:translate-y-[20px]">
            <div
              className="group relative pointer-events-auto select-none"
              style={{
                width: "min(500px, 82vw, 62dvh)",
                height: "min(500px, 82vw, 62dvh)"
              }}
            >
              <button
                type="button"
                onClick={handleGlobeClick}
                className="absolute inset-0 overflow-hidden rounded-full border-0 bg-transparent p-0 cursor-pointer transition-transform duration-300 group-hover:scale-[1.02] active:scale-[0.99]"
                aria-label="Abrir visão dos pilares"
              >
                <RotatingEarth
                  width={500}
                  height={500}
                  className="size-full transition-transform duration-700 ease-out"
                />
              </button>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex flex-col items-center">
                  {completedCount === 9 ? (
                    <div className="flex flex-col items-center">
                      <span
                        className="text-[clamp(4.75rem,18vw,8rem)] font-serif font-black leading-none"
                        style={{
                          color: '#ddd6fe',
                          textShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        {Math.min(100, Math.max(0, Math.round((globalProgress - 50) * 2))) + "%"}
                      </span>
                      <span
                        className="mt-2 text-[10px] md:text-sm font-mono font-bold uppercase tracking-[0.35em]"
                        style={{ color: '#a78bfa' }}
                      >
                        Especialização
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span
                        className="font-serif font-black tracking-tighter leading-none"
                        style={{
                          color: '#EEF4D4',
                          textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6)',
                          fontSize: 'clamp(4.5rem, 18vw, 8rem)'
                        }}
                      >
                        {completedCount}
                        <span
                          className="align-top ml-2 opacity-80"
                          style={{ fontSize: 'clamp(2rem, 7vw, 4rem)' }}
                        >
                          /9
                        </span>
                      </span>
                      <span
                        className="mt-2 text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.5em]"
                        style={{ color: '#EEF4D4', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                      >
                        PILARES
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-full z-20 mt-5 -translate-x-1/2 pointer-events-auto flex flex-col items-center">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSpec) router.push(`${ROUTES.app.specialties}/${currentSpec.id}`);
                  else if (completedCount < 9) router.push(`${ROUTES.app.pillar}/${currentPillarNumber}`);
                  else router.push(ROUTES.app.specialties);
                }}
                className="cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${currentSpec
                    ? "border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20"
                    : "border-[#EEF4D4]/40 bg-[#EEF4D4]/10 hover:bg-[#EEF4D4]/20"
                    }`}
                  style={{
                    boxShadow: currentSpec
                      ? '0 0 20px rgba(139, 92, 246, 0.3)'
                      : '0 0 20px rgba(238, 244, 212, 0.2)'
                  }}
                >
                  <span className={`w-2 h-2 rounded-full animate-pulse ${currentSpec ? "bg-violet-400" : "bg-[#EEF4D4]"}`} />
                  <span className={`text-xs md:text-sm font-medium uppercase tracking-wider ${currentSpec ? "text-violet-300" : "text-[#EEF4D4]"}`}>
                    {currentSpec
                      ? "Continuar Estudo"
                      : specializationStatus === "completed"
                        ? "Especialização Concluída"
                        : completedCount === 9
                          ? "Escolher Especialidade"
                          : completedCount === 0
                            ? "Começar os Estudos"
                            : "Continuar Estudo"
                    }
                  </span>
                </span>
              </div>

              <div className="mt-4 text-center">
                {currentSpec ? (
                  <>
                    <p
                      className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full inline-block"
                      style={{
                        color: '#c4b5fd',
                        backgroundColor: 'rgba(139, 92, 246, 0.25)',
                        textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                      }}
                    >
                      {currentSpec.title}
                    </p>
                    <div className="mt-2 w-32 mx-auto">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.max(globalProgress - 50, 0) * 2}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-violet-300 mt-1 font-mono font-bold">{globalProgress}% concluído</p>
                    </div>
                  </>
                ) : (
                  <p
                    className="text-[10px] md:text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full inline-block"
                    style={{
                      color: '#EEF4D4',
                      backgroundColor: 'rgba(240, 17, 248, 0.15)',
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {completedCount === 9
                      ? (specializationStatus === "completed" ? "Especialização concluída com sucesso" : "Escolher Especialidade")
                      : `Pilar ${currentPillarNumber}: ${currentPillar?.title || "Pilar 1"}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Capture Modal — Trigger: Login (Mandatório) */}
      <ConciergeModal
        trigger="login"
        isOpen={showCommsModal}
        onClose={() => {
          setShowCommsModal(false);
        }}
        onConnect={(phone) => {
          if (user) {
            updateProfile(user.name, user.email, phone);
          }
          setShowCommsModal(false);
        }}
      />

      {/* Exam Feedback Popup - Checks for new grades */}
      <ExamFeedbackPopup />

      {/* Dev Controls */}
      <div className="pointer-events-auto">
        <DevControls isAdmin={isAdmin || false} />
      </div>
    </main>
  );
}
