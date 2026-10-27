"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/ui/Brand";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function authenticate(google = false) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const service = await import("@/client/auth/service");
      const result = await (google ? service.loginWithGoogle() : service.login(email.trim(), password));
      if (!result.success) throw new Error(result.error || "Não foi possível entrar.");
      const response = await fetch("/api/admin/workspace", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { await fetch("/api/auth/session", { method: "DELETE" }); await service.logout(); throw new Error("Esta conta não possui acesso ativo de manager."); }
        throw new Error("Não foi possível carregar a gestão. Tente novamente.");
      }
      router.replace("/adm"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível entrar. Tente novamente."); }
    finally { setBusy(false); }
  }
  async function resetPassword() {
    if (busy) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Informe seu e-mail para recuperar a senha."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await (await import("@/client/auth/service")).resetPassword(email.trim());
      if (!result.success) throw new Error(result.error || "Não foi possível solicitar a recuperação.");
      setNotice("Solicitação recebida. Confira o e-mail de recuperação da sua conta.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível recuperar a senha."); }
    finally { setBusy(false); }
  }
  return <main className="admin-login-shell"><section className="admin-login-intro"><Brand /><div><span className="admin-login-symbol"><ShieldCheck size={28} /></span><p className="admin-eyebrow">BASED SPEAK / MANAGEMENT</p><h1>Gestão,<br /> com clareza.</h1><p>Pessoas, jornadas e conversas.<br />Um só espaço para acompanhar cada passo.</p></div><Link href="/"><ArrowLeft size={14} />Voltar para o site</Link></section><section className="admin-login-form"><div><p className="admin-eyebrow">ÁREA ADMINISTRATIVA</p><h2>Bom ter você aqui.</h2><p>Entre com sua conta de manager.</p><form onSubmit={(event: FormEvent) => { event.preventDefault(); void authenticate(); }}><fieldset disabled={busy}><div className="admin-fields"><label>E-mail<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></label><label>Senha<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label></div><button type="button" className="admin-text-button" onClick={() => void resetPassword()}>Esqueci minha senha</button><button type="submit" className="admin-button admin-button-primary">{busy ? <LoaderCircle size={17} className="admin-spinner" /> : <><span>Entrar na gestão</span><ArrowRight size={16} /></>}</button><div className="admin-login-divider"><span>ou</span></div><button type="button" className="admin-button" onClick={() => void authenticate(true)}>Continuar com Google</button></fieldset></form>{error && <p className="admin-form-error" role="alert">{error}</p>}{notice && <p className="admin-dialog-note" role="status">{notice}</p>}<p className="admin-login-note">O acesso é exclusivo para contas autorizadas na administração.</p></div></section></main>;
}
