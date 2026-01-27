"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { DevControls } from "@/components/core/DevControls";
import { useProgress } from "@/context/ProgressContext";
import { getRank } from "@/utils/ranks";
import { TubesBackground } from "@/components/ui/neon-flow";
import { PILLARS } from "@/data/curriculum";
import { DecisionMatrix } from "@/components/features/decision/DecisionMatrix";
import { TheHUD } from "@/components/core/TheHUD";

export default function Page() {
  const router = useRouter();
  const {
    getCompletedCount,
    getCurrentPillarNumber,
    areAllPillarsComplete,
    chosenSpecialization,
    getCurrentSpecialization,
    canChooseSpecialization
  } = useProgress();

  const completedCount = getCompletedCount();
  const currentRank = getRank(completedCount);
  const currentPillarNumber = getCurrentPillarNumber();
  const currentPillar = PILLARS[currentPillarNumber - 1];
  const currentSpec = getCurrentSpecialization();

  // Mostra Matrix APENAS se completou tudo E NÃO tem especialização escolhida ainda
  // Se já tem especialização, o usuário acessa via HUD ou botão "Continuar Estudo"
  const showDecisionMatrix = areAllPillarsComplete() && !chosenSpecialization;

  const [isHUDOpen, setIsHUDOpen] = useState(false);

  const handleGlobeClick = () => {
    console.log("Opening HUD");
    setIsHUDOpen(true);
  };

  // Pegar pilares com status para o HUD
  const pillarsWithStatus = useProgress().getPillarsWithStatus();

  return (
    <TubesBackground
      className="min-h-[100dvh]"
    >
      <main className="relative min-h-[100dvh] w-full overflow-hidden text-white selection:bg-[#EEF4D4] selection:text-black flex items-center justify-center pointer-events-none">

        {/* Renderiza Matrix de Decisão se necessário */}
        {showDecisionMatrix && <DecisionMatrix />}

        {/* HUD - Menu de Pilares */}
        <TheHUD
          isOpen={isHUDOpen}
          onClose={() => setIsHUDOpen(false)}
          pillars={pillarsWithStatus}
          completedCount={completedCount}
        />

        {/* Top Bar (Header) */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white">
              <span className="text-[#EEF4D4]">ES</span> Academy
            </h1>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.3em]">System V4.0</span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] text-[#EEF4D4] uppercase tracking-widest font-mono mb-1">Patente Atual</span>
            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded backdrop-blur-sm">
              <span className="font-bold text-sm uppercase text-white">{currentRank}</span>
            </div>
          </div>
        </header>

        {/* Center Stage (The Globe) */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div
            onClick={handleGlobeClick}
            className={`relative group flex items-center justify-center pointer-events-auto cursor-pointer`}
          >
            <RotatingEarth
              width={500}
              height={500}
              className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Center Content - Pillar Counter + CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="text-center flex flex-col items-center">
                {/* Contador de Pilares */}
                <span
                  className="block text-7xl md:text-9xl font-serif font-black tracking-tighter"
                  style={{
                    color: '#EEF4D4',
                    textShadow: '0 0 30px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6)'
                  }}
                >
                  {completedCount}
                  <span className="text-4xl md:text-6xl align-top ml-2 opacity-80" style={{ color: '#EEF4D4' }}>/9</span>
                </span>

                <span
                  className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.5em] mt-[-5px] md:mt-[-8px]"
                  style={{
                    color: '#EEF4D4',
                    textShadow: '0 2px 8px rgba(0,0,0,0.7)'
                  }}
                >
                  PILARES
                </span>

                {/* CTA Button */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentSpec) {
                      router.push(`/especialidade/${currentSpec.id}`);
                    } else {
                      handleGlobeClick();
                    }
                  }}
                  className="mt-6 md:mt-8 transition-all duration-300 group-hover:translate-y-1 pointer-events-auto cursor-pointer relative z-50 hover:scale-110 active:scale-95"
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
                      {currentSpec ? "Continuar Estudo" : (completedCount === 9 ? "Acessar Sistema" : "Acessar Missão")}
                    </span>
                  </span>

                  {/* Nome do pilar atual OU especialização */}
                  <div className="mt-3 text-center">
                    {currentSpec ? (
                      <>
                        <p className="text-violet-400 text-xs uppercase tracking-wider font-medium">
                          {currentSpec.title}
                        </p>
                        <div className="mt-2 w-32 mx-auto">
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                              style={{ width: '0%' }} // TODO: Conectar progresso real
                            />
                          </div>
                          <p className="text-[9px] text-violet-400/60 mt-1 font-mono">0% concluído</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-tighter">
                        {completedCount === 9 ? "Sistema Operacional" : (currentPillar?.title || "Pilar 1")}
                      </p>
                    )}
                  </div>
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
    </TubesBackground>
  );
}
