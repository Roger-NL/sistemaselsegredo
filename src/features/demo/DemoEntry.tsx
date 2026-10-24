"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { profiles } from "./content/copy.pt-BR";
import type { SupportProfile } from "./model/types";

export function DemoEntry({ onStart }: { onStart: (profile: SupportProfile) => void }) {
  const [profile, setProfile] = useState<SupportProfile | null>(null);
  return <section className="entry-grid">
    <div className="entry-copy">
      <h1>Do primeiro café<br />à despedida.</h1>
      <p className="lead">Participe de uma conversa em inglês e construa respostas com ajuda.</p>
      <p className="entry-details">Gratuita · Cerca de 30 minutos · Sem microfone</p>
      <fieldset className="profile-options"><legend>Como você prefere começar?</legend>
        {profiles.map(option => <label key={option.id} className={`profile-option ${profile === option.id ? "selected" : ""}`}>
          <input type="radio" name="support" value={option.id} checked={profile === option.id} onChange={() => setProfile(option.id)} />
          <span><strong>{option.label}</strong><small>{option.description}</small></span>
        </label>)}
      </fieldset>
      <button className="primary" disabled={!profile} onClick={() => profile && onStart(profile)}>Começar a conversa <ArrowUpRight aria-hidden size={18} /></button>
    </div>
    <figure className="entry-art"><picture><source media="(max-width: 760px)" srcSet="/demo/cafe/v2/images/V01-640.webp" /><Image width={960} height={640} unoptimized src="/demo/cafe/v2/images/V01-960.webp" alt="Lucas e based no balcão da cafeteria, com seus nomes nos copos." /></picture><figcaption>Uma cafeteria. Um primeiro encontro.</figcaption></figure>
  </section>;
}
