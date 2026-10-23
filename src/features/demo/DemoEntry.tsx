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
      <p className="eyebrow">Uma conversa. Muitas pequenas conquistas.</p>
      <h1>Do primeiro café<br />à despedida.</h1>
      <p className="lead">Você vai participar de uma história, escolher o que quer dizer e construir respostas com ajuda.</p>
      <p className="entry-details">Gratuita · Cerca de 30 minutos · No seu ritmo</p>
      <p>Você não precisa usar microfone.</p>
      <fieldset className="profile-options"><legend>Como você prefere começar?</legend>
        {profiles.map(option => <label key={option.id} className={`profile-option ${profile === option.id ? "selected" : ""}`}>
          <input type="radio" name="support" value={option.id} checked={profile === option.id} onChange={() => setProfile(option.id)} />
          <span><strong>{option.label}</strong><small>{option.description}</small></span>
        </label>)}
      </fieldset>
      <p className="muted">Você pode mudar o apoio durante a experiência.</p>
      <button className="primary" disabled={!profile} onClick={() => profile && onStart(profile)}>Começar a conversa <ArrowUpRight aria-hidden size={18} /></button>
    </div>
    <figure className="entry-art"><Image width={1536} height={1024} sizes="(max-width: 760px) 100vw, 50vw" priority src="/demo/cafe/v1/previews/counter.jpg" alt="Ilustração conceitual: uma cliente com café no balcão de uma cafeteria." /><figcaption>Uma cafeteria. Um primeiro encontro.<br /><span>Prévia visual conceitual</span></figcaption></figure>
  </section>;
}
