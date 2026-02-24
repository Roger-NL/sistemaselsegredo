import { PillarData } from "@/types/study";

export const PILAR_5_DATA: PillarData = {
    id: 5,
    title: "Pilar 5: Domínio Financeiro & Numérico",
    subtitle: "Do café ao contrato milionário: como falar números com precisão cirúrgica.",
    blocks: [
        {
            type: "system-status",
            content: "{{FINANCE MODULE|MÓDULO FINANCEIRO}}: {{ACTIVE|ATIVO}}. {{Converting currency|Convertendo moeda}}..."
        },
        {
            type: "h2",
            content: "Introdução: O Custo do Erro"
        },
        {
            type: "paragraph",
            content: "Em uma viagem, errar um número pode custar o dobro. Em negócios, pode custar o emprego. Neste pilar, vamos blindar sua matemática linguística."
        },
        {
            type: "h2",
            content: "Parte 1: A Armadilha Sonora (13 vs 30)"
        },
        {
            type: "paragraph",
            content: "O erro mais comum e perigoso. Aprenda a diferença de ênfase."
        },
        {
            type: "table",
            content: [
                "Grupo|Exemplos|Aonde está a força?|Som Final",
                "Teens (Adolescentes)|{{13, 14, 15... 19|13, 14, 15... 19}}|No final (thir-{{TEEN|TEEN}})|Longo (innnn)",
                "Ties (Dezenas)|{{30, 40, 50... 90|30, 40, 50... 90}}|No início ({{THIR|THIR}}-ty)|Curto e seco (y)"
            ]
        },
        {
            type: "interactive-quiz",
            content: "Se eu digo '{{FOR-ty|QUARENTA}}', qual número é?|14|40|4"
        },
        {
            type: "h2",
            content: "Parte 2: Big Money (Milhões e Bilhares)"
        },
        {
            type: "paragraph",
            content: "Em inglês, usamos vírgula onde o português usa ponto, e vice-versa. Mas na fala, usamos blocos."
        },
        {
            type: "list",
            content: [
                "**{{Hundred|Centena}}**: Centena (100)",
                "**{{Thousand|Milhar}}**: Milhar (1,000) -> Note a vírgula!",
                "**{{Million|Milhão}}**: Milhão (1,000,000)",
                "**{{Billion|Bilhão}}**: Bilhão (1,000,000,000)"
            ]
        },
        {
            type: "box-action",
            title: "Tática de Leitura",
            content: "Leia sempre em blocos de 3 dígitos, seguindo a vírgula.\nEx: 2,500,300\n- 'Two million,'\n- 'Five hundred thousand,'\n- 'Three hundred.'"
        },
        {
            type: "h2",
            content: "Parte 3: Moeda e Preços (Street Smart)"
        },
        {
            type: "paragraph",
            content: "Ninguém fala 'Twenty dollars and zero cents'. Aprenda a gíria da rua."
        },
        {
            type: "table",
            content: [
                "Escrito|Falado (Formal)|Falado (Rua)",
                "$1.50|{{One dollar fifty|Um dólar e cinquenta}}|{{Buck fifty|Um mango e cinquenta}}",
                "$20.00|{{Twenty dollars|Vinte dólares}}|{{Twenty bucks|Vinte contos}}",
                "$1200|{{One thousand two hundred|Mil e duzentos}}|{{Twelve hundred|Doze centenas}} (Doze centenas)",
                "$250k|{{250 thousand|250 mil}}|{{Quarter mill|Um quarto de milhão}}"
            ]
        },
        {
            type: "h2",
            content: "Parte 4: Negociação de Salário (Roleplay Avançado)"
        },
        {
            type: "paragraph",
            content: "Você recebeu uma oferta. É hora de negociar."
        },
        {
            type: "dialogue",
            title: "A Contraproposta",
            content: [
                "HR: {{The offer is 50k a year.|A oferta é de 50 mil por ano.}}",
                "You: {{I appreciate the offer. However, based on my experience and the market average, I was expecting something in the 60k to 65k range.|Agradeço a oferta. Porém, com base na minha experiência e média de mercado, eu esperava algo entre 60 e 65 mil.}}",
                "HR: {{We can do 60k if you sign today.|Podemos fazer 60 mil se assinar hoje.}}",
                "You: {{It's a deal.|Fechado.}}"
            ]
        },
        {
            type: "box-insight",
            title: "Termos de Poder",
            content: "**{{Gross Salary|Salário Bruto}}**: Bruto.\\n**{{Net Salary|Salário Líquido}}**: Líquido.\\n**{{Benefits|Benefícios}}**: Benefícios (Plano de saúde, etc).\\n**{{Bonus|Bônus}}**: Bônus de performance."
        },
        {
            type: "h2",
            content: "Parte 5: Datas e Horários (Time Management)"
        },
        {
            type: "list",
            content: [
                "**Anos**: Divida em dois. 1990 = '{{Nineteen ninety|Dezenove noventa}}'. 2024 = '{{Twenty twenty-four|Vinte vinte e quatro}}'.",
                "**Horas**: Use 'Past' e 'To'. 2:15 = '{{Quarter past two|Um quarto passado das duas}}'. 2:50 = '{{Ten to three|Dez para as três}}'."
            ]
        },
        {
            type: "pillar-end",
            title: "Módulo Financeiro Encerrado",
            content: "Você agora sabe quanto custa, quanto ganha e quando vai acontecer. Você está no controle dos números."
        }
    ]
};

// PILAR 6: PRODUÇÃO CONTROLADA (EXPANDED ELITE VERSION)
