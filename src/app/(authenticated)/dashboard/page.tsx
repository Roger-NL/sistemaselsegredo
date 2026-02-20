"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { DevControls } from "@/components/core/DevControls";
import { useProgress } from "@/context/ProgressContext";
import { getRank } from "@/utils/ranks";
import { PILLARS } from "@/data/curriculum";
import { TheHUD } from "@/components/core/TheHUD";
import { GlobalStatusPanel } from "@/components/features/dashboard/GlobalStatusPanel";
import { Typewriter } from "@/components/ui/typewriter";
import { DashboardNav } from "@/components/core/DashboardNav";
import ConciergeModal from "@/components/core/ConciergeModal";
import { ExamFeedbackPopup } from "@/components/features/dashboard/ExamFeedbackPopup";

import { useAuth } from "@/context/AuthContext";
import { getLeaderboard, LeaderboardUser } from "@/lib/leaderboard";

export default function Page() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const {
    getCompletedCount,
    getCurrentPillarNumber,
    areAllPillarsComplete,
    chosenSpecialization,
    getCurrentSpecialization,
    canChooseSpecialization,
    getGlobalProgress
  } = useProgress();

  const completedCount = getCompletedCount();
  const currentRank = getRank(completedCount);
  const currentPillarNumber = getCurrentPillarNumber();
  const currentPillar = PILLARS[currentPillarNumber - 1];
  const currentSpec = getCurrentSpecialization();
  const globalProgress = getGlobalProgress();

  // NÃO mostrar DecisionMatrix automaticamente
  // O usuário acessa via HUD clicando no Pilar 10 (Especialidades)
  // Isso resolve o problema do botão "Voltar" não funcionar

  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [showCommsModal, setShowCommsModal] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Carregar Leaderboard
  useEffect(() => {
    async function loadData() {
      const data = await getLeaderboard(5);
      setLeaderboard(data);
    }
    loadData();
  }, []);

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
            onClick={() => router.push('/admin/dashboard')}
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
        <div className="absolute left-8 xl:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-start z-0 select-none max-w-[600px] pointer-events-none">
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
          className="absolute z-10 pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          {/* Globo (com ajuste fino isolado - 36px X, 20px Y no Desktop) */}
          <div className="transform transition-transform duration-300 lg:translate-x-[36px] lg:translate-y-[20px]">
            {/* Área clicável circular - apenas o globo */}
            <div
              onClick={handleGlobeClick}
              className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full overflow-hidden cursor-pointer pointer-events-auto hover:scale-105 transition-transform duration-300"
            >
              <RotatingEarth
                width={500}
                height={500}
                className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          {/* Conteúdo central sobre o globo - apenas números */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

            {/* Número de pilares ou progresso da especialização */}
            <div className="flex flex-col items-center">
              {completedCount === 9 ? (
                <div className="flex flex-col items-center">
                  <span
                    className="text-8xl md:text-[8rem] font-serif font-black"
                    style={{
                      color: '#ddd6fe',
                      textShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    {Math.min(100, Math.max(0, Math.round((globalProgress - 50) * 2))) + "%"}
                  </span>
                  <span
                    className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest mt-2"
                    style={{ color: '#a78bfa' }}
                  >
                    Especialização
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span
                    className="text-7xl md:text-9xl font-serif font-black tracking-tighter"
                    style={{
                      color: '#EEF4D4',
                      textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6)'
                    }}
                  >
                    {completedCount}
                    <span className="text-4xl md:text-6xl align-top ml-2 opacity-80">/9</span>
                  </span>
                  <span
                    className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.5em] mt-2"
                    style={{ color: '#EEF4D4', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                  >
                    PILARES
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Button e Nome do Pilar - FORA do globo, abaixo dele */}
        <div className="absolute z-20 pointer-events-auto flex flex-col items-center"
          style={{
            top: "calc(50% + 180px)",
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          {/* CTA Button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (currentSpec) router.push(`/especialidades/${currentSpec.id}`); else if (completedCount < 9) router.push(`/pilar/${currentPillarNumber}`);
              else router.push("/especialidades");
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
                  : completedCount === 9
                    ? "Escolher Especialidade"
                    : completedCount === 0
                      ? "Começar os Estudos"
                      : "Continuar Estudo"
                }
              </span>
            </span>
          </div>

          {/* Nome do pilar atual OU especialização */}
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
                  backgroundColor: 'rgba(238, 244, 212, 0.15)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                }}
              >
                {completedCount === 9 ? "Escolher Especialidade" : `Pilar ${currentPillarNumber}: ${currentPillar?.title || "Pilar 1"}`}
              </p>
            )}
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
