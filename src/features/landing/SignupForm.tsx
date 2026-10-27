"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { login, loginWithGoogle, register, resetPassword, type AuthResult } from "@/client/auth/service";

type Mode = "signup" | "login" | "reset";

export function SignupForm({ initialMode }: { initialMode: "signup" | "login" }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const errorElement = useRef<HTMLParagraphElement>(null);
  const signup = mode === "signup";
  const reset = mode === "reset";

  function changeMode(next: Mode) {
    setMode(next); setError(""); setMessage(""); setShowPassword(false);
  }

  async function authenticate(action: () => Promise<AuthResult>, recovery = false) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await action();
      if (!result.success) {
        setError(result.error || "Não foi possível continuar. Tente novamente.");
        requestAnimationFrame(() => errorElement.current?.focus());
      } else if (recovery) {
        setMessage("Se houver uma conta com este e-mail, você receberá um link para criar uma nova senha. Confira também o spam.");
      } else {
        router.replace("/dashboard"); router.refresh();
      }
    } catch {
      setError("Não foi possível conectar. Confira sua conexão e tente novamente.");
      requestAnimationFrame(() => errorElement.current?.focus());
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    // The demo never uses a personal name; do not add a field just to fill the profile.
    void authenticate(() => reset ? resetPassword(email) : signup ? register("Usuário", email, password, password) : login(email, password), reset);
  }

  return <section className="signup-card" data-mode={mode} aria-labelledby="signup-title" aria-busy={busy}>
    <p className="landing-eyebrow">{reset ? "VAMOS RECUPERAR SEU ACESSO" : "SEU ESPAÇO NO BASEDSPEAK"}</p>
    <h1 id="signup-title">{reset ? "Esqueceu a senha?" : signup ? "Comece por aqui." : "Bom te ver de volta."}</h1>
    <p className="signup-intro">{reset ? "Informe seu e-mail para receber um link de recuperação." : signup ? "Crie sua conta e comece sua jornada." : "Entre na sua conta para acessar seu painel."}</p>
    {!reset && <><button className="signup-google" type="button" disabled={busy} onClick={() => void authenticate(loginWithGoogle)}><span className="signup-google-mark" aria-hidden="true">G</span>Continuar com Google</button><div className="signup-divider"><span>ou com e-mail</span></div></>}
    <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend className="signup-sr">{reset ? "Recuperação de senha" : signup ? "Criar conta por e-mail" : "Entrar por e-mail"}</legend>
        <label htmlFor="signup-email">E-mail<input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" /></label>
        {!reset && <label htmlFor="signup-password">Senha<div className="signup-password"><input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 6 : undefined} required aria-describedby={signup ? "password-hint" : undefined} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></div>{signup && <small id="password-hint">Pelo menos 6 caracteres.</small>}</label>}
        {mode === "login" && <button type="button" className="signup-forgot" onClick={() => changeMode("reset")}>Esqueci minha senha</button>}
        {error && <p className="signup-error" role="alert" tabIndex={-1} ref={errorElement}>{error}</p>}
        {message && <p className="signup-message" role="status">{message}</p>}
        <button type="submit" className="landing-cta signup-submit">{busy ? <><LoaderCircle size={17} className="signup-spinner" aria-hidden="true" />Aguarde…</> : <>{reset ? "Enviar link de recuperação" : signup ? "Criar conta e continuar" : "Entrar no meu painel"}<ArrowUpRight size={18} aria-hidden="true" /></>}</button>
      </fieldset>
    </form>
    {signup && <p className="signup-legal">Ao continuar, você concorda com os <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p>}
    <p className="signup-switch">{reset ? "Lembrou da senha?" : signup ? "Já tem uma conta?" : "Ainda não tem conta?"}<button type="button" disabled={busy} onClick={() => changeMode(signup || reset ? "login" : "signup")}>{signup || reset ? "Entrar" : "Criar conta"}</button></p>
  </section>;
}
