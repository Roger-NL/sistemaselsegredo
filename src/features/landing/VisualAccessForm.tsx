"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";

export function VisualAccessForm({ initialMode }: { initialMode: "signup" | "login" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const signup = mode === "signup";

  function enterPreview() { router.push("/dashboard"); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Inputs are decorative: never read, store or transmit credentials in visual mode.
    enterPreview();
  }

  return <section className="signup-card" data-mode={mode} aria-labelledby="signup-title">
    <p className="landing-eyebrow">PRÉVIA VISUAL · ACESSO LIVRE</p>
    <h1 id="signup-title">{signup ? "Comece por aqui." : "Bom te ver de volta."}</h1>
    <p className="signup-intro">Pode continuar sem preencher e-mail ou senha.</p>
    <button className="signup-google" type="button" onClick={enterPreview}><span className="signup-google-mark" aria-hidden="true">G</span>Continuar com Google</button>
    <div className="signup-divider"><span>ou com e-mail</span></div>
    <form onSubmit={submit} noValidate autoComplete="off">
      <fieldset>
        <legend className="signup-sr">Prévia visual de {signup ? "cadastro" : "login"}</legend>
        <label htmlFor="preview-email">E-mail<input id="preview-email" name="preview-email" type="email" autoComplete="off" placeholder="voce@exemplo.com" /></label>
        <label htmlFor="preview-password">Senha<div className="signup-password"><input id="preview-password" name="preview-password" type={showPassword ? "text" : "password"} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></div></label>
        {!signup && <button type="button" className="signup-forgot" onClick={() => setMessage("Nesta prévia, você pode entrar sem senha.")}>Esqueci minha senha</button>}
        {message && <p className="signup-message" role="status">{message}</p>}
        <button type="submit" className="landing-cta signup-submit">Continuar para o painel<ArrowUpRight size={18} aria-hidden="true" /></button>
      </fieldset>
    </form>
    <p className="signup-switch">{signup ? "Já tem uma conta?" : "Ainda não tem conta?"}<button type="button" onClick={() => { setMode(signup ? "login" : "signup"); setMessage(""); }}>{signup ? "Entrar" : "Criar conta"}</button></p>
  </section>;
}
