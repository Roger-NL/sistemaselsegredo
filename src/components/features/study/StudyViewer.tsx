"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Lightbulb, Target, Zap, Play, Table as TableIcon, MessageSquare } from "lucide-react";
import { ContentBlock, PillarData } from "@/types/study";
import { cn } from "@/lib/utils";

interface StudyViewerProps {
  data: PillarData;
}

const BoxIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "box-goal":
      return <Target className="w-6 h-6 text-emerald-600" />;
    case "box-insight":
      return <Lightbulb className="w-6 h-6 text-cyan-600" />;
    case "box-warning":
      return <AlertCircle className="w-6 h-6 text-amber-600" />;
    case "box-action":
      return <Zap className="w-6 h-6 text-violet-600" />;
    case "pillar-end":
      return <CheckCircle2 className="w-8 h-8 text-emerald-600" />;
    default:
      return null;
  }
};

const BoxStyles = {
  "box-goal": "bg-emerald-50 border-emerald-200 text-emerald-900",
  "box-insight": "bg-cyan-50 border-cyan-200 text-cyan-900",
  "box-warning": "bg-amber-50 border-amber-200 text-amber-900",
  "box-action": "bg-violet-50 border-violet-200 text-violet-900",
  "pillar-end": "bg-emerald-50 border-emerald-200 text-emerald-900 text-center py-10",
};

export const StudyViewer = ({ data }: StudyViewerProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header (Dark Mode / Cosmos Style) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          {data.title}
        </h1>
        <p className="text-xl text-white/60 font-light leading-relaxed">
          {data.subtitle}
        </p>
      </motion.div>

      {/* Content Paper Container (Light Mode) */}
      <div className="bg-[#FDFDFD] text-slate-900 rounded-xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

        <div className="space-y-6">
          {data.blocks.map((block, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
              >
                <RenderBlock block={block} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RenderBlock = ({ block }: { block: ContentBlock }) => {
  // Handle Boxes
  if (block.type.startsWith("box-") || block.type === "pillar-end") {
    const boxClass = BoxStyles[block.type as keyof typeof BoxStyles] || "";
    
    return (
      <div
        className={cn(
          "rounded-lg border-l-4 p-6 my-8 relative overflow-hidden",
          boxClass
        )}
      >
        <div className="flex items-start gap-4 relative z-10">
            {block.type !== "pillar-end" && (
                <div className="mt-1 flex-shrink-0">
                    <BoxIcon type={block.type} />
                </div>
            )}
            
          <div className={cn("flex-1", block.type === "pillar-end" && "flex flex-col items-center")}>
            {block.type === "pillar-end" && (
                <div className="mb-4">
                     <BoxIcon type={block.type} />
                </div>
            )}
            {block.title && (
              <h4 className={cn("font-bold text-lg mb-2 opacity-90", block.type === "pillar-end" && "text-2xl")}>
                {block.title}
              </h4>
            )}
            <div className="text-base leading-relaxed opacity-90 prose-slate">
                 {Array.isArray(block.content) ? (
                    block.content.map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)
                 ) : (
                    <p>{block.content}</p>
                 )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle Standard Text & New Elements
  switch (block.type) {
    case "h2":
      return (
        <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6 border-l-4 border-violet-600 pl-4">
          {block.content}
        </h2>
      );
    case "h3":
      return (
        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">
          {block.content}
        </h3>
      );
    case "paragraph":
      return (
        <p className="text-lg text-slate-700 leading-relaxed mb-6 font-serif md:font-sans">
            {(block.content as string).split(/(\*\*.*?\*\*)/).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
      );
    case "list":
      return (
        <ul className="space-y-3 my-6 pl-4">
          {(block.content as string[]).map((item, i) => {
              const [title, desc] = item.split(':');
              return (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-2.5 flex-shrink-0" />
                    <span className="text-lg">
                        {desc ? (
                            <>
                                <strong className="text-slate-900">{title}:</strong>{desc}
                            </>
                        ) : (
                            <>{title}</>
                        )}
                    </span>
                </li>
              )
          })}
        </ul>
      );
    case "video":
      return (
        <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-xs uppercase tracking-widest">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Video Class</span>
                </div>
                <span className="text-white/60 text-xs font-mono">{block.title || "Material Complementar"}</span>
            </div>
            {/* Player de Vídeo Real */}
            <div className="aspect-video w-full bg-black relative">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={block.content as string} 
                    title={block.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                    className="absolute inset-0"
                />
            </div>
        </div>
      );
    case "table":
      return (
        <div className="my-10 rounded-xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{block.title || "Tabela de Referência"}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-slate-100">
                        {(block.content as string[]).map((row, i) => {
                            const cols = row.split('|');
                            return (
                                <tr key={i} className={i === 0 ? "bg-slate-50 font-bold text-slate-700" : "bg-white hover:bg-slate-50 transition-colors"}>
                                    {cols.map((col, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-nowrap text-slate-600 first:font-medium first:text-slate-900">
                                            {col}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      );
    case "dialogue":
      return (
        <div className="my-10 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roleplay: {block.title}</span>
            </div>
            <div className="p-6 space-y-4">
                {(block.content as string[]).map((line, i) => {
                    const [speaker, text] = line.split(':');
                    // Verifica se é o usuário falando (You, Você, Me)
                    const isMe = ["You", "Você", "Eu", "Me"].includes(speaker.trim());
                    
                    return (
                        <div key={i} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">
                                {speaker}
                            </span>
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative",
                                isMe 
                                    ? "bg-violet-600 text-white rounded-br-none" 
                                    : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                            )}>
                                {text}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      );
    default:
      return null;
  }
};
