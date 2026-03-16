"use client";

import { X, Star } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import { RANK_DETAILS } from "@/utils/ranks";
import { cn } from "@/lib/utils";

interface RankGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRankIndex: number;
}

export function RankGuideModal({
  isOpen,
  onClose,
  currentRankIndex,
}: RankGuideModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      zIndexClassName="z-[10000]"
      panelClassName="w-full max-w-2xl"
    >
      <div className="overflow-hidden rounded-3xl border border-[#EEF4D4]/20 bg-[#05070B]/95 shadow-[0_0_40px_rgba(238,244,212,0.08)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[#EEF4D4]/5 px-5 py-4 md:px-6">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#EEF4D4]/45">
              Patentes do Sistema
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#EEF4D4] md:text-2xl">
              Todas as patentes disponiveis
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Sua evolucao percorre 10 niveis, do primeiro acesso ate o comando total.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fechar modal de patentes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 md:px-6">
          <div className="space-y-3">
            {RANK_DETAILS.map((rank, index) => {
              const isCurrent = index === currentRankIndex;

              return (
                <div
                  key={rank.name}
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition-all",
                    isCurrent
                      ? "border-[#EEF4D4]/45 bg-[#EEF4D4]/10 shadow-[0_0_25px_rgba(238,244,212,0.08)]"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                            isCurrent
                              ? "border-[#EEF4D4]/50 bg-[#EEF4D4]/15 text-[#EEF4D4]"
                              : "border-white/10 bg-white/5 text-white/70"
                          )}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-white md:text-base">
                            {rank.name}
                          </h3>
                          {isCurrent && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#EEF4D4]/30 bg-[#EEF4D4]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#EEF4D4]">
                              <Star className="h-3 w-3" />
                              Sua patente atual
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 pl-11 text-sm leading-relaxed text-white/60">
                        {rank.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
