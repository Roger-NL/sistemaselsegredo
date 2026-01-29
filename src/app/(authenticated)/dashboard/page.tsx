"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { DevControls } from "@/components/core/DevControls";
import { useProgress } from "@/context/ProgressContext";
import { getRank } from "@/utils/ranks";
import { TubesBackground } from "@/components/ui/neon-flow";
import { PILLARS } from "@/data/curriculum";
import { TheHUD } from "@/components/core/TheHUD";
import { GlobalStatusPanel } from "@/components/features/dashboard/GlobalStatusPanel";
import { Typewriter } from "@/components/ui/typewriter";
import { DashboardNav } from "@/components/core/DashboardNav";

export default function Page() {
  const router = useRouter();
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

  const handleGlobeClick = () => {
    console.log("Opening HUD");
    setIsHUDOpen(true);
  };
  // Controle manual removido - valores fixados em 36px/20px no desktop


  // Pegar pilares com status para o HUD
  const pillarsWithStatus = useProgress().getPillarsWithStatus();

  return (
    <main className="relative min-h-screen min-h-[100dvh] w-full overflow-hidden text-white selection:bg-[#EEF4D4] selection:text-black flex items-center justify-center pointer-events-none">

      {/* Dashboard Navigation - Apple Bean Style */}
      <DashboardNav studentName="Rogério Augusto" />

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
              <span className="text-4xl font-black text-orange-400" style={{ textShadow: '0 0 20px rgba(251, 146, 60, 0.4)' }}>7</span>
              <span className="text-xs text-white/40">dias</span>
            </div>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-orange-500/50 to-transparent" />
          <div className="flex flex-col gap-0.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i < 7 ? 'bg-orange-400' : 'bg-white/20'}`}
                style={i < 7 ? { boxShadow: '0 0 6px rgba(251, 146, 60, 0.6)' } : {}}
              />
            ))}
          </div>
        </div>

        {/* Thin separator line */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Leaderboard - Minimal List */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Top Streaks</span>
          {[
            { name: "Maria S.", streak: 45 },
            { name: "João P.", streak: 32 },
            { name: "Ana C.", streak: 28 },
            { name: "Você", streak: 7, isYou: true },
            { name: "Carlos L.", streak: 5 },
          ].map((user, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-right ${user.isYou ? '' : ''}`}
            >
              <span className={`text-xs ${user.isYou ? 'text-orange-400 font-bold' : 'text-white/50'}`}>
                {user.name}
              </span>
              <span className={`text-[10px] font-mono ${user.isYou ? 'text-orange-300' : 'text-white/30'}`}>
                {user.streak}
              </span>
              <span className="text-[10px]">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : user.isYou ? '🔥' : '·'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center Stage (The Globe) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {/* Typewriter Effect - Hero Left (Desktop) */}
        <div className="absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-start z-0 pointer-events-none select-none max-w-[500px]">
          <h2 className="text-3xl xl:text-4xl font-bold text-white/40 tracking-widest font-mono mb-4 uppercase">
            Your Mission Is To
          </h2>
          <div className="min-h-[120px]">
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
              speed={80}
              className="text-5xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EEF4D4] via-emerald-400 to-cyan-400 tracking-tighter drop-shadow-[0_0_30px_rgba(238,244,212,0.3)] leading-[0.9] uppercase whitespace-pre-line"
              waitTime={4000}
              deleteSpeed={40}
              cursorChar={"_"}
              cursorClassName="text-[#EEF4D4] ml-2 animate-pulse text-5xl xl:text-7xl align-baseline"
            />
          </div>
        </div>

        {/* Typewriter Effect - Mobile (ACIMA do globo, não sobreposto) */}
        <div className="absolute top-[15%] left-0 right-0 flex lg:hidden flex-col items-center z-30 pointer-events-none select-none px-4 text-center">
          <h2 className="text-[10px] font-bold text-white/40 tracking-[0.2em] font-mono mb-1 uppercase">
            MISSION:
          </h2>
          <div className="h-[32px] flex items-center justify-center">
            <Typewriter
              text={[
                "UNLOCK FLUENCY",
                "MASTER ENGLISH",
                "NO BARRIERS",
                "ACCESS WORLD"
              ]}
              speed={60}
              className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EEF4D4] via-emerald-400 to-cyan-400 tracking-tighter drop-shadow-[0_0_10px_rgba(238,244,212,0.2)] leading-none uppercase"
              waitTime={2000}
              deleteSpeed={30}
              cursorChar={"_"}
              cursorClassName="text-[#EEF4D4] ml-1 animate-pulse text-lg"
            />
          </div>
        </div>

        <div
          className="absolute z-10 pointer-events-auto"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
          onClick={handleGlobeClick}
        >
          {/* Globo (com ajuste fino isolado - 36px X, 20px Y no Desktop) */}
          <div className="transform transition-transform duration-300 lg:translate-x-[36px] lg:translate-y-[20px]">
            <RotatingEarth
              width={500}
              height={500}
              className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Conteúdo central sobre o globo */}
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
                    {currentSpec ? Math.min(100, Math.max(0, Math.round((globalProgress - 50) * 2))) + "%" : "9/9"}
                  </span>
                  <span
                    className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest mt-2"
                    style={{ color: '#a78bfa' }}
                  >
                    {currentSpec ? "Especialização" : "Masterizado"}
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

              {/* CTA Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSpec) router.push(`/especialidade/${currentSpec.id}`);
                  else if (completedCount < 9) router.push(`/pilar/${currentPillarNumber}`);
                  else router.push("/especialidades");
                }}
                className="mt-6 md:mt-10 pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
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

              {/* Nome do pilar atual OU especialização (RESTAURADO) */}
              <div className="mt-3 text-center">
                {currentSpec ? (
                  <>
                    <p
                      className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full"
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
                    className="text-[10px] md:text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full"
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
        </div>
      </div>

      {/* Dev Controls */}
      <div className="pointer-events-auto">
        <DevControls />
      </div>
    </main>
  );
}
