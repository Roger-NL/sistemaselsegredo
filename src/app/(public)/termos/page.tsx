import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Termos de Uso",
    description: "Termos de uso do programa beta BasedSpeak.",
};

const sections = [
    ["1. Objeto e beta", "A BasedSpeak oferece uma experiência digital de aprendizagem de inglês. Durante o beta, funcionalidades podem mudar, ficar temporariamente indisponíveis ou exigir acompanhamento manual. O serviço não garante fluência, promoção profissional, certificação oficial ou resultado em prazo determinado."],
    ["2. Conta e elegibilidade", "A conta é pessoal e não pode ser partilhada. O utilizador deve fornecer dados corretos, proteger as credenciais e comunicar acessos indevidos. O beta destina-se a maiores de 18 anos; menores só podem usar o serviço com autorização do responsável legal."],
    ["3. Conteúdo e conduta", "O conteúdo da plataforma é protegido por propriedade intelectual e é licenciado apenas para uso pessoal. Não é permitido copiar, revender, automatizar acessos, contornar bloqueios, explorar falhas, assediar outros participantes ou enviar conteúdo ilegal."],
    ["4. Avaliações e sessões", "Respostas, progresso e avaliações podem ser revistos por pessoas autorizadas. Agendamentos dependem de disponibilidade e confirmação. A plataforma pode corrigir estados de progresso quando identificar erro técnico, fraude ou inconsistência."],
    ["5. Beta gratuito e pagamentos", "O beta fechado atual é gratuito e funciona exclusivamente por convite, sem cobrança ou pedido de dados financeiros. Se uma fase comercial for aberta no futuro, preço, meio de pagamento e condições aplicáveis deverão ser apresentados antes da compra, preservando todos os direitos obrigatórios do consumidor."],
    ["6. Disponibilidade e responsabilidade", "Empregamos medidas razoáveis de segurança e continuidade, mas não prometemos operação ininterrupta. Na extensão permitida por lei, não respondemos por perdas indiretas, indisponibilidade de terceiros ou uso do serviço fora da finalidade proposta."],
    ["7. Suspensão e encerramento", "Podemos limitar ou suspender contas em caso de risco de segurança, fraude, abuso ou violação destes termos, com preservação dos direitos legais do utilizador. O utilizador pode pedir encerramento e eliminação conforme a Política de Privacidade."],
    ["8. Alterações e lei aplicável", "Alterações materiais serão comunicadas de forma adequada. Aplicam-se as normas brasileiras, inclusive o Código de Defesa do Consumidor e a LGPD, sem prejuízo de direitos imperativos do local do utilizador."],
];

export default function TermsPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
            <Link href="/" className="text-sm font-semibold text-violet-700 hover:text-violet-900">← Voltar</Link>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-950">Termos de Uso</h1>
            <p className="mt-3 text-sm text-slate-500">Vigentes desde 18 de julho de 2026.</p>
            <p className="mt-8 leading-7">Ao criar uma conta ou usar a BasedSpeak, você concorda com estes termos e com a <Link href="/privacidade" className="text-violet-700 underline">Política de Privacidade</Link>.</p>
            <div className="mt-10 space-y-9">
                {sections.map(([title, body]) => (
                    <section key={title}>
                        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
                        <p className="mt-3 leading-7">{body}</p>
                    </section>
                ))}
            </div>
            <p className="mt-12 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                Este documento deve receber revisão jurídica e identificação completa do fornecedor antes da abertura comercial fora do beta fechado.
            </p>
        </main>
    );
}
