"use client";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";


import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { BellRing, Check, CircleAlert, LoaderCircle, Mail, RefreshCw } from "lucide-react";
import type { NotificationSettings as Settings, OperationalNotificationKind, OperationalNotificationStatus } from "@/contracts/notifications";
import "./notifications.css";

const eventLabels: Record<OperationalNotificationKind, string> = {
  new_signup: "Novo cadastro", conversation_completed: "Conversa da cafeteria concluída", study_completed: "Estudo guiado concluído",
  live_class_requested: "Pedido de aula gratuita", student_message: "Mensagem de aluno",
};
const statusLabels: Record<OperationalNotificationStatus, string> = {
  pending: "Na fila", processing: "Enviando", sent: "Aceito pelo serviço de e-mail", failed: "Falha no envio", needs_review: "Conferir envio",
};
const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function NotificationSettings({ accountId }: { accountId: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState<"load" | "save" | "process" | null>("load");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const epoch = useRef(0);

  const load = useCallback(async () => {
    const ticket = ++epoch.current;
    setBusy("load"); setError("");
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar os avisos.");
      if (ticket === epoch.current) { setSettings(result); setEmail(result.recipientEmail); setEnabled(result.enabled); }
    } catch (cause) { if (ticket === epoch.current) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os avisos."); }
    finally { if (ticket === epoch.current) setBusy(null); }
  }, []);

  useEffect(() => { void load(); const reference = epoch; return () => { reference.current++; }; }, [load, accountId]);

  async function change(action: "save" | "process", event?: FormEvent) {
    event?.preventDefault();
    if (!settings || busy) return;
    const ticket = epoch.current;
    setBusy(action); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/notifications", {
        method: action === "save" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "X-Workspace-Uid": accountId },
        body: JSON.stringify(action === "save" ? { recipientEmail: email.trim(), enabled } : { action: "process" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar os avisos.");
      if (ticket !== epoch.current) return;
      const next: Settings = action === "save" ? result : result.settings;
      setSettings(next); setEmail(next.recipientEmail); setEnabled(next.enabled);
      setNotice(action === "save" ? "Preferências de avisos salvas." : result.delivery.sent ? `${result.delivery.sent} aviso(s) aceito(s) pelo serviço de e-mail.` : result.delivery.review ? "Há envios que precisam ser conferidos. Consulte o histórico abaixo." : "Fila conferida. Novas tentativas respeitam o intervalo de envio.");
    } catch (cause) { if (ticket === epoch.current) setError(cause instanceof Error ? cause.message : "Não foi possível atualizar os avisos."); }
    finally { if (ticket === epoch.current) setBusy(null); }
  }

  return <section className="admin-notifications" aria-label="Avisos por e-mail">
    {error && <div className="admin-alert" role="alert"><span><BrowserText>{error}</BrowserText></span>{!settings && <button className="admin-text-button" type="button" onClick={() => void load()}>Tentar novamente</button>}</div>}
    {notice && <p className="admin-dialog-note" role="status"><Check size={16} aria-hidden="true" /><BrowserText>{notice}</BrowserText></p>}
    {!settings ? !error && <p role="status">Carregando os avisos…</p> : <>
      <section className="admin-card admin-notification-config">
        <header className="admin-card-heading"><div><h2><Mail size={21} aria-hidden="true" />Um e-mail para acompanhar tudo.</h2><p>Receba os novos passos dos alunos sem precisar manter a ADM aberta.</p></div></header>
        <div className="admin-notification-status" data-ready={settings.enabled && settings.configured}>
          {settings.enabled && settings.configured ? <Check size={20} aria-hidden="true" /> : <CircleAlert size={20} aria-hidden="true" />}
          <div><strong>{!settings.configured ? <BrowserText>{"Falta conectar o serviço de e-mail."}</BrowserText> : !settings.enabled ? <BrowserText>{"Envio pausado."}</BrowserText> : <BrowserText>{"Envio ativo."}</BrowserText>}</strong><p>{!settings.configured ? <BrowserText>{"Você pode salvar o responsável agora. Os avisos ficam na fila até o serviço de e-mail ser ativado."}</BrowserText> : !settings.enabled ? <BrowserText>{"Os eventos continuam registrados. Reative os avisos quando quiser voltar a receber."}</BrowserText> : <BrowserText>{`Os avisos serão enviados para ${settings.recipientEmail}.`}</BrowserText>}</p></div>
        </div>
        <form onSubmit={event => void change("save", event)}><fieldset disabled={Boolean(busy)} className="admin-fields">
          <label>E-mail responsável<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label className="admin-notification-toggle"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} /><span>Receber avisos por e-mail</span></label>
          <button className="admin-button admin-button-primary" type="submit">{busy === "save" ? <LoaderCircle size={16} className="admin-spinner" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}<BrowserText>Salvar preferências</BrowserText></button>
        </fieldset></form>
        {!settings.configured && <details className="admin-notification-setup"><summary>Como ativar o envio</summary><p>Conecte o Resend ao projeto BasedSpeak na Vercel e confirme o domínio remetente. O envio precisa de RESEND_API_KEY e NOTIFICATION_FROM_EMAIL nas variáveis de ambiente do servidor. Nenhuma chave deve ser colocada neste formulário.</p><a href="https://vercel.com/roger-chaves-projects/~/integrations/accept-terms/resend?source=cli" target="_blank" rel="noreferrer">Abrir configuração do serviço <InterfaceIcon name="arrow-up-right" /></a></details>}
        {settings.configured && !settings.cronConfigured && <p className="admin-notification-note">Os eventos novos são enviados na hora. A recuperação automática da fila ainda precisa ser ativada; por enquanto, confira os pendentes abaixo.</p>}
      </section>
      <section className="admin-card admin-notification-events"><header className="admin-card-heading"><div><h2><BellRing size={21} aria-hidden="true" />O que chega no seu e-mail</h2><p>Um aviso para cada novo evento, com acesso aos detalhes na ADM.</p></div></header><ul>{Object.entries(eventLabels).map(([kind, label]) => <li key={kind}><Check size={16} aria-hidden="true" /><BrowserText>{label}</BrowserText></li>)}</ul><p>Conclusões são avisadas uma vez por aluno. Revisitar atividades não gera novos avisos de conclusão.</p></section>
      <section className="admin-card admin-notification-history"><header className="admin-card-heading"><div><h2>Histórico de envios</h2><p><BrowserText>{settings.queuedCount}</BrowserText> <BrowserText>na fila · </BrowserText><BrowserText>{settings.attentionCount}</BrowserText> <BrowserText>para conferir. Últimos 20 eventos.</BrowserText></p></div><div className="admin-notification-actions"><button className="admin-button" type="button" disabled={Boolean(busy)} onClick={() => void load()}><RefreshCw size={15} aria-hidden="true" />Atualizar avisos</button><button className="admin-button" type="button" disabled={Boolean(busy) || !settings.configured || !settings.enabled || !settings.queuedCount} onClick={() => void change("process")}>{busy === "process" ? <BrowserText>{"Conferindo…"}</BrowserText> : <BrowserText>{"Processar pendentes"}</BrowserText>}</button></div></header>
        {settings.recent.length ? <ol>{settings.recent.map(item => <li key={item.id}><div><strong><BrowserText>{eventLabels[item.kind]}</BrowserText></strong><span>{item.studentName || <BrowserText>{"Aluno"}</BrowserText>} <BrowserText>· </BrowserText><BrowserText>{date(item.createdAt)}</BrowserText></span>{item.errorCode && <small>{item.status === "needs_review" ? <BrowserText>{"Confira no serviço de e-mail antes de fazer outro envio."}</BrowserText> : <BrowserText>{"O serviço não confirmou o envio. Consulte a configuração do e-mail."}</BrowserText>}</small>}</div><span className="admin-status" data-status={item.status}><BrowserText>{statusLabels[item.status]}</BrowserText></span></li>)}</ol> : <div className="admin-empty"><Mail size={25} aria-hidden="true" /><h3>Os próximos passos chegam aqui.</h3><p>Eventos novos serão registrados automaticamente. O histórico anterior dos alunos será preservado.</p></div>}
        <p className="admin-notification-note">A aceitação pelo serviço de e-mail não confirma a leitura nem a chegada à caixa de entrada.</p>
      </section>
    </>}
  </section>;
}
