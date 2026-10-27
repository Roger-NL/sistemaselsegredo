import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Termos de uso", description: "Sobre a experiência da cafeteria e a conta BasedSpeak." };
export default function TermsPage() {
  return <main className="demo-shell"><article className="legal"><Link href="/">← Voltar ao início</Link><h1>Termos de uso</h1><p>Atualizado em 27 de outubro de 2026.</p>
    <h2>A experiência</h2><p>A demo BasedSpeak é uma conversa guiada fictícia em uma cafeteria. O fluxo da página inicial oferece uma conta gratuita por Google ou e-mail antes de começar. A prática em <Link href="/demo">/demo</Link> e o estudo exigem uma conta ativa; cadastros novos aguardam aprovação da gestão. Não há pagamento, gravação de voz ou microfone. Você pode pedir ajuda, escolher como participar e encerrar quando quiser.</p>
    <h2>A conta e o curso</h2><p>Criar uma conta não gera cobrança nem contratação de um plano. A conta permite salvar e retomar conversa e estudo em outros dispositivos, após confirmação do salvamento, acompanhar atividades e conversar com o professor pelo painel. A próxima etapa do curso ainda está em preparação; não há oferta comercial, preço ou acesso a um curso completo nesta página.</p>
    <h2>Aprender com apoio</h2><p>A experiência permite construir respostas e participar de um diálogo com ajuda. Não é um teste de proficiência nem uma promessa de fluência, certificação ou memorização independente. A estimativa de cerca de 20 minutos ainda será validada com participantes.</p>
    <h2>Disponibilidade</h2><p>Esta versão usa doze ilustrações aprovadas de Lucas e BASEDSPEAK na cafeteria. O áudio é solicitado ao clicar em Ouvir e depende da disponibilidade dos serviços. A alternativa textual permite continuar quando o áudio não funciona. Se a sincronização falhar, a interface pausa a prática e permite tentar novamente; o salvamento só é confirmado após a resposta do servidor.</p>
    <h2>Uso do conteúdo</h2><p>A narrativa, a marca e as ilustrações são apresentadas para experimentação pessoal da proposta. Não envie conteúdo ilegal ou dados pessoais no comentário opcional.</p>
    <h2>Sua tentativa</h2><p>A retomada usa o progresso salvo na conta. Recomeçar substitui a tentativa da história após confirmação; não apaga estudo, atividades nem mensagens. A administração pode reiniciar o progresso e gerenciar o acesso. Saiba mais na <Link href="/privacidade">Política de Privacidade</Link>.</p>
  </article></main>;
}
