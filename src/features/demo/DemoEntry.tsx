"use client";

import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { profiles } from "./content/copy.pt-BR";
import type { SupportProfile } from "./model/types";

export function DemoEntry({ onStart }: { onStart: (profile: SupportProfile) => void }) {
  const [profile, setProfile] = useState<SupportProfile | null>(null);
  const welcome = <><h1>Do primeiro café<br />à despedida.</h1><p className="lead">Uma conversa em inglês, com ajuda no seu ritmo.</p><p className="entry-details">Gratuita · Cerca de 30 minutos · Sem microfone</p></>;
  return <section className="entry-grid">
    <div className="entry-intro">
      <header className="entry-welcome">{welcome}</header>
      <figure className="entry-art"><picture><source media="(max-width: 760px)" srcSet="/demo/cafe/v2/images/V01-640.webp" /><Image width={960} height={640} unoptimized src="/demo/cafe/v2/images/V01-960.webp" alt="Lucas e based no balcão da cafeteria, com seus nomes nos copos." /></picture></figure>
    </div>
    <div className="entry-copy"><div className="entry-reading"><header className="entry-mobile-welcome">{welcome}</header>
      <fieldset className="profile-options" aria-describedby="entry-support-note"><legend>Como você prefere começar?</legend>
        <p id="entry-support-note">Você pode mudar o apoio depois.</p>
        <div className="profile-list">{profiles.map(option => <label key={option.id} className={`profile-option ${profile === option.id ? "selected" : ""}`}>
          <input type="radio" name="support" value={option.id} checked={profile === option.id} onChange={() => setProfile(option.id)} />
          <span className="profile-option-copy"><strong>{option.label}</strong><small><span className="desktop-context">{option.description}</span><span className="mobile-context">{option.mobileDescription}</span></small></span>
          <span className="profile-indicator" aria-hidden="true">{profile === option.id && <Check size={14} strokeWidth={2.5} />}</span>
        </label>)}</div>
      </fieldset>
      </div>
      <div className="entry-start-actions"><button className="primary" disabled={!profile} onClick={() => profile && onStart(profile)}>Começar a conversa <ArrowUpRight aria-hidden size={18} /></button></div>
    </div>
  </section>;
}
