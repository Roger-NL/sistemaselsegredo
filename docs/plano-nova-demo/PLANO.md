# BasedSpeak: plano de substituição do site

**Data:** 23/10/2026. **Base auditada:** commit `b881b3e`. **Estado:** execução local iniciada; acompanhamento em [ANDAMENTO.md](ANDAMENTO.md). Ações remotas e deploy permanecem fora do escopo.

## 1. Decisão de escopo consolidada

O esclarecimento final do responsável prevalece: não há compradores, alunos ou serviços reais em andamento; os registros existentes são testes. A primeira entrega será a demo pública da cafeteria. Ela não pede nome, conta, login, microfone, pagamento ou acesso ao curso antigo.

Vamos substituir a experiência antiga, e não adicionar uma segunda aplicação por cima dela. Páginas e modelos de aluno, administração, gerência, login, cadastro, checkout, agenda, pilares, provas e especialidades serão retirados. Seus endereços continuarão tendo destino por redirecionamento. Não haverá pasta `legacy`, cópia de componentes, página escondida ou motor antigo mantido para consulta.

As integrações que o responsável pediu para preservar são uma exceção deliberada à remoção de código sem uso imediato: Firebase/Auth/Firestore, sessão segura, autorização, convites, Asaas, Calendar, produção de áudio/armazenamento e seus utilitários. Elas ficarão separadas, documentadas e testáveis, sem inicialização automática no visitante da demo.

**Preservar endereço não significa preservar tela. Preservar integração não significa manter o curso antigo para que ela compile.** Nenhuma remoção de código deste plano implica apagar usuários, documentos Firestore, cobranças, eventos Calendar, blobs, credenciais ou projetos externos.

## 2. Como usar este planejamento

| Documento | Responde |
|---|---|
| [ARQUIVOS.csv](ARQUIVOS.csv) | Destino de cada um dos 260 arquivos rastreados da base: ação, caminho futuro, motivo, pré-requisito e lote |
| [ROTAS.csv](ROTAS.csv) | Cada URL de página/API, método, destino e comportamento proposto |
| [INTEGRACOES.md](INTEGRACOES.md) | Onde cada integração existe hoje, onde ficará, configuração, banco e como conectá-la a uma página futura |
| [DEMO.md](DEMO.md) | Organização do novo motor, estados, recuperação, apoio, áudio, feedback e telemetria |
| [EXECUCAO.md](EXECUCAO.md) | Ordem de trabalho, dependências, testes e critérios objetivos para encerrar a limpeza |

Os caminhos atuais foram verificados. Caminhos futuros são propostas de implementação e **ainda não existem**. O CSV é uma lista de trabalho revisável, não um script de exclusão.

## 3. Resultado da auditoria

- 260 arquivos rastreados; 178 arquivos em `src`; 19 arquivos de rota API; 14 recursos em `public`; nove arquivos de testes; 12 relatórios Lighthouse antigos.
- Baseline local: **112 testes em nove arquivos passaram**, lint passou e TypeScript passou (`--noEmit --incremental false`).
- Build de produção, tamanho de chunks, navegação em browser e saúde de serviços externos não foram verificados nesta auditoria. Os checks locais não comprovam funcionamento de produção.
- Os conjuntos de estudo, órbita, landing, core visual, especialidades e dashboard examinados somam 15.678 linhas. Isso é contagem de fonte, não economia estimada de download.
- `.next` ocupa aproximadamente 2,2 GB e `node_modules` 1 GB no ambiente auditado. São artefatos locais regeneráveis. Apagá-los não demonstra redução de bundle.

### Acoplamentos que precisam ser resolvidos antes de apagar

| Evidência atual | Consequência | Trabalho obrigatório |
|---|---|---|
| `src/lib/payments/service.ts` e `src/lib/scheduling/service.ts` importam `auth/premium-access.ts`, que alcança progresso/currículo | Apagar `src/data` primeiro quebra integrações preservadas | Separar identidade, entitlement financeiro e reserva de agenda das regras de provas/pilares |
| `src/lib/auth/service.ts` mistura autenticação, usuário, progresso e estatísticas | Guardar esse arquivo inteiro perpetua o curso antigo | Extrair auth/perfil mínimos; remover updateUserProgress e os tipos curriculares |
| `src/context/AuthContext.tsx` contém POST/DELETE de `/api/auth/session` | Apagar apenas o provider perde parte da integração de sessão | Extrair sincronização de cookie para utilitário client independente de React/router |
| `/api/speech` importa `welcomeSpeechPhrases` de `app/inicio-orbita-7k3/conversation.ts` | A API impede excluir o protótipo | Extrair ElevenLabs/armazenamento para ferramenta de produção; retirar síntese pública durante a demo |
| `/api/verify-payment` importa tipo de `src/features/payment/payment-mode.ts` | Excluir `features/**` diretamente quebra API | Extrair o contrato útil para `src/contracts/payments.ts`; apagar estado visual antigo |
| Bootstrap Admin duplicado em `firebase-admin.ts` e `firebase-admin-firestore.ts` | Configuração e comportamento divergentes | Uma inicialização canônica, server-only e sob demanda |
| Fallbacks de erro usam neon; botão antigo usa Radix/CVA | Remover pacotes sem trocar os fallbacks quebra a aplicação | Reescrever fallbacks e botão simples antes de podar dependências |

## 4. O que fica e o que sai

| Área | Decisão final proposta |
|---|---|
| Next.js, React, TypeScript, Tailwind, lint e Vitest | Manter a plataforma; nenhuma migração de framework ou upgrade oportunista |
| Entrada `/` | Reescrever com a entrada já aprovada e escolha de apoio |
| Experiência `/demo` | Criar uma rota pública; as dez partes são estados internos, não dez páginas independentes |
| Páginas antigas de aluno/admin/auth/pagamento/agenda | Apagar implementação e layouts; manter URLs no mapa de aliases |
| Pilares, especialidades, quizzes, ranking, provas, XP/streak e progressão antigos | Retirar UI, regras, dados TypeScript e testes exclusivos após desacoplamento |
| Protótipo `inicio-orbita-7k3` | Retirar completamente; não reutilizar seu motor ou onboarding de nome |
| APIs de autenticação, convites, pagamentos e calendário | Preservar endereços, segurança e núcleo; adaptar dependências e estado de disponibilidade |
| APIs de exames, decisão de exames, progresso, heartbeat e ranking | Manter endereço com JSON 410; retirar implementação curricular |
| `/api/speech` | Manter endereço com JSON 410 na nova versão; preservar provedor como ferramenta de produção, não geração na visita |
| `termos` e `privacidade` | Manter rotas e adaptar texto ao produto real, sem providers antigos |
| Documentos/arte/PDFs novos em `output` | Preservar como materiais atuais do produto, fora do runtime |
| Relatórios, scripts de atualização e conteúdo antigos | Retirar conforme manifesto; não executar scripts mutadores para limpar |
| Dados remotos, segredos e vínculo de infraestrutura | Preservar; nenhum reset de banco ou alteração externa faz parte desta limpeza |

### Pacotes

**Manter:** `next`, `react`, `react-dom`, TypeScript/tipos, ESLint/config Next, Tailwind/PostCSS, Vitest; `firebase`, `firebase-admin`, `server-only`; `googleapis`, `date-fns`, `date-fns-tz`; `@vercel/blob`; `clsx`, `tailwind-merge`; `lucide-react` com imports nomeados na UI nova.

**Retirar ao remover os últimos consumidores:** `d3`, `@types/d3`, `@types/geojson`, `crypto-js`, `@types/crypto-js`, `framer-motion`, `@radix-ui/react-slot`, `class-variance-authority`. O botão novo será nativo e pequeno; as telas de erro também passam a usá-lo. Não manter o botão velho apenas para justificar dois pacotes.

**Não acrescentar por padrão:** Redux, XState, CMS, banco novo, Redis, SDK de LLM, tradução em tempo real, framework de animação ou geração de mídia durante a conversa. O grafo é pequeno, fechado e determinístico.

Firebase browser e Google APIs podem permanecer no projeto para as integrações reservadas sem entrar no bundle da demo. O grafo de imports da fronteira client determina esse carregamento; por isso a separação será verificada no build, não inferida apenas do `package.json`. [Referência Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## 5. Organização futura única

Não misturar duas convenções de servidor. Adotar este mapa; os caminhos detalhados de migração estão no manifesto.

```text
src/
  app/
    page.tsx                         entrada pública
    demo/page.tsx                    host público da experiência
    (public)/termos/page.tsx          páginas legais sem auth global
    (public)/privacidade/page.tsx
    api/                             URLs existentes + três endpoints demo
    layout.tsx, globals.css           shell, tokens e base mínimos
    error.tsx, global-error.tsx, not-found.tsx
  features/demo/
    DemoEntry.tsx, DemoExperience.tsx
    content/parts/part-01.ts ... part-10.ts
    content/media.ts, content/copy.pt-BR.ts
    model/types.ts, model/reducer.ts, model/history.ts
    model/support.ts, model/retrospective.ts
    components/                      cena, fala, intenções, blocos, ajuda, final
    audio/player.ts                   um player de recursos prontos
    session/storage.ts               snapshot local versionado
    services/api-client.ts           somente APIs /api/demo/*
  client/auth/
    firebase.ts, service.ts, session.ts, navigation.ts
  server/
    firebase.ts                      Admin Auth/Firestore canônico
    auth/                            principal, autorização, cookie, convites
    access/service.ts                entitlement independente do currículo
    integrations/                    Asaas, Calendar, ElevenLabs, Blob
    payments/                        checkout, reconciliação e webhook
    scheduling/                      reservas/locks sem provas ou pilares
    demo/                            sessão anônima, eventos, feedback
    http/                            leitura/validação, rate-limit, resposta 410
  contracts/                         tipos compartilháveis; sem SDK/credenciais
  components/ui/button.tsx            base visual mínima reescrita
  lib/routes.ts, lib/ui/cn.ts          rotas e pequeno utilitário compartilhado
  proxy.ts                           somente aliases browser; não auth da demo
public/demo/cafe/v1/images/           nove ilustrações finais
public/demo/cafe/v1/audio/            cinquenta arquivos de voz finais
scripts/                             operação preservada + produção de mídia
tests/                               contratos preservados e invariantes da demo
docs/plano-nova-demo/                 este plano
```

O mapa não obriga criar arquivos vazios. Um módulo nasce quando tem uma responsabilidade concreta. As integrações não exportam um grande `index.ts` que faça o browser importar tudo por acidente. Contratos compartilhados contêm apenas tipos/validações puras que realmente serão compartilhados.

## 6. Navegação e endereços guardados

Proposta: `/` apresenta a entrada; `/demo` contém a conversa, retrospectiva e avaliação. Acesso direto a `/demo` sem apoio/sessão válidos volta à escolha de apoio, sem assumir um perfil. `/termos` e `/privacidade` continuam acessíveis.

As famílias antigas de páginas (login, cadastro, pagamento, dashboard, pilares, especialidades, perfil, boletim, configurações, agenda, obrigado, órbita e admin) respondem com **307 para `/`**. Assim o destino existe, e os endereços podem ser reassumidos no futuro sem um redirecionamento permanente em cache. A resposta não repassa query de callback, cobrança ou tokens para a demo.

O `proxy.ts` será simplificado para os aliases explicitamente listados em `ROTAS.csv`. Construir a URL de destino a partir da origem e `/`, descartando a query. Não aplicar redirect genérico a `/api`, assets, `/demo` ou toda rota desconhecida. Rotas desconhecidas continuam 404. As verificações de identidade e papel ficam nos handlers/serviços protegidos; o proxy atual verifica só presença de cookie e não é autoridade de acesso. [Referência Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

No futuro, reativar `/login` significa retirar esse alias, criar sua nova interface e conectar os serviços documentados. Não há tela de login nova a implementar nesta etapa.

## 7. Regras operacionais recomendadas para implementar sem inventar comportamento

Estas escolhas completam lacunas identificadas anteriormente. São propostas deste plano, não afirmações de que já foram implementadas ou testadas com alunos.

1. **Retomada:** snapshot no mesmo navegador, no ponto exato, preservando blocos, pistas abertas, apoio, escolhas, falas realmente enviadas e retrospectiva. Não retomar áudio automaticamente. Persistência indisponível não impede a conversa; informar apenas a limitação de retomada.
2. **Reinício:** ação explícita, confirmação para descartar uma tentativa em andamento e novo identificador. Limpar somente chaves da demo; apoio volta a nenhuma seleção. Voltar no navegador não reescreve decisões já enviadas.
3. **Parte 2:** primeiro `Responder` valida preparação; depois de frase/áudio/significado, `Continuar` abre “Agora responda à personagem”. Apenas o segundo envio ou uso apoiado nessa etapa registra a fala e provoca “Oh! Sorry!”. Ajuda na preparação não salta o envio real.
4. **Feedback:** enviar opção e/ou comentário não vazio; confirmação somente após gravação recuperável. Falha mantém conteúdo e permite nova tentativa ou terminar sem enviar. Cliques duplicados não criam duas avaliações.
5. **Localização inicial:** português na primeira implementação; as três preferências são apoio, não idiomas. Os PDFs em espanhol/alemão servem como material de validação e fonte de localização posterior, sem triplicar a história ou criar seletor de idioma não aprovado.

Se o responsável escolher outra política, alterar esta seção antes do lote correspondente, sem reabrir as falas e a narrativa. Isso não impede concluir a auditoria, inventário e projeto de código nesta etapa.

## 8. Materiais e limite entre apresentação e produto

Fonte funcional: narrativa e mecânicas completas aprovadas das partes 1-10, com refinamentos posteriores. O PDF detalhado anterior documenta essa base. Os PDFs de 22 páginas são recortes de apresentação, não especificação de todas as atividades.

As quatro artes produzidas para os PDFs não substituem automaticamente as nove ilustrações de produção. O conjunto de 50 áudios ainda precisa ser produzido/validado. Não usar o cache antigo como se fosse a biblioteca final. A primeira implementação pode usar referências provisórias identificadas em desenvolvimento; a aceitação pública exige as nove imagens e os cinquenta arquivos corretos.

## 9. Ordem e conclusão

Executar os lotes de [EXECUCAO.md](EXECUCAO.md): primeiro extrair integrações, depois criar a fronteira pública, depois retirar consumidores antigos, depois limpar arquivos/pacotes e validar. Ao concluir, o curso antigo não continua escondido: sua lógica foi removida. O que fica reservado tem localização, contrato, teste e condição de reativação.

Este plano está completo para iniciar a preparação de implementação após revisão das políticas operacionais acima. Nesta entrega, **somente documentos de planejamento foram criados**. Não houve alteração de páginas, handlers, dependências, regras, banco, segredos ou publicação.
