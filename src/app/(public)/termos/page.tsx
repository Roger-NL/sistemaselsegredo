import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Termos de uso", description: "Sobre a experiência pública da cafeteria BasedSpeak." };
export default function TermsPage() {
  return <main className="demo-shell"><article className="legal"><Link href="/">← Voltar ao início</Link><h1>Termos de uso</h1><p>Atualizado em 23 de outubro de 2026.</p>
    <h2>A experiência</h2><p>A demo BasedSpeak é uma conversa guiada fictícia em uma cafeteria. É gratuita e pública, sem conta, login, pagamento, gravação de voz ou microfone. Você pode pedir ajuda, escolher como participar e encerrar quando quiser.</p>
    <h2>Aprender com apoio</h2><p>A experiência permite construir respostas e participar de um diálogo com ajuda. Não é um teste de proficiência nem uma promessa de fluência, certificação ou memorização independente. A estimativa de cerca de 30 minutos ainda será validada com participantes.</p>
    <h2>Prévia e disponibilidade</h2><p>Esta versão usa ilustrações conceituais. As imagens finais e os áudios estão em produção. O texto permite continuar mesmo quando o áudio ou o armazenamento não funcionam.</p>
    <h2>Uso do conteúdo</h2><p>A narrativa, a marca e as ilustrações são apresentadas para experimentação pessoal da proposta. Não envie conteúdo ilegal ou dados pessoais no comentário opcional.</p>
    <h2>Sua tentativa</h2><p>A retomada depende deste navegador e dispositivo. Recomeçar descarta a tentativa e o rascunho de avaliação locais após sua confirmação. Saiba mais na <Link href="/privacidade">Política de Privacidade</Link>.</p>
  </article></main>;
}
