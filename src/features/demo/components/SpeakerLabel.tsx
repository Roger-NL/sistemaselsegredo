import { Coffee, UserRound } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import "./speaker-label.css";
import "./dialogue-typography.css";

export function SpeakerLabel({ role, model = false }: { role: "character" | "you"; model?: boolean }) {
  const Icon = role === "character" ? Coffee : UserRound;
  return <p className="speaker-label" data-speaker={role}><span className="speaker-label-icon"><Icon size={14} aria-hidden="true" /></span><strong><BrowserText>{role === "character" ? "Lucas" : "Você"}</BrowserText></strong><span className="speaker-label-detail"><BrowserText>{role === "character" ? "fala dele" : model ? "modelo da sua resposta" : "sua resposta"}</BrowserText></span></p>;
}
