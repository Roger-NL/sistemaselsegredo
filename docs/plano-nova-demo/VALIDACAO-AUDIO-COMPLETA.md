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

## Etapa 5 — revalidação técnica e revisão auditiva pendente — 27/10/2026

Roger escolheu explicitamente **“Deixar a aprovação auditiva pendente”**. Nesta rodada, os 46 arquivos existentes estão aprovados tecnicamente nos critérios abaixo; nenhuma referência recebeu aprovação de pronúncia, naturalidade, entonação, volume percebido, cortes audíveis ou correspondência entre o som e o texto. A ferramenta disponível não ofereceu entrada de áudio compatível para essa percepção. A pré-visualização do material de escuta no navegador foi recusada pela permissão salva; não houve contorno nem alegação de inspeção visual ou auditiva por esse caminho.

A revalidação dos serviços existentes ocorreu de **2026-10-27T16:19:45.929Z a 2026-10-27T16:19:55.176Z**, em UTC. Foram resolvidos os **50 IDs**, com **46 MP3s únicos** baixados e integralmente decodificados. A identidade declarada de texto + parâmetros foi recalculada. Os tamanhos coincidiram com os metadados persistentes; os SHA-256 dos bytes coincidiram com os arquivos originais da validação de 23/10 e com os hashes da rodada de 25/10. **O ledger atual não contém checksum nos 46 registros**, portanto o comparador condicional do script não fornece uma comparação com hash persistido. Os 46 registros auditados continuam `ready`, com uma única tentativa de provedor por chave.

Os snapshots dos campos auditados — `status`, `providerAttemptCount`, `providerStartedAt`, `completedAt`, `updatedAt` e `bytes` — permaneceram idênticos antes/depois desta rodada e em relação à conferência anterior de 25/10. Isso delimita a comparação aos campos registrados, sem afirmar uma auditoria de todos os dados remotos. Houve **zero tentativas adicionais de geração, zero leituras de metadados no caminho de reprodução indexada e nenhuma gravação remota**. Foram preservados os 239 arquivos locais de evidência anterior; os relatórios e materiais locais desta rodada foram acrescentados separadamente. Catálogo, parâmetros, cache global e ledger não foram alterados.

As regressões dirigidas passaram em **44 testes de sete arquivos**, com provedores simulados nos testes. A leitura real de arquivos/cache acima é evidência separada desses mocks. Não foi necessário novo build: esta etapa não alterou a aplicação. Não houve commit ou deploy nesta rodada.

### Correspondência declarada e contextos

O inventário de leitura encontrou os 50 IDs tanto em `media.ts` quanto no índice publicado, sem entradas ausentes ou excedentes, chaves inválidas ou URLs cujo caminho divergisse da chave. Todos são usados na história. Os quatro pares compartilham texto exato e arquivo: **C21/U09**, **C22/U14**, **C24/U13** e **C25/U04**. `Me too.` e `Me too!` continuam com arquivos distintos; o agrupamento textual dessas expressões no estudo não altera a identidade no cache de voz.

A revisão textual mapeou também as reutilizações de pergunta, reação e modelo entre nós e papéis. Esse mapa orienta a escuta: por exemplo, C01 atende às duas situações dos copos, C07 retoma café ou aprendizado, U07 aparece em quatro contextos e os pares compartilhados servem a Lucas e ao modelo de resposta do participante. Não foi encontrado erro bloqueador de texto ou atribuição na leitura. A adequação audível de um mesmo arquivo a cada contexto permanece pendente.

No estudo, **18 dos 24 passos** possuem player por correspondência da expressão inteira normalizada. `iced-coffee`, `sorry-okay`, `careful-close`, `work-job` e `break-quiet` usam fragmentos ou combinações sem um arquivo correspondente à expressão completa; `can-sit` é um exemplo novo. Esses seis passos não geram nem compõem áudio. O glossário reúne 45 expressões normalizadas; a redução além dos quatro aliases decorre de `Me too.` / `Me too!`. Na retrospectiva e no histórico, o arquivo canônico continua sendo um modelo quando a pessoa escreveu uma variante, não uma gravação da resposta dela.

### Limites da análise de sinal

Todos os 46 arquivos têm duração positiva, sinal não silencioso e decodificação completa. As durações variam de **0,835918 a 3,056327 segundos**; a soma dos arquivos únicos é **66,977964 segundos**, sem representar o tempo da conversa ou do estudo. A análise mediu RMS entre **−25,664 e −19,162 dBFS**, picos entre **−8,945 e −1,413 dBFS** e zero amostras no máximo digital. Os maiores trechos de borda abaixo do limiar de −45 dBFS foram 0,09 segundo no início e 0,3502 segundo no fim.

Essas medidas descrevem o sinal decodificado. Não estabelecem igualdade de volume percebido, ausência de cortes perceptíveis, clareza da fala, pronúncia correta ou naturalidade das pausas. A identidade do cache relaciona texto e configuração; o SHA-256 dos bytes confirma que o arquivo é o mesmo. Nenhum dos dois comprova sozinho que a fala audível corresponde ao texto declarado. A aprovação editorial exige ouvir os arquivos nos contextos indicados, incluindo as sequências C10 → C11 e C16 → C17 e a despedida U19 → C29 → U20.

### Matriz dos 46 arquivos existentes

Cada linha agrupa os IDs que apontam ao mesmo MP3. “Técnica aprovada” significa resolução, identidade declarada, integridade dos bytes e decodificação aprovadas nesta rodada. **O texto é o declarado no catálogo; a escuta editorial permanece pendente em todas as linhas.**

| IDs | Texto exato declarado | Duração decodificada | Bytes | Técnica | Escuta editorial |
| --- | --- | ---: | ---: | --- | --- |
| C01 | Is this yours? | 1.253878 s | 20106 | Aprovada | Pendente |
| C02 | Oh! Sorry! | 1.280000 s | 20524 | Aprovada | Pendente |
| C03 | An iced coffee. And you? | 2.115918 s | 33898 | Aprovada | Pendente |
| C04 | Nice! | 0.914286 s | 14672 | Aprovada | Pendente |
| C05 | Oh! This is mine. | 1.750204 s | 28047 | Aprovada | Pendente |
| C06 | Oh… it’s sweet. | 1.854694 s | 29719 | Aprovada | Pendente |
| C07 | Do you like it? | 1.280000 s | 20524 | Aprovada | Pendente |
| C08 | Really? Me too! | 1.697959 s | 27211 | Aprovada | Pendente |
| C09 | Really? I like it. | 1.697959 s | 27211 | Aprovada | Pendente |
| C10 | Oh! Thanks! | 1.332245 s | 21359 | Aprovada | Pendente |
| C11 | That was close. | 1.332245 s | 21359 | Aprovada | Pendente |
| C12 | I’m tired. | 1.201633 s | 19270 | Aprovada | Pendente |
| C13 | Yeah. Too much work. And you? | 3.056327 s | 48945 | Aprovada | Pendente |
| C14 | Yeah… long day. | 1.619592 s | 25957 | Aprovada | Pendente |
| C15 | Lucky you! | 1.201633 s | 19270 | Aprovada | Pendente |
| C16 | Oh, a table! | 1.201633 s | 19270 | Aprovada | Pendente |
| C17 | Sit with me? | 1.071020 s | 17180 | Aprovada | Pendente |
| C18 | Oh, nice! | 1.149388 s | 18434 | Aprovada | Pendente |
| C19 | Yeah, I like it. But I’m tired. | 2.533878 s | 40586 | Aprovada | Pendente |
| C20 | Me too. I like English. | 2.220408 s | 35570 | Aprovada | Pendente |
| C21, U09 | Really? | 0.862041 s | 13836 | Aprovada | Pendente |
| C22, U14 | Yeah, I like it. | 1.488980 s | 23867 | Aprovada | Pendente |
| C23 | I need a break. | 1.280000 s | 20524 | Aprovada | Pendente |
| C24, U13 | Do you like this café? | 1.802449 s | 28883 | Aprovada | Pendente |
| C25, U04 | Me too. | 1.018776 s | 16344 | Aprovada | Pendente |
| C26 | Oh, okay. | 1.384490 s | 22195 | Aprovada | Pendente |
| C27 | It’s quiet here. | 1.436735 s | 23031 | Aprovada | Pendente |
| C28 | Sure! | 0.914286 s | 14672 | Aprovada | Pendente |
| C29 | You too. Bye! | 1.384490 s | 22195 | Aprovada | Pendente |
| C30 | Me too! | 1.149388 s | 18434 | Aprovada | Pendente |
| U01 | No, it’s not mine. | 1.697959 s | 27211 | Aprovada | Pendente |
| U02 | What did you order? | 1.488980 s | 23867 | Aprovada | Pendente |
| U03 | It’s okay. | 1.201633 s | 19270 | Aprovada | Pendente |
| U05 | Yes, it’s mine. | 1.619592 s | 25957 | Aprovada | Pendente |
| U06 | I like it. | 1.071020 s | 17180 | Aprovada | Pendente |
| U07 | Not really. | 1.071020 s | 17180 | Aprovada | Pendente |
| U08 | Careful! | 0.966531 s | 15508 | Aprovada | Pendente |
| U10 | Yeah, sure. | 1.280000 s | 20524 | Aprovada | Pendente |
| U11 | I’m learning English. | 1.567347 s | 25121 | Aprovada | Pendente |
| U12 | Do you like your job? | 1.671837 s | 26793 | Aprovada | Pendente |
| U15 | I can stay a little longer. | 1.933061 s | 30973 | Aprovada | Pendente |
| U16 | I have to go. | 1.097143 s | 17598 | Aprovada | Pendente |
| U17 | I like it here. | 1.384490 s | 22195 | Aprovada | Pendente |
| U18 | Can we keep in touch? | 1.750204 s | 28047 | Aprovada | Pendente |
| U19 | Nice talking to you. | 1.854694 s | 29719 | Aprovada | Pendente |
| U20 | Bye! | 0.835918 s | 13418 | Aprovada | Pendente |

Evidência local desta rodada, ignorada pelo Git: `output/stage5-qa/validacao-etapa5.json` reúne os resultados e a decisão de Roger; `analise-sinal.json` contém as medidas; `arquivos-46.json` agrupa arquivos, hashes e contextos; `inventario-correspondencia.json` registra os 50 IDs e seus usos. O material `escuta-46-mp3s.html` e a planilha `matriz-50-ids.csv` foram preparados para a aprovação humana posterior. A presença e a estrutura desses materiais não equivalem à execução de seus players nem à escuta dos arquivos.
