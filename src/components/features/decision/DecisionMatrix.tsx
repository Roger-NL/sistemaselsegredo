"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard"; // Import correto
import { useProgress } from "@/context/ProgressContext";
import { PLANETS } from "@/data/curriculum";
import { Shield, Target, Map, Cpu, Zap, Activity, Lock, ArrowLeft, BookOpen, Briefcase, Plane, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

export const DecisionMatrix = () => {
  const router = useRouter();
  const {
    unlockSpecialization,
    chosenSpecialization,
    areAllPillarsComplete,
    canChooseSpecialization,
    getCompletedCount
  } = useProgress();

  const allComplete = areAllPillarsComplete();
  const canSelect = canChooseSpecialization();
  const completedCount = getCompletedCount();

  const [step, setStep] = useState<"intro" | "choice" | "diagnostic" | "result">("intro");
  const [analyzing, setAnalyzing] = useState(false);

  // Retorna ícone apropriado para cada especialidade
  const getSpecIcon = (id: string) => {
    switch (id) {
      case "spec-tech": return <Cpu className="w-6 h-6" />;
      case "spec-academic": return <BookOpen className="w-6 h-6" />;
      case "spec-finance": return <BarChart3 className="w-6 h-6" />;
      case "spec-interview": return <Briefcase className="w-6 h-6" />;
      case "spec-travel": return <Plane className="w-6 h-6" />;
      case "spec-business": return <Activity className="w-6 h-6" />;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 pointer-events-auto">
      {/* Botão Voltar */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-[#EEF4D4]/60 hover:text-[#EEF4D4] transition-colors font-mono text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </button>

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="max-w-2xl w-full"
          >
            <TacticalCard systemId="GLOBAL_CLEARANCE" status={canSelect ? "SECURE" : "CLASSIFIED"} variant="default">
              <div className="text-center space-y-6 py-8 px-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className={`w-24 h-24 border-2 border-dashed ${canSelect ? "border-[#EEF4D4]/30" : "border-violet-500/30"} rounded-full mx-auto flex items-center justify-center`}
                >
                  {canSelect ? (
                    <Shield className="w-10 h-10 text-[#EEF4D4]" />
                  ) : (
                    <Lock className="w-10 h-10 text-violet-400" />
                  )}
                </motion.div>

                <h1 className="text-4xl font-serif text-[#EEF4D4] tracking-widest uppercase">
                  {canSelect ? "Missão Global Concluída" : "Especialidades"}
                </h1>

                {!canSelect && (
                  <div className="bg-violet-500/10 border border-violet-500/30 px-4 py-2 inline-block">
                    <span className="text-violet-400 font-mono text-sm">
                      {completedCount}/9 PILARES COMPLETADOS
                    </span>
                  </div>
                )}

                <p className="text-gray-400 font-mono text-sm leading-relaxed max-w-md mx-auto">
                  {canSelect
                    ? "A criptografia do Currículo Base foi totalmente rompida. Agora você deve escolher sua especialização operacional."
                    : "Complete todos os 9 pilares do treinamento básico para desbloquear o acesso às especialidades. Você pode visualizar as opções disponíveis."
                  }
                </p>

                <div className="pt-8">
                  <TacticalButton
                    variant={canSelect ? "neon" : "default"}
                    onClick={() => setStep("choice")}
                    className="justify-center text-center uppercase tracking-widest font-bold"
                  >
                    {canSelect ? "Entrar no Painel de Decisão" : "Visualizar Especialidades"}
                  </TacticalButton>
                </div>
              </div>
            </TacticalCard>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANETS.map((planet) => (
                <div key={planet.id} className={`h-full ${!canSelect ? "opacity-60" : ""}`}>
                  <TacticalCard
                    systemId={`OP-${planet.id.toUpperCase()}`}
                    status={canSelect ? "CLASSIFIED" : "ENCRYPTED"}
                    variant="default"
                    hoverable={canSelect}
                    onClick={() => handleManualChoice(planet.id)}
                    className={`h-full flex flex-col justify-between p-6 ${!canSelect ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded flex items-center justify-center border ${canSelect ? "bg-white/5 border-white/10 text-[#EEF4D4]" : "bg-violet-500/5 border-violet-500/20 text-violet-400/50"}`}>
                        {!canSelect ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          getSpecIcon(planet.id)
                        )}
                      </div>
                      <h4 className={`text-xl font-bold tracking-tight uppercase ${canSelect ? "text-[#EEF4D4]" : "text-[#EEF4D4]/50"}`}>
                        {planet.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono leading-relaxed">
                        Desbloqueia protocolos de comunicação avançados para {planet.title.toLowerCase()}.
                      </p>
                    </div>
                    <div className="pt-6 flex justify-between items-center text-[10px] font-mono text-gray-600">
                      <span>STATUS: {canSelect ? "READY" : "LOCKED"}</span>
                      <span>0% DECODED</span>
                    </div>
                  </TacticalCard>
                </div>
              ))}
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
  );
};