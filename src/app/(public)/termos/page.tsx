import { InterfaceIcon } from "@/components/ui/InterfaceIcon";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Termos de uso", description: "Sobre a aula visual e a conta BasedSpeak." };
export default function TermsPage() {
  return <main className="demo-shell legal-shell"><article className="legal">
    <header className="legal-header">
      <Link href="/" className="legal-back"><InterfaceIcon name="arrow-left" />Voltar ao início</Link>
      <h1>Termos de uso</h1>
      <p className="legal-updated">Atualizado em <time dateTime="2026-11-23">23 de novembro de 2026</time>.</p>
    </header>
    <h2>A experiência</h2><p>O gibi <Link href="/first-day">First Day</Link> é público e gratuito, sem cadastro ou aprovação. O percurso combina cenas ilustradas e exercícios em inglês. O progresso de First Day fica neste navegador. Não há pagamento, gravação de voz ou microfone. Você pode pedir ajuda, escolher como participar e encerrar quando quiser.</p>
    <h2>A conta e o curso</h2><p>Criar uma conta não gera cobrança nem contratação de um plano. O painel com sessão verificada permite acompanhar os registros de atividades e conversar com o professor. A revisão cadastral de contas novas não bloqueia a prática nem o salvamento; suspensão ou rejeição podem restringir o acesso da conta. Um percurso anônimo só é importado com sua escolha explícita, para uma conta sem progresso salvo e sem agendamento; ele não substitui um percurso já existente. A próxima etapa do curso ainda está em preparação; não há oferta comercial, preço ou acesso a um curso completo nesta página.</p>
    <h2>Aprender com apoio</h2><p>A experiência permite construir respostas e participar de um diálogo com ajuda. Não é um teste de proficiência nem uma promessa de fluência, certificação ou memorização independente.</p>
    <h2>A aula gratuita</h2><p>O painel permite consultar pedidos, confirmações e instruções da aula individual associados à conta. As solicitações disponíveis seguem a elegibilidade da conta, o horário disponível e a confirmação do professor.</p>
    <h2>Disponibilidade</h2><p>First Day usa cenas ilustradas e falas pré-gravadas. A reprodução começa com a interação do aluno e pode seguir o turno do personagem. Você pode pausar ou repetir. Os textos e as legendas permitem acompanhar o gibi em silêncio.</p>
    <h2>Uso do conteúdo</h2><p>A narrativa, a marca e as ilustrações são apresentadas para experimentação pessoal da proposta. Não envie conteúdo ilegal ou dados pessoais desnecessários nas mensagens ao professor.</p>
    <h2>Sua tentativa</h2><p>A retomada de First Day usa o progresso deste navegador. Recomeçar após confirmação reinicia a leitura neste dispositivo. Os dados da conta, mensagens e agendamentos são armazenados separadamente. A administração pode reiniciar o progresso e gerenciar o acesso. Saiba mais na <Link href="/privacidade">Política de Privacidade</Link>.</p>
  </article></main>;
}
