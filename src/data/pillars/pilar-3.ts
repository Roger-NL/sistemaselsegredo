import { PillarData } from "@/types/study";

export const PILAR_3_DATA: PillarData = {
    id: 3,
    title: "Pilar 3: Kit de Sobrevivência Global",
    subtitle: "Scripts completos para dominar qualquer cenário urbano sem pânico.",
    blocks: [
        {
            type: "system-status",
            content: "{{SURVIVAL MODE|MODO DE SOBREVIVÊNCIA}}: {{READY|PRONTO}}. {{Tactical scripts loaded|Scripts táticos carregados}}."
        },
        {
            type: "h2",
            content: "Introdução: A Matriz da Educação (Politeness)"
        },
        {
            type: "paragraph",
            content: "Nos EUA e Reino Unido, a 'educação' (politeness) é moeda de troca. Ser direto demais soa rude. Ser educado abre portas e garante melhor atendimento."
        },
        {
            type: "table",
            content: [
                "Nível|Frase|Percepção do Nativo",
                "🔴 Rude|{{I want water.|Eu quero água.}}|Homem das cavernas. Exigente.",
                "🟡 Básico|{{Give me water, please.|Me dê água, por favor.}}|Aceitável, mas um pouco direto.",
                "🟢 Elite|{{Could I have some water?|Poderia me dar um pouco de água?}}|Educado, fluente, merece respeito.",
                "✨ Ultra|{{I'd like some water, please.|Gostaria de um pouco de água, por favor.}}|Perfeito. Padrão ouro."
            ]
        },
        {
            type: "h2",
            content: "Parte 1: O Restaurante (Cenário Completo)"
        },
        {
            type: "paragraph",
            content: "O restaurante é o teste final de sobrevivência. Vamos mapear do início ao fim."
        },
        {
            type: "h3",
            content: "Fase 1: Chegando (The Host)"
        },
        {
            type: "dialogue",
            title: "Na Porta",
            content: [
                "Host: {{Hi, welcome! Do you have a reservation?|Oi, bem-vindo! Você tem reserva?}}",
                "You: {{Yes, under the name [Seu Nome].|Sim, no nome de [Seu Nome].}}",
                "Host: {{Right this way.|Por aqui, por favor.}}"
            ]
        },
        {
            type: "h3",
            content: "Fase 2: Pedindo (Ordering)"
        },
        {
            type: "paragraph",
            content: "Nunca diga 'I want'. Use 'I'll have' ou 'I'd like'."
        },
        {
            type: "dialogue",
            title: "O Pedido",
            content: [
                "Waiter: {{Are you ready to order?|Está pronto para pedir?}}",
                "You: {{Yes. I'll have the steak, please.|Sim. Vou querer o bife, por favor.}}",
                "Waiter: {{How would you like your steak cooked?|Qual o ponto da carne?}}",
                "You: {{Medium-rare, please.|Ao ponto para mal, por favor.}}",
                "Waiter: {{And to drink?|E para beber?}}",
                "You: {{Just tap water, please.|Apenas água da torneira, por favor.}}"
            ]
        },
        {
            type: "box-insight",
            title: "Dica Cultural",
            content: "**Tap Water** (água da torneira) é grátis e segura nos EUA e Europa. Se pedir 'Water', eles podem trazer uma garrafa cara de $8. Seja específico."
        },
        {
            type: "h3",
            content: "Fase 3: Pagando (The Check)"
        },
        {
            type: "list",
            content: [
                "Peça a conta: *\"{{Can I have the check, please?|Pode me trazer a conta, por favor?}}\"* (EUA) ou *\"{{The bill, please?|A conta, por favor?}}\"* (UK).",
                "Gorjeta ({{Tip|Gorjeta}}): Nos EUA, 18-20% é obrigatório moralmente. Não deixe menos que isso a menos que o serviço tenha sido terrível.",
                "Dividir: *\"{{Can we split the check?|Podemos dividir a conta?}}\"* "
            ]
        },
        {
            type: "h2",
            content: "Parte 2: Hotel & Problemas (Troubleshooting)"
        },
        {
            type: "paragraph",
            content: "Fazer check-in é fácil. O difícil é reclamar que o chuveiro não funciona sem parecer um louco."
        },
        {
            type: "box-warning",
            title: "A Fórmula da Reclamação Suave",
            content: "Use esta estrutura: **Desculpa + O Problema + O Pedido.**\n\nEx: \"Hi, sorry to bother you, but my shower isn't working. Could you send someone to check it?\""
        },
        {
            type: "list",
            content: [
                "**O Wi-Fi não conecta**: *\"{{I'm having trouble connecting to the Wi-Fi.|Estou com problemas para conectar no Wi-Fi.}}\"*",
                "**Barulho**: *\"{{The room next door is very noisy.|O quarto ao lado está muito barulhento.}}\"*",
                "**Toalhas**: *\"{{Could we get some extra towels?|Poderíamos ter algumas toalhas extras?}}\"*",
                "**Late Check-out**: *\"{{Is it possible to have a late check-out?|É possível fazer o check-out mais tarde?}}\"* "
            ]
        },
        {
            type: "h2",
            content: "Parte 3: Direções & Transporte (Uber/Taxi)"
        },
        {
            type: "paragraph",
            content: "Hoje temos GPS, mas bateria acaba. Saber perguntar é essencial."
        },
        {
            type: "dialogue",
            title: "Pedindo Direção",
            content: [
                "You: {{Excuse me, how do I get to the subway station?|Com licença, como chego à estação de metrô?}}",
                "Local: {{Go straight, turn right at the lights, and it's on your left.|Vá em frente, vire à direita no semáforo, e fica à sua esquerda.}}",
                "You: {{Thank you so much!|Muito obrigado!}}"
            ]
        },
        {
            type: "interactive-quiz",
            content: "No Uber, você quer que ele ligue o ar condicionado. Você diz:|{{Turn on the air!|Ligue o ar!}}|{{Can you turn up the AC, please?|Pode aumentar o ar condicionado, por favor?}}|{{I'm hot.|Estou com calor.}}|1"
        },
        {
            type: "h2",
            content: "Parte 4: Saúde & Farmácia (Emergency)"
        },
        {
            type: "paragraph",
            content: "Não brinque com saúde. Vocabulário preciso salva vidas."
        },
        {
            type: "cards-grid",
            content: [
                "Sintomas|{{Headache|Dor de cabeça}} (Dor de cabeça), {{Sore throat|Garganta inflamada}} (Garganta inflamada), {{Fever|Febre}} (Febre), {{Nauseous|Enjoado}} (Enjoado)",
                "Remédios|{{Painkiller|Analgésico}} (Analgésico), {{Cough syrup|Xarope}} (Xarope), {{Band-aid|Curativo}} (Curativo), {{Prescription|Receita}} (Receita)"
            ]
        },
        {
            type: "box-action",
            title: "Frase de Ouro na Farmácia",
            content: "*\"{{I have a terrible headache. What do you recommend?|Tenho uma dor de cabeça terrível. O que você recomenda?}}\"* (Deixe o farmacêutico ajudar)."
        },
        {
            type: "pillar-end",
            title: "Agente Pronto para Campo",
            content: "Você tem os scripts. Você tem a postura. Você tem o vocabulário. Agora você não é mais um turista perdido; você é um viajante tático."
        }
    ]
};

// PILAR 4: FUNDAMENTOS & ENGENHARIA (EXPANDED ELITE VERSION)
