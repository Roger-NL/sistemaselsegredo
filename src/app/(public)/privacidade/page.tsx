import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Privacidade", description: "Armazenamento local e privacidade na demo BasedSpeak." };
export default function PrivacyPage() {
  return <main className="demo-shell"><article className="legal"><Link href="/">← Voltar ao início</Link><h1>Privacidade</h1><p>Atualizado em 23 de outubro de 2026.</p>
    <h2>Sem conta e sem gravação</h2><p>Esta demo não pede nome, e-mail, telefone, dados financeiros ou acesso ao microfone. As falas em inglês fazem parte de uma história fictícia. Você não precisa gravar sua voz.</p>
    <h2>O que fica neste navegador</h2><p>Guardamos localmente um identificador aleatório da tentativa, seu apoio escolhido, ponto da história, decisões, blocos, ajuda consultada e falas ocorridas. Isso permite retomar a conversa e mostrar uma retrospectiva coerente. O rascunho da avaliação opcional também pode ficar neste dispositivo.</p>
    <p>Não há sincronização entre dispositivos. A tentativa fica no navegador até você recomeçar, limpar os dados do site ou o navegador remover esse armazenamento. Outras pessoas com acesso ao mesmo perfil do navegador podem ter acesso a esse conteúdo.</p>
    <h2>Avaliação e coleta</h2><p>Nesta prévia, o envio de avaliações e a telemetria remota estão desativados. Clicar em enviar não produz uma confirmação de recebimento. Evite incluir informações pessoais no rascunho. Qualquer coleta futura terá finalidade, responsável, contato e prazo de retenção informados antes de ser ativada.</p>
    <h2>Hospedagem e serviços</h2><p>A hospedagem pode registrar informações técnicas das requisições, como endereço IP, horário e URL, para funcionamento e segurança. A demo não usa cookies de autenticação nem carrega os serviços de conta, cobrança e agenda durante a conversa. A produção de mídia ocorre separadamente da visita.</p>
    <h2>Como apagar sua tentativa</h2><p>Use “Recomeçar” e confirme o descarte. Essa ação apaga somente a tentativa e a avaliação guardadas pela demo. Você também pode limpar os dados deste site nas configurações do navegador.</p>
    <p><Link href="/termos">Ler os termos de uso</Link></p>
  </article></main>;
}
