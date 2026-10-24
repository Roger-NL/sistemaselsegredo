# Validação completa do áudio da demo

## Retirada do banco da reprodução publicada — 24/10/2026

Para remover a causa do pico observado, a página agora contém um índice de URLs dos arquivos globais já existentes. O índice é produzido após leitura/verificação do ledger e dos MP3s, validado no servidor contra texto + parâmetros ativos e entregue como dados serializáveis. Não contém configuração de voz ou credenciais. A sessão nova resolve a primeira frase localmente e solicita apenas o MP3 ao Blob. A API também devolve itens indexados sem banco/rate limit; geração de item ausente mantém origem, ID permitido, rate limit e lock global. Mudança de texto/configuração invalida a referência anterior.

Verificação real `--indexed`, de 2026-10-24T01:40:57.116Z a 2026-10-24T01:41:03.079Z: transporte da API proibido durante as resoluções. Duas sessões novas, 50/50 IDs cada, 46 MP3s baixados e decodificados, hashes conferidos. **Zero leituras de metadados durante resolução/replay; zero tentativas adicionais de geração.** Snapshots do ledger antes/depois idênticos (inventário de auditoria separado da reprodução).

| Medida | Mediana | P95 | Máximo |
|---|---:|---:|---:|
| Resolução inicial dos IDs pelo índice | 0,007ms | 0,015ms | 0,029ms |
| Outra sessão, IDs em ordem inversa | 0,001ms | 0,003ms | 0,087ms |
| Primeiro byte dos arquivos no CDN | 60,900ms | 70,360ms | 243,812ms |

Inicializar o catálogo levou 0,227ms/0,157ms nas duas sessões. DTO: 11.751 bytes, 2.172 bytes gzip; não dispara downloads ao abrir/restaurar a demo. São medidas de resolução de URL e transferência, **não uma medição de clique até som em navegador/celular**. A consulta que levou 10,7s deixa de fazer parte deste caminho; condições da rede/CDN ou do dispositivo ainda podem variar.

137 testes/23 arquivos, lint, TypeScript e build aprovados. Regressões incluem três sessões novas com os 50 IDs e transporte bloqueado, resposta da API com banco/admissão indefinidamente pendentes, configuração diferente, índice inválido e fallback de ID ausente preservando o controle de geração. O HTML compilado de /demo contém as 50 referências. Varredura do índice e de 21 arquivos públicos compilados não encontrou os valores das quatro credenciais/configurações server-only verificadas. Nenhuma alteração do ledger, upload, geração ou deploy. Evidência sanitizada em `tmp/audio-indexed-verification/`; JSON versionado contém apenas referências de mídia pública. Referências de arquitetura: [props serializáveis do Next](https://nextjs.org/docs/app/getting-started/server-and-client-components) e [entrega pública do Blob](https://vercel.com/docs/vercel-blob/public-storage).

## Revalidação de latência e cache — 24/10/2026

Solicitação: testar a melhoria de início, o círculo e o reaproveitamento das frases. Validação nova executada de forma somente leitura no serviço real de cache e no CDN, sem chamar a API HTTP da demo, o rate limit ou o provedor. A aba Chrome existente foi localizada, mas Browser Use recusou a observação por permissão salva/gerenciada. Não houve contorno. **Tempo de clique até som e aparência/reprodução no celular continuam sem validação em navegador/aparelho.**

- Duas passagens completas: 50/50 IDs resolvidos, 46/46 MP3s baixados e decodificados integralmente com afconvert em cada rodada. Bytes/SHA-256 conferidos contra os metadados persistentes. Segunda sessão em ordem inversa encontrou as mesmas chaves/arquivos.
- Os 46 registros continuam ready com providerAttemptCount=1. Contador, providerStartedAt, completedAt, updatedAt, bytes e checksum foram comparados antes/depois e permaneceram idênticos. **Zero novas tentativas de geração.** O verificador não importa integração do provedor nem possui caminho de geração.
- Primeira rodada encontrou uma leitura isolada de 10.675ms em U13. Cinco consultas isoladas posteriores: 904/197/298/191/472ms. Não se declara que toda primeira reprodução está livre de oscilações da rede/banco.
- Corrigida uma consulta redundante: o atalho de URL da sessão agora compartilha frases inglesas idênticas entre IDs distintos (quatro pares abaixo), mantendo pontuação distinta separada. Segunda rodada fez 92 leituras de metadados nas duas sessões, contra 100 antes; replays na mesma sessão não fizeram consulta adicional.

| Medida da rodada final | Mediana | P95 | Máximo |
|---|---:|---:|---:|
| Resolução da primeira passagem pelos 50 IDs, incluindo aliases | 270,649ms | 407,072ms | 430,060ms |
| Resolução após criar outra sessão, em ordem inversa | 240,763ms | 416,430ms | 545,261ms |
| Atalho da URL ao repetir na sessão | 0,015ms | 0,024ms | 0,031ms |
| Primeiros bytes dos MP3s no CDN | 62,730ms | 101,155ms | 234,648ms |

A conexão com o banco foi aquecida pelo inventário inicial antes das amostras. O atalho mede apenas a URL, não download ou som. A tabela não inclui ida à API HTTP, admissão/rate limit, inicialização do player, políticas de autoplay ou decodificação no dispositivo; não é uma comparação controlada de clique a som antes/depois.

Regressões do player exercitam as falas e os grupos de áudio de todos os nós do catálogo: progresso finito/monótono, um único término e círculo em 100% no fim. Eventos de mídia são simulados nestes testes, sem alegar reprodução visual real. Também passam pausa, buffering, cancelamento, URL atrasada, erro e sequenciamento sem segurar a primeira fala pela seguinte. Os 384 percursos narrativos cobrem os três níveis; player/indicador são compartilhados entre níveis e dimensões. 129 testes/22 arquivos, lint, TypeScript e build aprovados.

Evidência sanitizada em `tmp/audio-startup-verification/`: relatório da primeira rodada, relatório final por ID, rechecagem do pico, snapshots antes/depois e arquivos decodificados. Verificação reproduzível manual no macOS/Node 24+: `node --experimental-transform-types --conditions=react-server scripts/media-production/verify-cached-audio.mjs`. Requer credenciais server-only locais e arquivos já publicados; nunca gera frases ausentes.

## Validação original — 23/10/2026

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
