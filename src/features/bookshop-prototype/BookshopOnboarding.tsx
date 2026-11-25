"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Lightbulb, MapPin, MessageCircle, RotateCcw, Save, Sparkles, UserRound } from "lucide-react";
import { guideSteps } from "./onboarding";
import { ViewportFit } from "./ViewportFit";
import { BookshopSpeech } from "./BookshopSpeech";
import { BookshopAudioButton } from "./BookshopAudioButton";

type Props = {
  step: number;
  returning: boolean;
  canSave: boolean;
  onStepChange: (step: number) => void;
  onFinish: () => void;
};

export function BookshopOnboarding({ step, returning, canSave, onStepChange, onFinish }: Props) {
  const [greeting, setGreeting] = useState<"Hello!" | "Hi!" | null>(null);
  const [book, setBook] = useState<"blue" | "red" | null>(null);
  const [assisted, setAssisted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const last = step === guideSteps.length - 1;

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const title = [
    "Você é Ben.",
    "Escolha como quer falar.",
    "Às vezes, você também age.",
    "Você tem apoio no caminho.",
    "A teoria vem depois do encontro.",
    returning ? "Vamos continuar de onde você parou?" : "Seu primeiro encontro começa agora.",
  ][step];

  return (
    <section className="bs-onboarding" aria-labelledby="bs-guide-title" data-step={step}>
      <ViewportFit><div className="bs-guide-content">
      <div className="bs-guide-meta"><span className="bs-eyebrow">Apresentação guiada</span><span className="bs-guide-count">No seu ritmo</span></div>
      <div className="bs-guide-dots" aria-label={"Passo " + (step + 1) + " de " + guideSteps.length}>
        {guideSteps.map((item, i) => <span key={item.id} className={i <= step ? "is-active" : ""} />)}
      </div>
      <h2 className="bs-guide-title" id="bs-guide-title" ref={heading} tabIndex={-1}>{title}</h2>

      {step === 0 && (
        <>
          <p className="bs-guide-copy">Bem-vindo à BasedSpeak. Você participa da história e escolhe o que Ben diz e faz.</p>
          <div className="bs-guide-profile">
            <span aria-hidden="true">B</span>
            <div className="bs-guide-profile-copy"><span className="bs-eyebrow">Seu personagem</span><strong>Ben, 21 anos</strong><p>Recém-chegado à cidade. Quer conhecer lugares e pessoas.</p></div>
          </div>
          <div className="bs-guide-facts">
            <p><MapPin size={19} aria-hidden="true" /><span><strong>Onde você está:</strong> na livraria Maple Books.</span></p>
            <p><BookOpen size={19} aria-hidden="true" /><span><strong>Quando:</strong> sábado à tarde, na sua primeira semana.</span></p>
            <p><UserRound size={19} aria-hidden="true" /><span><strong>Sua intenção:</strong> encontrar um lugar para ler e começar uma conversa.</span></p>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <p className="bs-guide-copy">Leia o contexto em português. Escolha uma das duas falas em inglês, sempre com tradução.</p>
          <div className="bs-guide-demo">
            <p className="bs-guide-demo-label">Exemplo do guia · fora da história</p>
            <p className="bs-guide-scene">Alguém sorri. Você quer cumprimentar.</p>
            <div className="bs-guide-choices" role="group" aria-label="Experimente uma forma de cumprimentar">
              {(["Hello!", "Hi!"] as const).map(en => (
                <div className="bs-guide-choice-row" key={en}>
                  <button type="button" className={"bs-guide-choice" + (greeting === en ? " is-selected" : "")} aria-pressed={greeting === en} onClick={() => setGreeting(en)}>
                    <span><strong lang="en" translate="no">{en}</strong><small>{en === "Hello!" ? "Olá!" : "Oi!"}</small></span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </button>
                  <BookshopAudioButton text={en} speaker="ben" compact />
                </div>
              ))}
            </div>
            {greeting && (
              <div className="bs-guide-reaction" role="status">
                <BookshopSpeech phrase={{ en: "Hi, Ben!", pt: "Oi, Ben!" }} speaker="Modelo" label="Resposta de exemplo" />
              </div>
            )}
          </div>
          <p className="bs-guide-copy">As duas opções funcionam. Na história, sua escolha provoca uma resposta e a conversa segue.</p>
          <p className="bs-hint"><Lightbulb size={16} aria-hidden="true" /><span>Experimente se quiser. O botão de escuta está em modo de teste.</span></p>
        </>
      )}

      {step === 2 && (
        <>
          <p className="bs-guide-copy">Os jogos fazem algo acontecer: ajudar, escolher um objeto ou deixar um recado. Há tradução e apoio.</p>
          <div className="bs-guide-demo">
            <p className="bs-guide-demo-label">Exemplo do guia · escolher um objeto</p>
            <p className="bs-guide-scene">Alguém pediu o livro azul. Qual você entrega?</p>
            <div className="bs-guide-objects" role="group" aria-label="Escolha o livro azul neste exemplo">
              {(["blue", "red"] as const).map(color => (
                <button type="button" className={"bs-guide-object" + (book === color ? " is-selected" : "")} aria-pressed={book === color} key={color} onClick={() => { setBook(color); setAssisted(false); }}>
                  <span className={"bs-guide-book is-" + color} aria-hidden="true"><BookOpen size={25} /></span>
                  <strong lang="en" translate="no">{color} book</strong><small>Livro {color === "blue" ? "azul" : "vermelho"}</small>
                </button>
              ))}
            </div>
            {book && <p className="bs-guide-feedback" role="status">{book === "red" ? "Esse é o vermelho. Tente o azul, use apoio ou continue a apresentação." : assisted ? "O apoio indicou o livro azul. Você pode seguir com ajuda." : "Você entrega o livro azul. A conversa pode continuar."}</p>}
            <button type="button" className="bs-skip" onClick={() => { setBook("blue"); setAssisted(true); }}><Lightbulb size={15} aria-hidden="true" /> Experimentar o apoio</button>
          </div>
          <div className="bs-guide-mini-note"><p>Para montar um recado, toque nas partes em ordem. Toque novamente para retirar.</p><div aria-label="Exemplo de partes de um bilhete em português"><span className="bs-guide-piece">Até</span><span className="bs-guide-piece">amanhã!</span></div></div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="bs-guide-copy">Você avança com cliques ou toques. Use estes apoios:</p>
          <div className="bs-guide-tools">
            <div className="bs-guide-tool"><MessageCircle size={22} aria-hidden="true" /><div><strong>Minha conversa</strong><p>Reveja suas falas e as respostas sem perder o ponto onde parou.</p></div></div>
            <div className="bs-guide-tool"><Lightbulb size={22} aria-hidden="true" /><div><strong>Uma pista, quando precisar</strong><p>A tradução já está visível. Nos jogos, uma pista ajuda; você também pode seguir com apoio.</p></div></div>
            <div className="bs-guide-tool"><RotateCcw size={22} aria-hidden="true" /><div><strong>Recomeçar</strong><p>Volta ao início deste teste. Você confirma antes de substituir suas escolhas.</p></div></div>
            <div className="bs-guide-tool"><Save size={22} aria-hidden="true" /><div><strong>Continuar depois</strong><p>{canSave ? "Seu avanço fica neste navegador. Ao voltar, você retoma de onde parou." : "Este navegador bloqueou o salvamento. Você pode continuar enquanto esta página estiver aberta."}</p></div></div>
          </div>
          <p className="bs-guide-copy">Reabra este guia em <strong>Como funciona</strong>, sem reiniciar a história.</p>
        </>
      )}

      {step === 4 && (
        <>
          <p className="bs-guide-copy">Você participa da conversa com tradução. As explicações detalhadas ficam para o final.</p>
          <div className="bs-guide-theory">
            <p className="bs-guide-demo-label">Depois de terminar a história</p>
            <div className="bs-guide-theory-row"><MessageCircle size={22} aria-hidden="true" /><div><strong>Reencontre suas falas.</strong><p>Reveja suas escolhas e o sentido delas na conversa.</p></div></div>
            <div className="bs-guide-theory-row"><BookOpen size={22} aria-hidden="true" /><div><strong>Entenda por partes.</strong><p>Veja como as expressões se formam e funcionam naquela situação.</p></div></div>
            <div className="bs-guide-theory-row"><Sparkles size={22} aria-hidden="true" /><div><strong>Conheça outra forma de dizer.</strong><p>Compare a outra opção válida para a mesma intenção.</p></div></div>
          </div>
          <p className="bs-guide-copy">No final, abra <strong>Entender o inglês que usei</strong> quando quiser.</p>
        </>
      )}

      {step === 5 && (
        <>
          <p className="bs-guide-copy">{returning ? "Você retoma da mesma cena. Suas escolhas e o rascunho do bilhete continuam guardados." : "Você entra na livraria como Ben. O contexto vem em português, e você escolhe como participar."}</p>
          <div className="bs-guide-checklist">
            <p><Check size={19} aria-hidden="true" /><span>Leia a situação em português.</span></p>
            <p><Check size={19} aria-hidden="true" /><span>Escolha uma fala com tradução ou faça a ação da cena.</span></p>
            <p><Check size={19} aria-hidden="true" /><span>Acompanhe a resposta e continue a história.</span></p>
            <p><Check size={19} aria-hidden="true" /><span>No final, explore a teoria da sua conversa.</span></p>
          </div>
          <div className="bs-guide-scene"><strong>Uma livraria. Uma conversa. Uma possível nova amizade.</strong></div>
        </>
      )}

      </div></ViewportFit>
      <footer className="bs-guide-footer">
        <button type="button" className="bs-secondary" disabled={step === 0} onClick={() => onStepChange(step - 1)}><ArrowLeft size={18} aria-hidden="true" /> Voltar</button>
        {!last && <button type="button" className="bs-guide-skip" onClick={onFinish}>{returning ? "Voltar à minha história" : "Pular apresentação"}</button>}
        <button type="button" className="bs-primary" onClick={() => last ? onFinish() : onStepChange(step + 1)}>{last ? returning ? "Continuar de onde parei" : "Entrar na história" : "Próximo"}<ArrowRight size={18} aria-hidden="true" /></button>
      </footer>
    </section>
  );
}
