# Revisão da demo: identidade Orbit e áudio com cache global

**Data:** 23/10/2026. **Estado: aprovada em 23/10/2026; implementação retomada.**

Esta revisão responde às instruções mais recentes: mesma logo e cores do Orbit, interface própria, conversa contínua e áudio ElevenLabs gerado no primeiro pedido com armazenamento persistente global. A instrução “comece” aprovou esta revisão e autorizou retomar a implementação local. A narrativa de cafeteria já aprovada em DEMO.md e no PDF detalhado permanece a fonte das falas e das escolhas.

## 1. O que esta revisão substitui

O plano anterior previa cinquenta arquivos prontos, sem síntese durante a visita. Esta revisão propõe produzir cada áudio sob demanda no servidor e reutilizá-lo globalmente, inclusive entre tentativas, participantes e páginas futuras. O inventário C01–C30/U01–U20 continua identificando ocorrências e contextos; IDs diferentes podem compartilhar o mesmo arquivo quando seus parâmetros de síntese forem exatamente iguais.

O endereço aposentado `/api/speech` continua JSON 410. Propõe-se uma API própria `/api/demo/audio` para o novo contrato, sem reativar o protótipo. Os demais destinos 307/410 e contratos de integrações preservados continuam válidos.

Sem login, conta, preço, pagamento, plano comercial, microfone ou reaproveitamento do currículo antigo. Nenhuma migração/exclusão de dados remotos, mudança de credenciais ou deploy está autorizada por esta especificação.

## 2. Identidade: mesma logo e mesmas cores

Referência observada no [Orbit publicado](https://www.basedspeak.com/inicio-orbita-7k3) e conferida nos arquivos da base Git `b881b3e`.

**Logo:** preservar as quatro barras inclinadas, suas proporções, a palavra `basedspeak.` e o contraste de peso entre “based” e “speak”. Não substituir o símbolo por ponto, xícara, ícone novo ou imagem gerada. A marca terá uma única implementação compartilhada entre entrada, conversa e encerramento. Reutilizar a marca não significa restaurar o componente da experiência Orbit.

| Papel | Cor de referência |
|---|---|
| Fundo creme | `#F4F0E8` |
| Texto principal, marca e ação principal | `#191919` |
| Superfície branca | `#FFFFFF` |
| Superfície suave | `#FCFAF6` |
| Texto secundário | `#716C64` |
| Bordas/divisores | `#DED8CD` |
| Hover suave | `#F8F5EF` / `#E9E3D8` |

Botões principais escuros com texto creme; foco visível escuro, sem introduzir terracota ou verde como identidade da interface. As ilustrações conservam suas cores próprias. Usar a tipografia sans do Orbit, mantendo a composição da marca; preferir fonte local para não exigir download de fontes durante o build.

**Interface própria:** composição centrada no encontro da cafeteria, com contexto visual, conversa e atividade atual conectados. Não copiar a disposição de painéis, menu, onboarding de nome, seletor de idiomas, animação de digitação ou componentes do Orbit. Não recuperar suas telas, reducer, currículo ou rotas.

## 3. Primeira tela

- Logo original BasedSpeak e proposta curta: participar de uma conversa, escolher o que dizer e construir respostas com ajuda.
- Experiência gratuita, cerca de 30 minutos, no ritmo da pessoa. Duração é estimativa a validar, sem cronômetro obrigatório.
- Aviso direto: não é necessário usar microfone.
- Os três apoios aprovados: “Estou começando do zero”, “Sei algumas coisas” e “Quero praticar com menos apoio”. Nenhum selecionado inicialmente.
- “Começar a conversa” só habilita depois da escolha e abre diretamente a cafeteria.
- Se houver tentativa local válida, oferecer retomada ou reinício com confirmação do descarte.

Sem nome, cadastro, seleção de tema ou pergunta de venda antes da cena.

## 4. Situação e conversa de aproximadamente 30 minutos

O aluno espera um iced coffee, pedido **#24**. Outra cliente aponta um copo e pergunta **“Is this yours?”**. O primeiro copo é **SARAH / #18**; Sarah não é a personagem. Um mal-entendido dá início ao encontro, que segue até uma conversa à mesa e a despedida.

| Trecho | Conteúdo e ação | Estimativa |
|---|---|---|
| Entrada | Escolher apoio e começar | 2 min |
| Partes 1–2 | Pergunta, pistas de contexto, compreensão, preparação e envio real de “No, it’s not mine.” | 6 min |
| Partes 3–4 | Perguntar o pedido ou responder à desculpa; “Me too.” ou adaptação “Yes, it’s mine.”; pedidos chegam | 4 min |
| Parte 5 | Provar o café, escolher uma opinião e acompanhar a reação com “Really?” | 3 min |
| Parte 6 | Copo quase cai; usar “Careful!”; confirmar que ela segurou o copo | 2 min |
| Parte 7 | Cansaço, oportunidade de lembrar “Really?”, conferência e resposta conforme histórico real | 3 min |
| Parte 8 | Convite guiado para sentar; escolher assunto: inglês ou trabalho | 3 min |
| Parte 9 | Desenvolver o assunto e recombinar; decidir ficar mais ou sair | 3 min |
| Parte 10 | Quem fica pode usar “I like it here.”; ambos podem sugerir contato; despedida comum | 2 min |
| Retrospectiva e agradecimento | Rever participação real, concluir e avaliar opcionalmente | 2 min |

As estimativas somam 30 minutos; não justificam repetir atividades, bloquear botões por tempo ou inventar falas. Caminhos válidos podem ser mais curtos ou longos. Preservar os sete pontos binários e as 128 combinações narrativas já especificadas.

## 5. Conversa contínua e minigames

A fala da personagem, a intenção escolhida, a resposta enviada e a reação compõem um único encontro. As trocas anteriores permanecem consultáveis durante a experiência. A atividade atual aparece dentro desse fluxo; concluir uma montagem provoca a reação da outra pessoa, sem navegar para uma tela de prova.

Somente falas realmente ocorridas entram na conversa. Preparações, modelos consultados, erros internos e escolhas rejeitadas não se tornam falas enviadas. O histórico não mostra ramos que a pessoa não viveu.

- **Compreensão contextual:** “Esse café é seu?” versus “Você quer um café?”. Erro retorna às pistas, sem punição.
- **Montagem inicial:** `No / it’s not / mine`, com distrator `it’s`. A primeira montagem prepara; somente a etapa posterior envia à personagem.
- **Montagens curtas:** dois blocos para expressões novas, como “What did you / order?”. Não transformar toda resposta em puzzle.
- **Contraste contextual:** `Yes / it’s / mine`, conservando o contraste com `it’s not` e o pedido #24 consultável.
- **Expressões inteiras:** “It’s okay.”, “Me too.”, “Not really.” e despedidas quando previsto.
- **Tentativa mental e conferência:** “Really?” só aparece após Conferir ou ajuda explícita; não afirmar que o sistema observou lembrança independente.
- **Recombinação:** estruturas conhecidas com `your job`, `this café` ou `here`, conforme o caminho vivido.
- **Reação funcional:** “Careful!” é apresentado antes de Avisar, com tradução obrigatória e cena estática que espera pela pessoa.

Montagem funciona por seleção e teclado; arrastar não é necessário. Erros preservam blocos. Ajuda oferece contexto, estrutura e modelo quando pertinentes, com “Tentar sem o modelo” e “Usar com apoio”. Ajustar apoio preserva a montagem e as pistas já abertas.

## 6. Tradução e explicação

O inglês permanece nas falas. Português aparece como apoio à intenção e ao significado, não como uma tradução integral sempre aberta.

- Parte 1: não revelar a tradução completa antes da ponte “Entender a pergunta”.
- Parte 2: pistas `this`/`yours`, comparação #18/#24 e significado dos blocos no momento aprovado.
- Expressões novas: significado acessível na apresentação ou ajuda, conforme perfil e atividade.
- Parte 6: **“Careful! / Cuidado!”** sempre visível antes do uso.
- Parte 7: contexto de “I’m tired.” conforme apoio; esconder “Really?” até a oportunidade de tentar.
- Recombinações: explicar a peça nova e seu referente, sem aula gramatical obrigatória.
- Histórico real decide se uma expressão já foi usada, apenas encontrada ou ainda é nova.

## 7. Áudio e velocidade

Há um botão de ouvir junto às falas e modelos elegíveis. Ouvir não envia resposta nem avança a história. Depois do clique, a UI informa que está preparando o áudio quando necessário; texto, escolhas e ajuda continuam utilizáveis.

Um único player oferece reproduzir, pausar, cancelar e ouvir novamente. Nova reprodução interrompe a anterior. Troca de estado interrompe áudio abandonado. Retomar após reload não dispara reprodução automática. Quando houver sequência de referência do aluno e reação, respeitar essa ordem, sem sobreposição. Abertura não gera nem baixa os cinquenta áudios.

**Síntese inicial fixa no servidor:** endpoint `/v1/text-to-speech/{voiceId}/stream`, formato `mp3_44100_128`, modelo `eleven_flash_v2_5`, idioma `en`, velocidade `0.78`, stability `0.62`, similarity_boost `0.75`. `voiceId` vem exclusivamente de `ELEVENLABS_VOICE_ID`, sem fallback literal no código; chave em `ELEVENLABS_API_KEY`; armazenamento em `BLOB_READ_WRITE_TOKEN`.

**Controle proposto para a pessoa:** “Padrão” e “Mais lenta” alteram apenas a taxa de reprodução local do mesmo arquivo (1,0× e 0,9×). Não geram outro áudio. “Padrão” significa reproduzir o arquivo sintetizado a 0.78 sem alteração adicional. Mudanças futuras na velocidade de síntese são configuração do servidor e criam outra chave.

O roteiro anterior previa vozes distintas para personagem e aluno. A configuração solicitada agora fornece uma única variável de voz; esta proposta usa essa voz configurada para toda a demo. A aprovação desta revisão inclui essa mudança. Se duas vozes forem mantidas no futuro, cada voiceId real participa da chave e exige configuração server-side explícita.

## 8. API e chave determinística

Proposta: `POST /api/demo/audio` recebe **somente um audioId permitido do catálogo**, por exemplo `C01`. Não aceita texto livre, voiceId, modelo, velocidade de síntese ou URL de destino enviados pelo navegador. O servidor resolve o texto e todos os parâmetros. Recurso público, sem login, com validação de origem, limite de payload e rate limit; o rate limit não interfere na narrativa local.

Normalização conservadora do texto: Unicode NFC, quebras de linha/espaços normalizados e trim. Preservar maiúsculas, pontuação, contrações e palavras. Não transformar frases diferentes em uma só por normalização agressiva.

Chave SHA-256 da serialização canônica de:

`provider + schemaVersion + textoNormalizado + voiceId + speed + model + outputFormat + language + stability + similarityBoost`

Os cinco elementos exigidos pelo responsável sempre participam da chave; os demais evitam reutilizar um arquivo incompatível. Contexto/rota/usuário/runId não entram na chave quando não afetam a síntese. Diferentes páginas e IDs reaproveitam o mesmo registro global. Mesma frase e mesmos parâmetros nunca geram outra cópia apenas por mudar de participante.

Todo chamador do site, inclusive ferramentas futuras de produção, usa o mesmo serviço de cache. Não pode existir um caminho paralelo que chame o provedor ignorando esse controle.

## 9. Cache persistente global e concorrência

**Binário:** Vercel Blob em caminho determinístico e imutável `speech-cache/v3/{key}.mp3`, sem sufixo aleatório nem sobrescrita. O navegador recebe o arquivo já persistido através de URL opaca do Blob ou proxy da aplicação. Nenhuma URL contém chave de API, credencial, texto ou voiceId. A origem de mídia será permitida explicitamente na CSP após aprovação da arquitetura.

**Coordenação:** documento Firestore `speech_audio_cache_v3/{key}`, compartilhado por todas as instâncias e regiões que servem o site. Não usar lock em RAM como autoridade. Não alterar ou apagar o cache antigo.

| Campo | Responsabilidade |
|---|---|
| `key`, `schemaVersion`, `paramsHash` | Identidade e versão do registro |
| `status` | `reserved`, `request_started`, `ready` ou `blocked` |
| `ownerToken`, `leaseExpiresAt` | Dono da reserva e validade antes de iniciar a chamada |
| `providerAttemptCount` | Máximo de uma tentativa de geração para essa chave |
| `providerStartedAt`, `providerRequestId` quando disponível | Evidência de chamada iniciada e referência de conciliação |
| `blobPath`, `blobUrl`, `contentType`, `bytes`, `checksum` | Arquivo persistido validado |
| `createdAt`, `updatedAt`, `completedAt` | Auditoria operacional |
| `lastErrorCode`, `blockedReason` | Falha sanitizada e motivo de bloqueio, sem segredos |

Fluxo proposto:

1. Clique → servidor valida audioId e resolve texto/parâmetros → calcula chave.
2. Procura registro pronto e Blob correspondente. Se existe, retorna o áudio salvo.
3. Se o arquivo existe no caminho determinístico mas a finalização do registro falhou, reconcilia os metadados; não gera novamente.
4. Se não há arquivo/tentativa iniciada, uma transação adquire a reserva. Pedidos concorrentes recebem “em preparação” e consultam novamente com espera limitada.
5. O dono confirma atomicamente `request_started` e `providerAttemptCount = 1` antes da chamada. Um dono antigo ou reserva perdida não pode iniciar a geração.
6. Fora da transação, chama ElevenLabs uma vez, recebe e valida o áudio, grava no Blob e só então marca `ready`.
7. Todos os próximos pedidos reutilizam esse arquivo. Falha de cache/coordenação nunca aciona síntese como fallback.

Não colocar chamadas ElevenLabs ou uploads dentro de callbacks de transação: esses callbacks podem ser repetidos em conflitos. [Firestore: transações](https://firebase.google.com/docs/firestore/manage-data/transactions).

### Regra de custo diante de falha ambígua

Um lock com expiração, sozinho, não garante a regra de custo. Se uma Function morrer depois de o provedor receber o pedido e antes de o arquivo ser salvo, outra Function não sabe se já houve geração/cobrança.

**Política proposta:** depois de `request_started`, timeout, stream interrompido ou resultado desconhecido bloqueiam nova geração automática daquela chave. Expirar o lease não zera `providerAttemptCount`. Primeiro procurar/reconciliar o Blob ou evidência recuperável do pedido anterior; se isso não for possível, o áudio permanece indisponível e a história continua pelo texto.

Não foi identificado um contrato de idempotência na referência do endpoint consultado; esta proposta não presume que repetir o POST seja gratuito ou deduplicado. “Gerar uma vez” será aplicado como **no máximo uma tentativa de geração por chave**, privilegiando custo sobre disponibilidade quando o resultado for incerto. Não prometer simultaneamente recuperação automática irrestrita e ausência absoluta de cobrança duplicada. [ElevenLabs: stream speech](https://elevenlabs.io/docs/api-reference/text-to-speech/stream).

## 10. Erros e segurança

- Chave/voz/Blob ausentes: falhar antes de chamar o provedor; nenhum fallback de geração sem persistência.
- ID desconhecido/payload inválido: JSON 400; payload excessivo 413; método não aceito 405.
- Outro pedido preparando o mesmo áudio: JSON 202 com chave opaca e espera sugerida; polling não gera novamente.
- Limite excedido: JSON 429; narrativa e montagem permanecem locais e utilizáveis.
- Falha definitiva ou ambígua: mensagem breve de indisponibilidade, texto disponível e nenhuma confirmação de reprodução.
- Replay usa arquivo existente. Retry de leitura/reprodução não cria outra tentativa de síntese.
- Segredos somente no servidor; não retornar headers do provedor, exceções brutas, credenciais ou conteúdo de variáveis em logs/interface.
- Gravações contêm somente o texto aprovado do catálogo, sem entrada livre, voz pessoal ou dados de participantes.
- Não há login exigido para ouvir. O catálogo fechado limita o custo máximo de combinações acessíveis ao público.

## 11. Encerramento e pequena conquista

Preservar os três finais equivalentes: precisar sair e se despedir; ficar mais e se despedir; sugerir contato. Contato não é prêmio, não pede dado pessoal e pode ocorrer mesmo quando a pessoa precisa sair.

Reconhecimento: **“Você participou desta conversa em inglês.”** A retrospectiva abre com até três transformações que aconteceram naquele percurso; conversa completa fica disponível por escolha. Não afirmar fluência, domínio ou lembrança independente. Depois: **“Obrigado por experimentar o BasedSpeak.”** Avaliar é opcional; terminar não exige conta nem conduz a venda.

Avaliação remota/telemetria continuam uma decisão separada de coleta. Enquanto desativadas, preservar rascunho e nunca confirmar recebimento. Ativação depende de responsável, contato e retenção definidos.

## 12. Aceitação e implementação após aprovação

- Mesma marca e paleta verificadas contra a referência; interface própria e responsiva.
- Dez partes e 128 combinações preservadas; três perfis, ajuda, erros, retomada e três finais coerentes.
- Histórico contínuo, minigames contextualizados e transcript sem preparação/falas de ramos rejeitados.
- Vários pedidos simultâneos, inclusive de instâncias diferentes, produzem no máximo uma chamada ao provedor para a mesma chave.
- Reinício de processo, timeout após início e upload com resultado incerto não provocam geração duplicada.
- Cache pronto continua reutilizável por outro usuário e outra página. Replays e velocidade local não chamam TTS.
- Chaves e tokens ausentes do HTML, chunks cliente, URLs e logs. Sem login/microfone/pagamento na demo.
- Testes com provedor/armazenamento simulados antes de qualquer geração real. Publicação, provisionamento, mudanças remotas e teste com custo não ficam implicitamente autorizados pela aprovação do código.

Após aprovação: primeiro aplicar a identidade e a composição contínua; depois implementar o serviço global/cache e seus testes de concorrência/falha; integrar o player; atualizar os documentos anteriores e os CSVs para refletir esta revisão. Não restaurar os arquivos Orbit removidos.
