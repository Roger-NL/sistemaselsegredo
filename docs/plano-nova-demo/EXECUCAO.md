# Ordem de execução para a substituição

Execução local autorizada em 23/10/2026, seguindo os lotes abaixo. Estado e evidências em [ANDAMENTO.md](ANDAMENTO.md). Não publicar regras, fazer deploy ou alterar serviços/dados remotos.

## Princípios de execução

- Fazer a troca num branch de trabalho, em lotes revisáveis, preservando a versão-base em Git. O usuário autorizou a remoção futura da experiência antiga, não a perda de documentos remotos/segredos.
- Implementar primeiro o destino público e os contratos preservados; apagar consumidores depois que o grafo confirmar que ficaram independentes.
- Não criar cópia `legacy`, tela antiga escondida, rota mock de login ou estrutura vazia “para depois”. Integração futura é preservada como serviço/handler documentado e testável.
- Cada lote atualiza `ARQUIVOS.csv`, `ROTAS.csv` e testes junto com o código. Nada de scripts de exclusão em massa sem revisão.

## Lotes e dependências

| Lote | Trabalho | Depende de | Critério de aceite |
|---|---|---|---|
| 0. Preparação | Confirmar branch/base, inventário de rotas e estado do build; criar referência recuperável em Git; congelar contratos e destino 307/410 | Plano aprovado | `git diff` limitado ao lote; sem alteração de infra/banco; rota antiga e API listadas |
| 1. Isolar integrações | Bootstrap Admin único; extrair sessão client; separar auth mínima de progresso; extrair contrato payment-mode; retirar dependência curricular de entitlement/payment/scheduling; extrair voz da rota órbita; definir contratos Calendar | Lote 0 | Auth, convites, checkout/reconciliação/webhook e scheduling compõem com testes; zero import para `src/data`/UI antiga nesses serviços; segredos server-only |
| 2. Construir demo isolada | Criar shell público `/` + `/demo`, conteúdo determinístico 1–10, reducer puro, mídia, perfil de apoio, ajuda, persistência local, retrospectiva e avaliação; endpoints demo conforme decisão de coleta | Lote 1 para integrações de feedback/telemetria, mas shell local pode avançar em paralelo | Caminhos narrativos chegam aos finais; acessibilidade por teclado; falha de áudio/storage/rede não impede uso; sem login/mic/pagamento no bundle/fluxo |
| 3. Preservar destinos de URL | Simplificar `proxy.ts` com aliases explícitos de páginas para 307 `/`; manter legal e recursos; APIs curriculares em JSON 410; APIs de integração com JSON/guardas preservados | Lotes 1 e 2 | Nenhum loop; query sensível não encaminhada; APIs não recebem HTML; desconhecida permanece 404; teste por URL e método |
| 4. Remover produto antigo | Excluir páginas, layouts, providers, órbita, componentes, dados, modelos de página, código de currículo, provas/progresso/ranking e scripts/relatórios listados como REMOVER | Lotes 1–3 | Busca de imports não encontra consumidores; nenhuma página velha ou arquivo legado duplicado; aliases cobrem URLs listadas |
| 5. Limpeza de recursos | Remover assets antigos e dependências sem consumidor; reescrever README e exemplos de env; revisar CSP, Firebase rules/indexes, manifest/sitemap e legal | Lote 4 | lockfile coerente; dependências justificadas por imports; documentação não expõe segredos; regras/índices revisados sem mutação remota automática |
| 6. Verificação final | Executar testes, lint, TypeScript, build; checar bundle cliente, mídia, rotas e contratos de API; revisar diff arquivo a arquivo | Lote 5 | critérios de prontidão abaixo satisfeitos; plano e CSV atualizados; nenhuma alteração externa não autorizada |

Lotes 1 e 2 podem ter implementação independente depois do contrato do lote 0; a integração final ocorre antes dos redirects definitivos e da remoção.

## Testes e verificações necessários na implementação

**Unidade/contrato:** reducer de demo e todas as transições; geração de transcript; apoio e histórico; validação de blocos; persistência versionada/corrompida; idempotência de feedback; JSON 410; guards de auth/admin; pagamento e scheduling sem currículo.

**Rotas:** testar todos os aliases como 307 para `/`, sem preservar query; confirmar `/termos`, `/privacidade`, `/`, `/demo`, favicon, manifest, robots e sitemap; APIs aposentadas retornam JSON 410 em seus métodos atuais; APIs preservadas mantêm status/conteúdo JSON e autenticação. Métodos não aceitos continuam 405.

**Integração de UI:** executar percurso completo para os três perfis e os dois ramos das escolhas, incluindo os três finais; caminho curto e longo; reload em cada estado relevante; áudio falhando; storage indisponível; falha de rede; feedback com escolha, comentário e ambos vazios.

**Fronteira client/server:** inspeção do grafo e chunks para garantir ausência de Firebase Admin, credenciais, Asaas, Calendar e código de currículo no browser. Todas as nove imagens e cinquenta vozes do manifesto existem e retornam sucesso. Não carregar todos os áudios na entrada.

**Regressão:** confirmar 19 rotas API inventariadas e contratos explicitamente preservados/aposentados. Antes da implementação, baseline registrada nesta auditoria foi 112 testes, lint e TypeScript aprovados; repetir após a mudança e explicar diferenças. Build ainda não foi verificado na auditoria base.

## Critérios de conclusão do plano aplicado

1. Entrada e experiência pública funcionam sem auth, cadastro, pagamento, microfone ou SDK desnecessário.
2. Cada um dos caminhos suportados mostra somente falas que ocorreram e termina com retrospectiva coerente.
3. Rotas browser antigas listadas têm destino explícito; nenhuma API de integração é convertida para redirect HTML.
4. Auth/sessão, convites, Asaas e Calendar continuam localizáveis, server-side e desacoplados do curso antigo, mesmo que sem páginas para chamá-los agora.
5. Currículo antigo, telas e modelos administrativos não permanecem em cópia, pasta arquivada ou rota oculta.
6. Nenhum documento remoto, configuração de Firebase/Vercel/Calendar/Asaas ou segredo foi excluído/alterado pela limpeza de código.
7. `ARQUIVOS.csv` e `ROTAS.csv` refletem exatamente o estado pós-implementação e diferenciam `MANTER`, `ADAPTAR`, `MOVER`, `REMOVER` e `REDIRECIONAR/410`.
