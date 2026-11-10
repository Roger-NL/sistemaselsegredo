"use client";
import { BrowserText } from "@/components/i18n/BrowserText";
import { AutoFit } from "@/components/core/AutoFit";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
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
  const formId = useId();
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
        if (result.accountCreated) { setMode("login"); setShowPassword(false); }
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
    <AutoFit className="signup-card-reading">
    <p className="landing-eyebrow">{reset ? <BrowserText>{"VAMOS RECUPERAR SEU ACESSO"}</BrowserText> : <BrowserText>{"SEU ESPAÇO NO BASEDSPEAK"}</BrowserText>}</p>
    <h1 id="signup-title">{reset ? <BrowserText>{"Esqueceu a senha?"}</BrowserText> : signup ? <BrowserText>{"Comece por aqui."}</BrowserText> : <BrowserText>{"Bom te ver de volta."}</BrowserText>}</h1>
    <p className="signup-intro">{reset ? <BrowserText>{"Informe o e-mail usado com sua senha. Se você entra com Google, volte e use Continuar com Google."}</BrowserText> : signup ? <BrowserText>{"Crie sua conta para guardar seu avanço e pedir sua aula gratuita após o estudo."}</BrowserText> : <BrowserText>{"Entre na sua conta para acessar seu painel."}</BrowserText>}</p>
    {signup && <p className="signup-approval-note">A conversa e o estudo são livres, sem cadastro nem aprovação. Com uma conta, seu percurso pode continuar em outros dispositivos.</p>}
    {!reset && <><button className="signup-google" type="button" disabled={busy} onClick={() => void authenticate(loginWithGoogle)}><span className="signup-google-mark" aria-hidden="true">G</span>Continuar com Google</button><div className="signup-divider"><span>ou com e-mail</span></div></>}
    <form id={formId} onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend className="signup-sr">{reset ? <BrowserText>{"Recuperação de senha"}</BrowserText> : signup ? <BrowserText>{"Criar conta por e-mail"}</BrowserText> : <BrowserText>{"Entrar por e-mail"}</BrowserText>}</legend>
        <label htmlFor="signup-email">E-mail<input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" /></label>
        {!reset && <label htmlFor="signup-password"><BrowserText>Senha</BrowserText><div className="signup-password"><input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 6 : undefined} required aria-describedby={signup ? "password-hint" : undefined} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></div>{signup && <small id="password-hint">Pelo menos 6 caracteres.</small>}</label>}
        {mode === "login" && <button type="button" className="signup-forgot" onClick={() => changeMode("reset")}>Esqueci minha senha</button>}
        {error && <p className="signup-error" role="alert" tabIndex={-1} ref={errorElement}><BrowserText>{error}</BrowserText></p>}
        {message && <p className="signup-message" role="status"><BrowserText>{message}</BrowserText></p>}
      </fieldset>
    </form>
    </AutoFit>
    <div className="signup-card-actions">
    <button type="submit" form={formId} disabled={busy} className="landing-cta signup-submit">{busy ? <><LoaderCircle size={17} className="signup-spinner" aria-hidden="true" /><BrowserText>Aguarde…</BrowserText></> : <>{reset ? <BrowserText>{"Enviar link de recuperação"}</BrowserText> : signup ? <BrowserText>{"Criar conta e continuar"}</BrowserText> : <BrowserText>{"Entrar no meu painel"}</BrowserText>}<ArrowUpRight size={18} aria-hidden="true" /></>}</button>
    {signup && <p className="signup-legal">Ao continuar, você concorda com os <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p>}
    <p className="signup-switch">{reset ? <BrowserText>{"Lembrou da senha?"}</BrowserText> : signup ? <BrowserText>{"Já tem uma conta?"}</BrowserText> : <BrowserText>{"Ainda não tem conta?"}</BrowserText>}<button type="button" disabled={busy} onClick={() => changeMode(signup || reset ? "login" : "signup")}>{signup || reset ? <BrowserText>{"Entrar"}</BrowserText> : <BrowserText>{"Criar conta"}</BrowserText>}</button></p>
    </div>
  </section>;
}
