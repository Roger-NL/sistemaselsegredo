"use client";

import { useRouter } from "next/navigation";
import { FlightButton } from "@/components/ui/FlightCard";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Target,
  Briefcase,
  Plane,
  ShoppingBag,
  Heart,
  Clapperboard,
  BarChart3,
} from "lucide-react";
import { SPECIALIZATIONS_CONTENT } from "@/data/specializations-content";
import { PLANETS } from "@/data/curriculum";
import { ROUTES } from "@/lib/routes";
import { StudyViewer } from "@/features/study/StudyViewer";
import { useProgress } from "@/context/ProgressContext";

const SPEC_ICONS: Record<string, React.ReactNode> = {
  "spec-popculture": <Clapperboard className="w-8 h-8" />,
  "spec-health": <Heart className="w-8 h-8" />,
  "spec-shopping": <ShoppingBag className="w-8 h-8" />,
  "spec-interview": <Briefcase className="w-8 h-8" />,
  "spec-travel": <Plane className="w-8 h-8" />,
  "spec-business": <BarChart3 className="w-8 h-8" />,
};

interface SpecializationStudyPageProps {
  specId: string;
}

export function SpecializationStudyPage({ specId }: SpecializationStudyPageProps) {
  const router = useRouter();
  const { finishCurrentSpecialization } = useProgress();
  const spec = PLANETS.find((planet) => planet.id === specId);
  const content = SPECIALIZATIONS_CONTENT[specId];

  if (!spec || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="flex items-center gap-4">
          <p className="text-white/70">Especialidade não encontrada ou em desenvolvimento.</p>
          <FlightButton onClick={() => router.push(ROUTES.app.specialties)}>Voltar</FlightButton>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    finishCurrentSpecialization();
    router.push(ROUTES.home);
  };

  return (
    <main className="min-h-screen w-full p-4 md:p-12 pointer-events-auto">
      <div className="flex items-center justify-between mb-6 md:mb-12 relative z-50 pointer-events-auto">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#EEF4D4]/60 hover:text-[#EEF4D4] transition-colors font-mono text-sm px-4 py-2 border border-[#EEF4D4]/20 rounded hover:border-[#EEF4D4]/40 hover:bg-[#EEF4D4]/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.home)}
            className="flex items-center gap-2 text-[#EEF4D4]/30 hover:text-[#EEF4D4]/60 transition-colors font-mono text-xs"
          >
            Menu Principal
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-violet-400 font-mono uppercase tracking-widest">
            SPECIAL OPS: {spec.title}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              {SPEC_ICONS[specId] || <Target className="w-10 h-10" />}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#EEF4D4] tracking-wide mb-2">
                {spec.title}
              </h1>
              <p className="text-gray-400 font-mono text-sm max-w-2xl">{content.subtitle}</p>
            </div>
          </div>
        </motion.div>

        <StudyViewer data={content} />

        <div className="mt-12 flex justify-center pb-20">
          <FlightButton
            variant="success"
            onClick={handleComplete}
            className="px-8 py-4 text-lg tracking-widest uppercase font-bold"
          >
            <span className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              Concluir Sessão de Estudo
            </span>
          </FlightButton>
        </div>
      </div>
    </main>
  );
}
