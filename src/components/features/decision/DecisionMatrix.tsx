"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard"; // Import correto
import { useProgress } from "@/context/ProgressContext";
import { PLANETS } from "@/data/curriculum";
import { Shield, Target, Map, Cpu, Zap, Activity, Lock, ArrowLeft, BookOpen, Briefcase, Plane, BarChart3, ShoppingBag, Heart, Clapperboard, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export const DecisionMatrix = () => {
  const router = useRouter();
  const {
    unlockSpecialization,
    chosenSpecialization,
    areAllPillarsComplete,
    canChooseSpecialization,
    getCompletedCount,
    isSpecializationComplete
  } = useProgress();

  const allComplete = areAllPillarsComplete();
  const canSelect = canChooseSpecialization();
  const completedCount = getCompletedCount();

  const [step, setStep] = useState<"intro" | "choice" | "diagnostic" | "result">("intro");
  const [analyzing, setAnalyzing] = useState(false);

  // Retorna ícone apropriado para cada especialidade
  const getSpecIcon = (id: string) => {
    switch (id) {
      case "spec-popculture": return <Clapperboard className="w-6 h-6" />;
      case "spec-health": return <Heart className="w-6 h-6" />;
      case "spec-shopping": return <ShoppingBag className="w-6 h-6" />;
      case "spec-interview": return <Briefcase className="w-6 h-6" />;
      case "spec-travel": return <Plane className="w-6 h-6" />;
      case "spec-business": return <BarChart3 className="w-6 h-6" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  const handleManualChoice = (id: string) => {
    if (!canSelect) return; // Bloqueia se não pode selecionar
    unlockSpecialization(id);
    setStep("result");
  };

  const startDiagnostic = () => {
    if (!canSelect) return; // Bloqueia se não pode selecionar
    setStep("diagnostic");
    setAnalyzing(true);
    // Simula processamento
    setTimeout(() => {
      setAnalyzing(false);
      const randomSpec = PLANETS[Math.floor(Math.random() * PLANETS.length)].id;
      unlockSpecialization(randomSpec);
      setStep("result");
    }, 4000);
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl overflow-y-auto pointer-events-auto custom-scrollbar">
      <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-24 md:p-8">
        {/* Navegação Fixa */}
        <div className="fixed top-6 left-6 z-[200] flex items-center gap-4 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.back();
            }}
            className="flex items-center gap-2 text-[#EEF4D4]/60 hover:text-[#EEF4D4] transition-colors font-mono text-sm cursor-pointer bg-black/50 px-3 py-2 rounded border border-[#EEF4D4]/20 hover:border-[#EEF4D4]/50 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-[#EEF4D4]/30 hover:text-[#EEF4D4]/60 transition-colors font-mono text-xs cursor-pointer bg-black/20 px-3 py-2 rounded hover:bg-black/40 backdrop-blur-md"
          >
            Menu Principal
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="relative rounded-2xl p-0.5 sm:p-1">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={128}
                  inactiveZone={0.05}
                  borderWidth={2}
                  variant={canSelect ? "white" : "default"}
                  className={cn(
                    canSelect ? "[--glow-color:theme(colors.purple.500)]" : "[--glow-color:theme(colors.red.500)]"
                  )}
                />
                <div className="relative overflow-hidden rounded-xl border-[0.75px] border-white/10 bg-black/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                  {/* Decorative background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />

                  <div className="relative z-10 text-center flex flex-col items-center justify-center gap-5 md:gap-6">
                    <div className="flex justify-between items-center w-full border-b border-white/5 pb-3">
                      <span className="text-[9px] font-mono tracking-[0.15em] text-white/30 uppercase">
                        SYS_ID // GLOBAL_CLEARANCE
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${canSelect ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
                          {canSelect ? "SECURE" : "LOCKED"}
                        </span>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className={`w-20 h-20 md:w-28 md:h-28 border border-dashed ${canSelect ? "border-purple-500/30 bg-purple-500/5" : "border-red-500/30 bg-red-500/5"} rounded-full flex items-center justify-center relative group cursor-pointer flex-shrink-0`}
                      onClick={() => setStep("choice")}
                    >
                      <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${canSelect ? "bg-purple-500" : "bg-red-500"}`} />
                      {canSelect ? (
                        <Shield className="w-8 h-8 md:w-10 md:h-10 text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                      ) : (
                        <Lock className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                      )}
                    </motion.div>

                    <div className="space-y-2 md:space-y-3 max-w-sm">
                      <h1 className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/60 tracking-widest uppercase drop-shadow-sm leading-tight">
                        {canSelect ? "Missão Concluída" : "Acesso Restrito"}
                      </h1>
                      <p className="text-white/50 font-mono text-[10px] md:text-xs leading-relaxed px-2">
                        {canSelect
                          ? "Criptografia rompida. Protocolos de especialização disponíveis."
                          : "Necessário completar todos os 9 pilares para desbloquear."
                        }
                      </p>
                    </div>

                    {!canSelect && (
                      <div className="w-full max-w-[200px] flex flex-col gap-2">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${(completedCount / 9) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-white/40">
                          <span>PROGRESSO</span>
                          <span>{Math.round((completedCount / 9) * 100)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 w-full flex justify-center">
                      <button
                        onClick={() => setStep("choice")}
                        className={cn(
                          "group relative px-6 py-3 w-full sm:w-auto min-w-[180px] font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm",
                          canSelect
                            ? "bg-white text-black hover:bg-purple-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                            : "bg-transparent text-white/70 border border-white/20 hover:bg-white/10 hover:border-white/40 cursor-pointer"
                        )}
                      >
                        {canSelect ? "Acessar Painel" : "Visualizar Opções"}
                        {canSelect && <div className="absolute inset-0 -z-10 bg-purple-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-[#EEF4D4] font-mono text-xs tracking-[0.5em] mb-2 uppercase">Selection Panel</h2>
                <h3 className="text-3xl text-white font-serif tracking-widest">
                  {canSelect ? "ESCOLHA SUA PRÓXIMA MISSÃO" : "ESPECIALIDADES DISPONÍVEIS"}
                </h3>
                {!canSelect && (
                  <p className="text-violet-400/80 font-mono text-sm mt-4">
                    Complete os 9 pilares para desbloquear a seleção
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {PLANETS.map((planet) => {
                  const isCompleted = isSpecializationComplete(planet.id);
                  return (
                    <div key={planet.id} className={`group relative h-full rounded-xl p-1 transition-all duration-300 ${!canSelect ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => handleManualChoice(planet.id)}
                    >
                      <GlowingEffect
                        spread={40}
                        glow={canSelect}
                        disabled={!canSelect}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                        variant={isCompleted ? "white" : "default"}
                        className={cn(
                          isCompleted && "[--glow-color:theme(colors.emerald.500)]",
                          !isCompleted && canSelect && "[--glow-color:theme(colors.violet.500)]",
                          !canSelect && "[--glow-color:theme(colors.zinc.500)]"
                        )}
                      />

                      <div className={cn(
                        "relative flex h-full flex-col justify-between overflow-hidden rounded-lg border-[0.75px] bg-[#050505] p-4 sm:p-5 shadow-sm transition-all",
                        isCompleted ? "border-emerald-500/30 bg-emerald-950/10" :
                          canSelect ? "border-white/10 group-hover:border-violet-500/30 bg-black" :
                            "border-white/5 bg-black"
                      )}>
                        {/* System Header (Simulating TacticalCard) */}
                        <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                          <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
                            OP-{planet.id.replace("spec-", "").toUpperCase()}
                          </span>
                          <span className={cn(
                            "font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            isCompleted ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                              canSelect ? "border-white/10 text-white/50 bg-white/5" :
                                "border-white/5 text-white/20 bg-white/5"
                          )}>
                            {isCompleted ? "COMPLETED" : (canSelect ? "CLASSIFIED" : "ENCRYPTED")}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className={cn(
                            "w-10 h-10 rounded flex items-center justify-center border transition-colors",
                            isCompleted ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                              canSelect ? "bg-white/5 border-white/10 text-[#EEF4D4] group-hover:border-violet-500/50 group-hover:text-violet-300 group-hover:bg-violet-500/10" :
                                "bg-violet-500/5 border-violet-500/20 text-violet-400/50"
                          )}>
                            {!canSelect ? (
                              <Lock className="w-4 h-4" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              getSpecIcon(planet.id)
                            )}
                          </div>
                          <h4 className={cn(
                            "text-lg font-bold tracking-tight uppercase transition-colors leading-tight",
                            isCompleted ? "text-emerald-400" :
                              canSelect ? "text-[#EEF4D4] group-hover:text-violet-200" :
                                "text-[#EEF4D4]/50"
                          )}>
                            {planet.title}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono leading-relaxed">
                            Desbloqueia protocolos de comunicação avançados para {planet.title.toLowerCase()}.
                          </p>
                        </div>

                        <div className="pt-4 flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-gray-600 border-t border-white/5 mt-3">
                          <span>STATUS: {isCompleted ? "MISSION ACCOMPLISHED" : (canSelect ? "READY" : "LOCKED")}</span>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canSelect && (
                <div className="mt-12 text-center flex justify-center">
                  <button
                    onClick={startDiagnostic}
                    className="group relative px-10 py-4 overflow-hidden rounded bg-purple-500/5 hover:bg-purple-500/10 transition-all border border-purple-500/20 hover:border-purple-500/50"
                  >
                    <span className="relative z-10 text-purple-400 font-mono text-xs tracking-widest flex items-center gap-3">
                      <Cpu className="w-4 h-4 animate-pulse" />
                      ANALISAR PERFIL (RECOMENDAÇÃO TÁTICA)
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === "diagnostic" && (
            <motion.div key="diagnostic" className="text-center space-y-8">
              <div className="relative w-48 h-48 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-purple-500 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-b-2 border-cyan-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[#EEF4D4] font-mono text-xl tracking-tighter">ANALISANDO OPERATIVO...</h3>
                <div className="font-mono text-[10px] text-gray-500 max-w-xs mx-auto text-left space-y-1 opacity-50">
                  <p>{">"} SCANNING NEURAL PATTERNS...</p>
                  <p>{">"} EVALUATING MISSION HISTORY...</p>
                  <p>{">"} CALIBRATING TACTICAL PARAMETERS...</p>
                  <p>{">"} DETECTING CORE STRENGTHS...</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div key="result" className="max-w-md w-full text-center space-y-8">
              <TacticalCard systemId="DEPLOYMENT" status="SECURE" variant="success">
                <div className="py-8 px-6 space-y-6">
                  <div className="text-emerald-400 font-mono text-xs animate-pulse">DECRYPTION SUCCESSFUL</div>
                  <h2 className="text-3xl text-[#EEF4D4] font-serif uppercase tracking-widest">
                    {PLANETS.find(p => p.id === chosenSpecialization)?.title}
                  </h2>
                  <p className="text-gray-400 font-mono text-xs leading-relaxed">
                    Seu perfil foi vinculado a esta operação. O treinamento avançado começa agora.
                  </p>
                  <TacticalButton
                    variant="success"
                    onClick={() => router.push(`/especialidade/${chosenSpecialization}`)}
                    className="justify-center text-center uppercase text-xs tracking-widest font-bold"
                  >
                    Iniciar Operação
                  </TacticalButton>
                </div>
              </TacticalCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};