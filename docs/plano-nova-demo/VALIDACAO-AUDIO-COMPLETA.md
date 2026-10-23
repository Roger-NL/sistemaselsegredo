# Validação completa do áudio da demo

Executada em 2026-10-23T11:50:06.553Z a 2026-10-23T11:58:15.843Z, após solicitação explícita de testar toda a demo. Serviços reais: API local da aplicação, ElevenLabs, Firestore e Vercel Blob.

## Resultado

- **50/50 IDs de fala resolvidos; 46 arquivos MP3 únicos.** Todos retornaram HTTP 200, conteúdo audio/mpeg e foram decodificados integralmente pelo AudioToolbox (`afconvert`), com duração positiva e sinal não silencioso.
- Antes da rodada havia 1 áudio pronto. Foram produzidos somente os 45 textos únicos restantes. Nenhum registro foi apagado, desbloqueado ou teve seu contador zerado.
- 117 chamadas à API na rodada principal: 116 ready/200, 1 pending/202 e 0 erros. A UI de áudio usa o mesmo cliente de polling exercitado nesta rodada.
- Primeiro pedido concorrente de C21/U09: um aguardou a geração do outro; ambos receberam o mesmo arquivo. Os quatro pares idênticos também passaram por quatro replays simultâneos cada.
- Segunda passagem dos 50 IDs em ordem inversa: mesmas chaves/URLs. Downloads repetidos dos 46 arquivos: mesmos hashes SHA-256. Nenhum MP3 adicional.
- Após reiniciar o servidor: outros 46 pedidos, mesmas chaves e mesmos bytes em todos os arquivos; nenhuma geração adicional.
- Os 46 registros Firestore continuam ready com providerAttemptCount = 1. providerStartedAt e completedAt não mudaram nas repetições nem após reinício.
- A suíte automatizada também passou: 89 testes em 20 arquivos, incluindo os 384 percursos narrativos, concorrência entre instâncias e falhas ambíguas.

## Frases iguais entre IDs distintos

| Texto | IDs que compartilham um MP3 | Resultado |
|---|---|---|
| Really? | C21, U09 | Mesma chave, mesmo arquivo, uma tentativa |
| Yeah, I like it. | C22, U14 | Mesma chave, mesmo arquivo, uma tentativa |
| Do you like this café? | C24, U13 | Mesma chave, mesmo arquivo, uma tentativa |
| Me too. | C25, U04 | Mesma chave, mesmo arquivo, uma tentativa |

Pontuação é preservada: “Me too.” e “Me too!” são textos diferentes e têm chaves diferentes. IDs, papel na conversa, participante e rota não criam arquivos distintos quando texto e parâmetros são idênticos.

## Arquivos validados

| IDs | Texto | Bytes | Duração decodificada |
|---|---|---:|---:|
| C01 | Is this yours? | 20106 | 1.25 s |
| C02 | Oh! Sorry! | 20524 | 1.28 s |
| C03 | An iced coffee. And you? | 33898 | 2.12 s |
| C04 | Nice! | 14672 | 0.91 s |
| C05 | Oh! This is mine. | 28047 | 1.75 s |
| C06 | Oh… it’s sweet. | 29719 | 1.85 s |
| C07 | Do you like it? | 20524 | 1.28 s |
| C08 | Really? Me too! | 27211 | 1.70 s |
| C09 | Really? I like it. | 27211 | 1.70 s |
| C10 | Oh! Thanks! | 21359 | 1.33 s |
| C11 | That was close. | 21359 | 1.33 s |
| C12 | I’m tired. | 19270 | 1.20 s |
| C13 | Yeah. Too much work. And you? | 48945 | 3.06 s |
| C14 | Yeah… long day. | 25957 | 1.62 s |
| C15 | Lucky you! | 19270 | 1.20 s |
| C16 | Oh, a table! | 19270 | 1.20 s |
| C17 | Sit with me? | 17180 | 1.07 s |
| C18 | Oh, nice! | 18434 | 1.15 s |
| C19 | Yeah, I like it. But I’m tired. | 40586 | 2.53 s |
| C20 | Me too. I like English. | 35570 | 2.22 s |
| C21, U09 | Really? | 13836 | 0.86 s |
| C22, U14 | Yeah, I like it. | 23867 | 1.49 s |
| C23 | I need a break. | 20524 | 1.28 s |
| C24, U13 | Do you like this café? | 28883 | 1.80 s |
| C25, U04 | Me too. | 16344 | 1.02 s |
| C26 | Oh, okay. | 22195 | 1.38 s |
| C27 | It’s quiet here. | 23031 | 1.44 s |
| C28 | Sure! | 14672 | 0.91 s |
| C29 | You too. Bye! | 22195 | 1.38 s |
| C30 | Me too! | 18434 | 1.15 s |
| U01 | No, it’s not mine. | 27211 | 1.70 s |
| U02 | What did you order? | 23867 | 1.49 s |
| U03 | It’s okay. | 19270 | 1.20 s |
| U05 | Yes, it’s mine. | 25957 | 1.62 s |
| U06 | I like it. | 17180 | 1.07 s |
| U07 | Not really. | 17180 | 1.07 s |
| U08 | Careful! | 15508 | 0.97 s |
| U10 | Yeah, sure. | 20524 | 1.28 s |
| U11 | I’m learning English. | 25121 | 1.57 s |
| U12 | Do you like your job? | 26793 | 1.67 s |
| U15 | I can stay a little longer. | 30973 | 1.93 s |
| U16 | I have to go. | 17598 | 1.10 s |
| U17 | I like it here. | 22195 | 1.38 s |
| U18 | Can we keep in touch? | 28047 | 1.75 s |
| U19 | Nice talking to you. | 29719 | 1.85 s |
| U20 | Bye! | 13418 | 0.84 s |

## Escopo e evidência

A validação técnica cobre o catálogo de áudio das dez partes e sua entrega/cache. Não equivale a uma escuta editorial de pronúncia nem a uma inspeção visual de todas as etapas no navegador. O acesso automatizado ao navegador local permanece bloqueado pela permissão salva; não houve contorno desse bloqueio.

Evidência detalhada sanitizada, snapshots antes/depois, hashes e MP3s locais em `tmp/audio-full-verification/` (ignorado pelo Git). Nenhuma chave/voz de ambiente foi incluída no relatório. Nenhum deploy, alteração de regras/índices ou limpeza de cache foi realizado.
