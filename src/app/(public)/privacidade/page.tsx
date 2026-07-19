import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description: "Como a BasedSpeak trata dados pessoais no programa beta.",
};

const sections = [
    ["Dados tratados", "No beta gratuito tratamos dados de conta e contacto (nome, e-mail e telefone), respostas e progresso académico, agendamentos, eventos de autenticação e informações técnicas de segurança. O beta não pede CPF nem dados de pagamento. Esses dados só poderão ser solicitados futuramente se o utilizador optar por um fluxo comercial claramente identificado."],
    ["Finalidades e bases legais", "Usamos os dados para prestar o serviço e executar o contrato; autenticar e proteger contas; processar pagamentos; organizar avaliações e sessões; atender suporte; cumprir obrigações legais; e, com base em interesse legítimo sujeito a avaliação, prevenir fraude e melhorar estabilidade e usabilidade."],
    ["Fornecedores e partilha", "Dados podem ser tratados por fornecedores essenciais de hospedagem, autenticação, base de dados e agenda, atualmente incluindo Vercel e Google/Firebase. A integração Asaas permanece desativada durante o beta gratuito. Partilhamos apenas o necessário para a finalidade correspondente e não vendemos dados pessoais."],
    ["Transferências internacionais", "Alguns fornecedores podem tratar dados fora do Brasil. Nesses casos, adotamos mecanismos contratuais e medidas exigidas pela LGPD para proteger a transferência."],
    ["Retenção", "Mantemos dados enquanto a conta estiver ativa e depois pelo tempo necessário para obrigações legais, defesa de direitos, prevenção de fraude e resolução de cobranças. Dados sem necessidade legítima são eliminados ou anonimizados."],
    ["Segurança", "Aplicamos controlo de acesso, autenticação, encriptação em trânsito, registos operacionais e separação de credenciais. Nenhum sistema é infalível; incidentes relevantes serão avaliados e comunicados conforme a lei."],
    ["Seus direitos", "Você pode pedir confirmação e acesso, correção, portabilidade quando regulamentada, informação sobre partilhas, oposição, revisão de decisões automatizadas e eliminação ou anonimização quando cabível. Também pode revogar consentimento sem afetar tratamentos anteriores."],
    ["Cookies e sessão", "Utilizamos cookies estritamente necessários para manter a sessão autenticada e proteger áreas restritas. Não descrevemos cookies publicitários porque não estão previstos no beta atual."],
    ["Crianças e adolescentes", "O serviço não é direcionado intencionalmente a menores de 18 anos no beta. Se identificarmos tratamento sem autorização adequada, adotaremos medidas para interrompê-lo e eliminar os dados quando aplicável."],
    ["Contacto e alterações", "Pedidos de privacidade podem ser enviados pelo canal de suporte informado na plataforma. Alterações materiais desta política serão comunicadas, e a data de vigência será atualizada."],
];

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
            <Link href="/" className="text-sm font-semibold text-violet-700 hover:text-violet-900">← Voltar</Link>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-950">Política de Privacidade</h1>
            <p className="mt-3 text-sm text-slate-500">Vigente desde 18 de julho de 2026.</p>
            <p className="mt-8 leading-7">Esta política explica, em linguagem direta, o tratamento de dados pessoais no beta da BasedSpeak.</p>
            <div className="mt-10 space-y-9">
                {sections.map(([title, body]) => (
                    <section key={title}>
                        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
                        <p className="mt-3 leading-7">{body}</p>
                    </section>
                ))}
            </div>
            <p className="mt-12 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                Antes do lançamento comercial, devem ser acrescentados os dados completos do controlador e do encarregado, canal de contacto validado e prazos formais de retenção.
            </p>
        </main>
    );
}
